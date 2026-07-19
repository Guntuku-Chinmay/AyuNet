import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

@Injectable()
export class SpecializationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSpecializationDto, userId?: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.specialization.findFirst({
      where: { name: { equals: dto.name.trim(), mode: 'insensitive' }, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`Specialization with name '${dto.name}' already exists.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const specialization = await tx.specialization.create({
        data: {
          name: dto.name.trim(),
          description: dto.description ? dto.description.trim() : null,
          createdBy: userId,
        },
      });

      await this.createAuditLog(userId, 'SPECIALIZATION_CREATED', 'Specialization', specialization.id, null, specialization, ipAddress, userAgent, tx);
      return specialization;
    });
  }

  async update(id: string, dto: UpdateSpecializationDto, userId?: string, ipAddress?: string, userAgent?: string) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
    });
    if (!specialization || specialization.deletedAt) {
      throw new NotFoundException(`Specialization with ID '${id}' not found.`);
    }

    if (dto.name) {
      const existing = await this.prisma.specialization.findFirst({
        where: { name: { equals: dto.name.trim(), mode: 'insensitive' }, id: { not: id }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Specialization with name '${dto.name}' already exists.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.specialization.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          description: dto.description ? dto.description.trim() : undefined,
          updatedBy: userId,
        },
      });

      await this.createAuditLog(userId, 'SPECIALIZATION_UPDATED', 'Specialization', id, specialization, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, userId?: string, ipAddress?: string, userAgent?: string) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
    });
    if (!specialization || specialization.deletedAt) {
      throw new NotFoundException(`Specialization with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.specialization.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      await this.createAuditLog(userId, 'SPECIALIZATION_DELETED', 'Specialization', id, specialization, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async findOne(id: string) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
    });
    if (!specialization || specialization.deletedAt) {
      throw new NotFoundException(`Specialization with ID '${id}' not found.`);
    }
    return specialization;
  }

  async findAll() {
    return this.prisma.specialization.findMany({
      where: { deletedAt: null },
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
