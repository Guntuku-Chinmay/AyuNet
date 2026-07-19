import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, branch: true },
    });
    if (!visit || visit.deletedAt) {
      throw new NotFoundException(`Visit with ID '${id}' not found.`);
    }
    return visit;
  }

  async findAll(query: { patientId?: string; doctorId?: string; visitStatus?: VisitStatus }) {
    const where: any = { deletedAt: null };
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.visitStatus) where.visitStatus = query.visitStatus;

    return this.prisma.visit.findMany({
      where,
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, branch: true },
      orderBy: { checkInAt: 'desc' },
    });
  }

  async update(id: string, dto: { checkOutAt?: Date; visitStatus?: VisitStatus }, updaterId?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit || visit.deletedAt) {
      throw new NotFoundException(`Visit with ID '${id}' not found.`);
    }

    return this.prisma.visit.update({
      where: { id },
      data: {
        checkOutAt: dto.checkOutAt,
        visitStatus: dto.visitStatus,
        updatedBy: updaterId,
      },
    });
  }
}
