import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface QueueState {
  priority: 'REGULAR' | 'VIP' | 'EMERGENCY';
  isSkipped: boolean;
  isRecalled: boolean;
  recallCount: number;
}

@Injectable()
export class QueueService {
  private visitStates = new Map<string, QueueState>();

  constructor(private prisma: PrismaService) {}

  private getOrInitializeState(visitId: string): QueueState {
    let state = this.visitStates.get(visitId);
    if (!state) {
      state = {
        priority: 'REGULAR',
        isSkipped: false,
        isRecalled: false,
        recallCount: 0,
      };
      this.visitStates.set(visitId, state);
    }
    return state;
  }

  async setPriority(visitId: string, priority: 'REGULAR' | 'VIP' | 'EMERGENCY', _actorId?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.deletedAt) {
      throw new NotFoundException(`Visit with ID '${visitId}' not found.`);
    }

    const state = this.getOrInitializeState(visitId);
    state.priority = priority;

    return { visitId, ...state };
  }

  async skipPatient(visitId: string, _actorId?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.deletedAt) {
      throw new NotFoundException(`Visit with ID '${visitId}' not found.`);
    }

    const state = this.getOrInitializeState(visitId);
    state.isSkipped = true;

    return { visitId, ...state };
  }

  async recallPatient(visitId: string, _actorId?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.deletedAt) {
      throw new NotFoundException(`Visit with ID '${visitId}' not found.`);
    }

    const state = this.getOrInitializeState(visitId);
    state.isRecalled = true;
    state.isSkipped = false;
    state.recallCount += 1;

    return { visitId, ...state };
  }

  async getDailyQueue(doctorId?: string, departmentId?: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = {
      visitStatus: 'ACTIVE',
      createdAt: { gte: today },
      deletedAt: null,
    };

    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (branchId) {
      where.branchId = branchId;
    }
    if (departmentId) {
      where.doctor = {
        doctorBranches: {
          some: {
            branch: {
              departments: {
                some: { id: departmentId },
              },
            },
          },
        },
      };
    }

    const visits = await this.prisma.visit.findMany({
      where,
      include: {
        patient: { include: { userProfile: true } },
        doctor: { include: { userProfile: true } },
        branch: true,
      },
    });

    const queueList = visits.map((visit) => {
      const state = this.getOrInitializeState(visit.id);
      return {
        visit,
        ...state,
      };
    });

    queueList.sort((a, b) => {
      const aWeight = this.calculateWeight(a);
      const bWeight = this.calculateWeight(b);
      return aWeight - bWeight;
    });

    return queueList.map((item, idx) => ({
      position: idx + 1,
      visitId: item.visit.id,
      patientName: `${item.visit.patient.userProfile.firstName} ${item.visit.patient.userProfile.lastName}`,
      doctorName: `Dr. ${item.visit.doctor.userProfile.firstName} ${item.visit.doctor.userProfile.lastName}`,
      branchName: item.visit.branch.name,
      checkInAt: item.visit.checkInAt,
      priority: item.priority,
      isSkipped: item.isSkipped,
      isRecalled: item.isRecalled,
      recallCount: item.recallCount,
    }));
  }

  private calculateWeight(item: any): number {
    let weight = item.visit.checkInAt.getTime();

    if (item.priority === 'EMERGENCY') {
      weight -= 2000000000000;
    } else if (item.priority === 'VIP') {
      weight -= 1000000000;
    }

    if (item.isRecalled) {
      weight -= 500000000000;
    }

    if (item.isSkipped) {
      weight += 1000000000000;
    }

    return weight;
  }
}
