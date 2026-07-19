import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Injectable()
export class PharmaciesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePharmacyDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.pharmacy.findUnique({
      where: { licenseNumber: dto.licenseNumber.trim() },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Pharmacy branch with license number '${dto.licenseNumber}' is already registered.`);
    }

    const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
    if (!address || address.deletedAt) {
      throw new NotFoundException(`Address with ID '${dto.addressId}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const pharmacy = await tx.pharmacy.create({
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

      await this.createAuditLog(actorId, 'PHARMACY_REGISTERED', 'Pharmacy', pharmacy.id, null, pharmacy, ipAddress, userAgent, tx);
      return pharmacy;
    });
  }

  async update(id: string, dto: UpdatePharmacyDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id } });
    if (!pharmacy || pharmacy.deletedAt) {
      throw new NotFoundException(`Pharmacy branch with ID '${id}' not found.`);
    }

    if (dto.addressId) {
      const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
      if (!address || address.deletedAt) {
        throw new NotFoundException(`Address with ID '${dto.addressId}' not found.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.pharmacy.update({
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

      await this.createAuditLog(actorId, 'PHARMACY_UPDATED', 'Pharmacy', id, pharmacy, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id } });
    if (!pharmacy || pharmacy.deletedAt) {
      throw new NotFoundException(`Pharmacy branch with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.pharmacy.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PHARMACY_DELETED', 'Pharmacy', id, pharmacy, deleted, ipAddress, userAgent, tx);
      return deleted;
    });
  }

  async findOne(id: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!pharmacy || pharmacy.deletedAt) {
      throw new NotFoundException(`Pharmacy branch with ID '${id}' not found.`);
    }
    return pharmacy;
  }

  async findAll(query?: string) {
    const where: any = { deletedAt: null };
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { licenseNumber: { contains: query, mode: 'insensitive' } },
      ];
    }
    return this.prisma.pharmacy.findMany({
      where,
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
