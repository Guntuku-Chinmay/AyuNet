import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(
    private prisma: PrismaService,
    private addressesService: AddressesService
  ) {}

  async create(dto: CreateHospitalDto, userId?: string, ipAddress?: string, userAgent?: string) {
    // Check duplicate hospital name
    const existing = await this.prisma.hospital.findFirst({
      where: { name: { equals: dto.name.trim(), mode: 'insensitive' }, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`Hospital with name '${dto.name}' already exists.`);
    }

    // Check duplicate license number
    const existingLicense = await this.prisma.hospital.findFirst({
      where: { licenseNumber: dto.licenseNumber.trim(), deletedAt: null },
    });
    if (existingLicense) {
      throw new ConflictException(`Hospital with license number '${dto.licenseNumber}' already exists.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Find or create address
      const addressId = await this.addressesService.findOrCreateAddress(dto.address, userId);

      const hospital = await tx.hospital.create({
        data: {
          name: dto.name.trim(),
          licenseNumber: dto.licenseNumber.trim(),
          addressId,
          createdBy: userId,
        },
        include: { address: true },
      });

      // Audit Log
      await this.createAuditLog(userId, 'HOSPITAL_CREATED', 'Hospital', hospital.id, null, hospital, ipAddress, userAgent, tx);

      return hospital;
    });
  }

  async update(id: string, dto: UpdateHospitalDto, userId?: string, ipAddress?: string, userAgent?: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!hospital || hospital.deletedAt) {
      throw new NotFoundException(`Hospital with ID '${id}' not found.`);
    }

    // Check duplicate hospital name
    if (dto.name) {
      const existing = await this.prisma.hospital.findFirst({
        where: { name: { equals: dto.name.trim(), mode: 'insensitive' }, id: { not: id }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Hospital with name '${dto.name}' already exists.`);
      }
    }

    // Check duplicate license number
    if (dto.licenseNumber) {
      const existingLicense = await this.prisma.hospital.findFirst({
        where: { licenseNumber: dto.licenseNumber.trim(), id: { not: id }, deletedAt: null },
      });
      if (existingLicense) {
        throw new ConflictException(`Hospital with license number '${dto.licenseNumber}' already exists.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let addressId = hospital.addressId;
      if (dto.address) {
        addressId = await this.addressesService.findOrCreateAddress(dto.address, userId);
      }

      const updated = await tx.hospital.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          licenseNumber: dto.licenseNumber ? dto.licenseNumber.trim() : undefined,
          addressId,
          updatedBy: userId,
        },
        include: { address: true },
      });

      // Audit Log
      await this.createAuditLog(userId, 'HOSPITAL_UPDATED', 'Hospital', id, hospital, updated, ipAddress, userAgent, tx);

      return updated;
    });
  }

  async remove(id: string, userId?: string, ipAddress?: string, userAgent?: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
    });
    if (!hospital || hospital.deletedAt) {
      throw new NotFoundException(`Hospital with ID '${id}' not found.`);
    }

    // Check active branches dependency
    const activeBranches = await this.prisma.hospitalBranch.count({
      where: { hospitalId: id, deletedAt: null },
    });
    if (activeBranches > 0) {
      throw new BadRequestException('Cannot soft delete hospital with active branches.');
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.hospital.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      await this.createAuditLog(userId, 'HOSPITAL_DELETED', 'Hospital', id, hospital, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async findOne(id: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: { address: true, branches: { where: { deletedAt: null } } },
    });
    if (!hospital || hospital.deletedAt) {
      throw new NotFoundException(`Hospital with ID '${id}' not found.`);
    }
    return hospital;
  }

  async findAll() {
    return this.prisma.hospital.findMany({
      where: { deletedAt: null },
      include: { address: true },
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
