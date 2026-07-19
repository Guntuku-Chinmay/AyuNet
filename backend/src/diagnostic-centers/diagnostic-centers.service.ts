import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDiagnosticCenterDto } from './dto/create-center.dto';
import { UpdateDiagnosticCenterDto } from './dto/update-center.dto';

@Injectable()
export class DiagnosticCentersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiagnosticCenterDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.diagnosticCenter.findUnique({
      where: { licenseNumber: dto.licenseNumber.trim() },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Diagnostic center with license number '${dto.licenseNumber}' is already registered.`);
    }

    const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
    if (!address || address.deletedAt) {
      throw new NotFoundException(`Address with ID '${dto.addressId}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const center = await tx.diagnosticCenter.create({
        data: {
          name: dto.name.trim(),
          licenseNumber: dto.licenseNumber.trim(),
          addressId: dto.addressId,
          phone: dto.phone.trim(),
          email: dto.email.trim(),
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'DIAGNOSTIC_CENTER_REGISTERED', 'DiagnosticCenter', center.id, null, center, ipAddress, userAgent, tx);
      return center;
    });
  }

  async update(id: string, dto: UpdateDiagnosticCenterDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const center = await this.prisma.diagnosticCenter.findUnique({ where: { id } });
    if (!center || center.deletedAt) {
      throw new NotFoundException(`Diagnostic center with ID '${id}' not found.`);
    }

    if (dto.addressId) {
      const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
      if (!address || address.deletedAt) {
        throw new NotFoundException(`Address with ID '${dto.addressId}' not found.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.diagnosticCenter.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          licenseNumber: dto.licenseNumber ? dto.licenseNumber.trim() : undefined,
          addressId: dto.addressId,
          phone: dto.phone ? dto.phone.trim() : undefined,
          email: dto.email ? dto.email.trim() : undefined,
          isActive: dto.isActive,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'DIAGNOSTIC_CENTER_UPDATED', 'DiagnosticCenter', id, center, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const center = await this.prisma.diagnosticCenter.findUnique({ where: { id } });
    if (!center || center.deletedAt) {
      throw new NotFoundException(`Diagnostic center with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.diagnosticCenter.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'DIAGNOSTIC_CENTER_DELETED', 'DiagnosticCenter', id, center, deleted, ipAddress, userAgent, tx);
      return deleted;
    });
  }

  async findOne(id: string) {
    const center = await this.prisma.diagnosticCenter.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!center || center.deletedAt) {
      throw new NotFoundException(`Diagnostic center with ID '${id}' not found.`);
    }
    return center;
  }

  async findAll() {
    return this.prisma.diagnosticCenter.findMany({
      where: { deletedAt: null },
      include: { address: true },
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
