import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddAllergyDto } from './dto/add-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Injectable()
export class AllergiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: AddAllergyDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    // Check duplicate
    const existing = await this.prisma.allergy.findFirst({
      where: {
        patientId: dto.patientId,
        allergen: { equals: dto.allergen.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Patient is already recorded as allergic to '${dto.allergen}'.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const allergy = await tx.allergy.create({
        data: {
          patientId: dto.patientId,
          allergen: dto.allergen.trim(),
          allergyType: dto.allergyType,
          severity: dto.severity,
          reaction: dto.reaction?.trim() || null,
          status: dto.status || 'ACTIVE',
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'ALLERGY_ADDED', 'Allergy', allergy.id, null, allergy, ipAddress, userAgent, tx);
      return allergy;
    });
  }

  async update(id: string, dto: UpdateAllergyDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    if (!allergy || allergy.deletedAt) {
      throw new NotFoundException(`Allergy record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.allergy.update({
        where: { id },
        data: {
          allergen: dto.allergen ? dto.allergen.trim() : undefined,
          allergyType: dto.allergyType,
          severity: dto.severity,
          reaction: dto.reaction !== undefined ? (dto.reaction?.trim() || null) : undefined,
          status: dto.status,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'ALLERGY_UPDATED', 'Allergy', id, allergy, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    if (!allergy || allergy.deletedAt) {
      throw new NotFoundException(`Allergy record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.allergy.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'ALLERGY_REMOVED', 'Allergy', id, allergy, deleted, ipAddress, userAgent, tx);
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
