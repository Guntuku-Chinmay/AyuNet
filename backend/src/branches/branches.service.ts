import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private addressesService: AddressesService
  ) {}

  async create(dto: CreateBranchDto, user: any, ipAddress?: string, userAgent?: string) {
    // Scope checking
    this.validateAdminScope(dto.hospitalId, undefined, user);

    // Validate duplicate license number
    const existing = await this.prisma.hospitalBranch.findFirst({
      where: { licenseNumber: dto.licenseNumber.trim(), deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`Branch with license number '${dto.licenseNumber}' already exists.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const addressId = await this.addressesService.findOrCreateAddress(dto.address, user.id);

      const branch = await tx.hospitalBranch.create({
        data: {
          hospitalId: dto.hospitalId,
          name: dto.name.trim(),
          licenseNumber: dto.licenseNumber.trim(),
          addressId,
          phoneNumber: dto.phoneNumber.trim(),
          email: dto.email.trim(),
          createdBy: user.id,
        },
        include: { address: true },
      });

      await this.createAuditLog(user.id, 'BRANCH_CREATED', 'HospitalBranch', branch.id, null, branch, ipAddress, userAgent, tx);

      return branch;
    });
  }

  async update(id: string, dto: UpdateBranchDto, user: any, ipAddress?: string, userAgent?: string) {
    const branch = await this.prisma.hospitalBranch.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${id}' not found.`);
    }

    // Scope checking
    this.validateAdminScope(branch.hospitalId, id, user);

    // Validate duplicate license number
    if (dto.licenseNumber) {
      const existing = await this.prisma.hospitalBranch.findFirst({
        where: { licenseNumber: dto.licenseNumber.trim(), id: { not: id }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Branch with license number '${dto.licenseNumber}' already exists.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let addressId = branch.addressId;
      if (dto.address) {
        addressId = await this.addressesService.findOrCreateAddress(dto.address, user.id);
      }

      const updated = await tx.hospitalBranch.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          licenseNumber: dto.licenseNumber ? dto.licenseNumber.trim() : undefined,
          phoneNumber: dto.phoneNumber ? dto.phoneNumber.trim() : undefined,
          email: dto.email ? dto.email.trim() : undefined,
          isActive: dto.isActive !== undefined ? dto.isActive : undefined,
          addressId,
          updatedBy: user.id,
        },
        include: { address: true },
      });

      await this.createAuditLog(user.id, 'BRANCH_UPDATED', 'HospitalBranch', id, branch, updated, ipAddress, userAgent, tx);

      return updated;
    });
  }

  async remove(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const branch = await this.prisma.hospitalBranch.findUnique({
      where: { id },
    });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${id}' not found.`);
    }

    // Scope checking
    this.validateAdminScope(branch.hospitalId, id, user);

    // Validate active departments dependency
    const activeDepartments = await this.prisma.department.count({
      where: { branchId: id, deletedAt: null },
    });
    if (activeDepartments > 0) {
      throw new BadRequestException('Cannot soft delete branch with active departments.');
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.hospitalBranch.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'BRANCH_DELETED', 'HospitalBranch', id, branch, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async findOne(id: string, user: any) {
    const branch = await this.prisma.hospitalBranch.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${id}' not found.`);
    }

    this.validateReadScope(branch.hospitalId, id, user);

    return branch;
  }

  async findAll(user: any) {
    // If Super Admin or Platform Admin, see all.
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN')) {
      return this.prisma.hospitalBranch.findMany({
        where: { deletedAt: null },
        include: { address: true },
      });
    }

    // If Hospital Admin, see only their hospital's branches
    if (user.roles?.includes('HOSPITAL_ADMIN') && user.hospitalId) {
      return this.prisma.hospitalBranch.findMany({
        where: { hospitalId: user.hospitalId, deletedAt: null },
        include: { address: true },
      });
    }

    // If Branch Admin or Receptionist, see only their assigned branch
    if (user.branchId) {
      return this.prisma.hospitalBranch.findMany({
        where: { id: user.branchId, deletedAt: null },
        include: { address: true },
      });
    }

    return [];
  }

  async getBranchStats(id: string, user: any) {
    const branch = await this.prisma.hospitalBranch.findUnique({ where: { id } });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${id}' not found.`);
    }

    this.validateReadScope(branch.hospitalId, id, user);

    const [departments, rooms, beds, doctors] = await Promise.all([
      this.prisma.department.count({ where: { branchId: id, deletedAt: null } }),
      this.prisma.room.count({ where: { department: { branchId: id }, deletedAt: null } }),
      this.prisma.bed.count({ where: { room: { department: { branchId: id } }, deletedAt: null } }),
      this.prisma.doctorBranch.count({ where: { branchId: id } }),
    ]);

    return { departments, rooms, beds, doctors };
  }

  private validateAdminScope(hospitalId: string, branchId: string | undefined, user: any) {
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN')) {
      return;
    }

    if (user.roles?.includes('HOSPITAL_ADMIN')) {
      if (user.hospitalId !== hospitalId) {
        throw new ForbiddenException('Hospital Admin cannot manage resources outside their hospital network.');
      }
      return;
    }

    if (user.roles?.includes('BRANCH_ADMIN')) {
      if (!branchId || user.branchId !== branchId) {
        throw new ForbiddenException('Branch Admin cannot manage resources outside their assigned branch.');
      }
      return;
    }

    throw new ForbiddenException('You do not have permission to manage organizational entities.');
  }

  private validateReadScope(hospitalId: string, branchId: string, user: any) {
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN')) {
      return;
    }

    if (user.roles?.includes('HOSPITAL_ADMIN')) {
      if (user.hospitalId !== hospitalId) {
        throw new ForbiddenException('Hospital Admin cannot access resources outside their hospital network.');
      }
      return;
    }

    if (user.roles?.includes('BRANCH_ADMIN') || user.roles?.includes('RECEPTIONIST')) {
      if (user.branchId !== branchId) {
        throw new ForbiddenException('Staff cannot access resources outside their assigned branch.');
      }
      return;
    }

    throw new ForbiddenException('You do not have permission to access this branch.');
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
