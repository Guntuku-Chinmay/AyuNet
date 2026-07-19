import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddConditionDto } from './dto/add-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';

@Injectable()
export class ChronicConditionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: AddConditionDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    // Check duplicate
    const existing = await this.prisma.chronicCondition.findFirst({
      where: {
        patientId: dto.patientId,
        conditionName: { equals: dto.conditionName.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Patient is already recorded as having condition '${dto.conditionName}'.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const condition = await tx.chronicCondition.create({
        data: {
          patientId: dto.patientId,
          conditionName: dto.conditionName.trim(),
          code: dto.code?.trim() || null,
          diagnosedDate: dto.diagnosedDate ? new Date(dto.diagnosedDate) : null,
          status: dto.status,
          notes: dto.notes?.trim() || null,
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'CHRONIC_CONDITION_ADDED', 'ChronicCondition', condition.id, null, condition, ipAddress, userAgent, tx);
      return condition;
    });
  }

  async update(id: string, dto: UpdateConditionDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const condition = await this.prisma.chronicCondition.findUnique({ where: { id } });
    if (!condition || condition.deletedAt) {
      throw new NotFoundException(`Chronic condition record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.chronicCondition.update({
        where: { id },
        data: {
          conditionName: dto.conditionName ? dto.conditionName.trim() : undefined,
          code: dto.code !== undefined ? (dto.code?.trim() || null) : undefined,
          diagnosedDate: dto.diagnosedDate !== undefined ? (dto.diagnosedDate ? new Date(dto.diagnosedDate) : null) : undefined,
          status: dto.status,
          notes: dto.notes !== undefined ? (dto.notes?.trim() || null) : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'CHRONIC_CONDITION_UPDATED', 'ChronicCondition', id, condition, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const condition = await this.prisma.chronicCondition.findUnique({ where: { id } });
    if (!condition || condition.deletedAt) {
      throw new NotFoundException(`Chronic condition record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.chronicCondition.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'CHRONIC_CONDITION_REMOVED', 'ChronicCondition', id, condition, deleted, ipAddress, userAgent, tx);
      return deleted;
    });
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
