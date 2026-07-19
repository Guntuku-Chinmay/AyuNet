import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLabTestDto } from './dto/create-test.dto';
import { UpdateLabTestDto } from './dto/update-test.dto';

@Injectable()
export class LabTestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLabTestDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.labTest.findUnique({
      where: { code: dto.code.trim() },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Lab test with code '${dto.code}' is already registered in catalog.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const test = await tx.labTest.create({
        data: {
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          sampleType: dto.sampleType.trim(),
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'LAB_TEST_CATALOG_CREATED', 'LabTest', test.id, null, test, ipAddress, userAgent, tx);
      return test;
    });
  }

  async update(id: string, dto: UpdateLabTestDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const test = await this.prisma.labTest.findUnique({ where: { id } });
    if (!test || test.deletedAt) {
      throw new NotFoundException(`Lab test with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.labTest.update({
        where: { id },
        data: {
          code: dto.code ? dto.code.trim().toUpperCase() : undefined,
          name: dto.name ? dto.name.trim() : undefined,
          description: dto.description !== undefined ? (dto.description?.trim() || null) : undefined,
          sampleType: dto.sampleType ? dto.sampleType.trim() : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'LAB_TEST_CATALOG_UPDATED', 'LabTest', id, test, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const test = await this.prisma.labTest.findUnique({ where: { id } });
    if (!test || test.deletedAt) {
      throw new NotFoundException(`Lab test with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.labTest.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'LAB_TEST_CATALOG_DELETED', 'LabTest', id, test, deleted, ipAddress, userAgent, tx);
      return deleted;
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.labTest.findUnique({ where: { id } });
    if (!test || test.deletedAt) {
      throw new NotFoundException(`Lab test with ID '${id}' not found.`);
    }
    return test;
  }

  async findAll(query?: string) {
    const where: any = { deletedAt: null };
    if (query) {
      where.OR = [
        { code: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ];
    }
    return this.prisma.labTest.findMany({
      where,
      orderBy: { name: 'asc' },
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
