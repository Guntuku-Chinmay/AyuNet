import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicineDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.medicine.findFirst({
      where: {
        brandName: { equals: dto.brandName.trim(), mode: 'insensitive' },
        genericName: { equals: dto.genericName.trim(), mode: 'insensitive' },
        strength: { equals: dto.strength.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Medicine '${dto.brandName} (${dto.genericName}) ${dto.strength}' already exists in catalog.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const medicine = await tx.medicine.create({
        data: {
          brandName: dto.brandName.trim(),
          genericName: dto.genericName.trim(),
          form: dto.form,
          strength: dto.strength.trim(),
          manufacturer: dto.manufacturer?.trim() || null,
          description: dto.description?.trim() || null,
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'MEDICINE_CATALOG_CREATED', 'Medicine', medicine.id, null, medicine, ipAddress, userAgent, tx);
      return medicine;
    });
  }

  async update(id: string, dto: UpdateMedicineDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException(`Medicine record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.medicine.update({
        where: { id },
        data: {
          brandName: dto.brandName ? dto.brandName.trim() : undefined,
          genericName: dto.genericName ? dto.genericName.trim() : undefined,
          form: dto.form,
          strength: dto.strength ? dto.strength.trim() : undefined,
          manufacturer: dto.manufacturer !== undefined ? (dto.manufacturer?.trim() || null) : undefined,
          description: dto.description !== undefined ? (dto.description?.trim() || null) : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'MEDICINE_CATALOG_UPDATED', 'Medicine', id, medicine, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException(`Medicine record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.medicine.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'MEDICINE_CATALOG_DELETED', 'Medicine', id, medicine, deleted, ipAddress, userAgent, tx);
      return deleted;
    });
  }

  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException(`Medicine with ID '${id}' not found.`);
    }
    return medicine;
  }

  async findAll(query?: string) {
    const where: any = { deletedAt: null };
    if (query) {
      where.OR = [
        { brandName: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
      ];
    }
    return this.prisma.medicine.findMany({ where, orderBy: { brandName: 'asc' } });
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
