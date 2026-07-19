import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LinkCaregiverDto } from './dto/link-caregiver.dto';

@Injectable()
export class PatientCaregiversService {
  // Map of "patientId:caregiverId" to link status (PENDING, APPROVED, REJECTED)
  private linkStatuses = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async linkCaregiver(patientId: string, dto: LinkCaregiverDto, user: any, ipAddress?: string, userAgent?: string) {
    // Security check: patient can only request for themselves
    await this.checkPatientSelfOrAdmin(patientId, user);

    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${patientId}' not found.`);
    }

    const caregiver = await this.prisma.caregiver.findUnique({ where: { id: dto.caregiverId } });
    if (!caregiver || caregiver.deletedAt) {
      throw new NotFoundException(`Caregiver with ID '${dto.caregiverId}' not found.`);
    }

    // Check duplicate
    const existing = await this.prisma.patientCaregiver.findUnique({
      where: { patientId_caregiverId: { patientId, caregiverId: dto.caregiverId } },
    });
    if (existing) {
      throw new ConflictException('Caregiver is already linked to this patient.');
    }

    return this.prisma.$transaction(async (tx) => {
      const link = await tx.patientCaregiver.create({
        data: {
          patientId,
          caregiverId: dto.caregiverId,
          relationshipType: dto.relationshipType,
          accessLevel: dto.accessLevel,
          createdBy: user.id,
        },
        include: { caregiver: { include: { userProfile: true } } },
      });

      const key = `${patientId}:${dto.caregiverId}`;
      this.linkStatuses.set(key, 'PENDING');

      const result = {
        ...link,
        status: 'PENDING',
      };

      await this.createAuditLog(user.id, 'CAREGIVER_LINK_REQUESTED', 'PatientCaregiver', key, null, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async approveRequest(patientId: string, caregiverId: string, user: any, ipAddress?: string, userAgent?: string) {
    // Only patient can approve caregivers for themselves
    await this.checkPatientSelfOrAdmin(patientId, user);

    const key = `${patientId}:${caregiverId}`;
    const status = this.linkStatuses.get(key);
    if (!status) {
      throw new NotFoundException('Caregiver request not found.');
    }
    if (status === 'APPROVED') {
      throw new BadRequestException('Request is already approved.');
    }

    this.linkStatuses.set(key, 'APPROVED');

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(user.id, 'CAREGIVER_LINK_APPROVED', 'PatientCaregiver', key, { status: 'PENDING' }, { status: 'APPROVED' }, ipAddress, userAgent, tx);
    });

    return { success: true, status: 'APPROVED' };
  }

  async rejectRequest(patientId: string, caregiverId: string, user: any, ipAddress?: string, userAgent?: string) {
    await this.checkPatientSelfOrAdmin(patientId, user);

    const key = `${patientId}:${caregiverId}`;
    const status = this.linkStatuses.get(key);
    if (!status) {
      throw new NotFoundException('Caregiver request not found.');
    }

    this.linkStatuses.delete(key);

    await this.prisma.$transaction(async (tx) => {
      await tx.patientCaregiver.delete({
        where: { patientId_caregiverId: { patientId, caregiverId } },
      });

      await this.createAuditLog(user.id, 'CAREGIVER_LINK_REJECTED', 'PatientCaregiver', key, { status }, { status: 'REJECTED' }, ipAddress, userAgent, tx);
    });

    return { success: true, status: 'REJECTED' };
  }

  async removeCaregiver(patientId: string, caregiverId: string, user: any, ipAddress?: string, userAgent?: string) {
    // Either patient or the caregiver themselves can remove linkage
    await this.checkPatientSelfOrCaregiverSelfOrAdmin(patientId, caregiverId, user);

    const link = await this.prisma.patientCaregiver.findUnique({
      where: { patientId_caregiverId: { patientId, caregiverId } },
    });
    if (!link) {
      throw new NotFoundException('Linkage not found.');
    }

    const key = `${patientId}:${caregiverId}`;
    this.linkStatuses.delete(key);

    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.patientCaregiver.delete({
        where: { patientId_caregiverId: { patientId, caregiverId } },
      });

      await this.createAuditLog(user.id, 'CAREGIVER_LINK_REMOVED', 'PatientCaregiver', key, link, removed, ipAddress, userAgent, tx);
      return { success: true };
    });
  }

  async getLinkedCaregivers(patientId: string, user: any) {
    await this.checkPatientSelfOrCaregiverSelfOrAdmin(patientId, undefined, user);

    const list = await this.prisma.patientCaregiver.findMany({
      where: { patientId },
      include: { caregiver: { include: { userProfile: true } } },
    });

    return list.map((item) => {
      const key = `${patientId}:${item.caregiverId}`;
      const status = this.linkStatuses.get(key) || 'APPROVED'; // default to APPROVED if already in DB
      return {
        ...item,
        status,
      };
    });
  }

  private async checkPatientSelfOrAdmin(patientId: string, user: any) {
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN')) {
      return;
    }
    if (user.roles?.includes('PATIENT')) {
      const patient = await this.prisma.patient.findFirst({
        where: { userProfile: { userId: user.id }, deletedAt: null },
      });
      if (patient && patient.id === patientId) {
        return;
      }
    }
    throw new ForbiddenException('You do not have access to manage this patient caregiver configuration.');
  }

  private async checkPatientSelfOrCaregiverSelfOrAdmin(patientId: string, caregiverId: string | undefined, user: any) {
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN')) {
      return;
    }
    if (user.roles?.includes('PATIENT')) {
      const patient = await this.prisma.patient.findFirst({
        where: { userProfile: { userId: user.id }, deletedAt: null },
      });
      if (patient && patient.id === patientId) {
        return;
      }
    }
    if (user.roles?.includes('CAREGIVER') && caregiverId) {
      const caregiver = await this.prisma.caregiver.findFirst({
        where: { userProfile: { userId: user.id }, deletedAt: null },
      });
      if (caregiver && caregiver.id === caregiverId) {
        return;
      }
    }
    throw new ForbiddenException('You do not have access to modify this linkage.');
  }

  private async createAuditLog(
    actorId: string | undefined,
    action: string,
    entityName: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'system',
    tx: any
  ) {
    await tx.auditLog.create({
      data: {
        actorId,
        action,
        entityName,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
        createdBy: actorId,
      },
    });
  }
}
