import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  // In-memory head assignment map fallback if Redis isn't used
  private departmentHeads = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, user: any, ipAddress?: string, userAgent?: string) {
    const branch = await this.prisma.hospitalBranch.findUnique({ where: { id: dto.branchId } });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${dto.branchId}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(branch.hospitalId, branch.id, user);

    // Validate duplicate name within the same branch
    const existing = await this.prisma.department.findFirst({
      where: {
        branchId: dto.branchId,
        name: { equals: dto.name.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Department with name '${dto.name}' already exists in this branch.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const department = await tx.department.create({
        data: {
          branchId: dto.branchId,
          name: dto.name.trim(),
          description: dto.description ? dto.description.trim() : null,
          createdBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'DEPARTMENT_CREATED', 'Department', department.id, null, department, ipAddress, userAgent, tx);

      return department;
    });
  }

  async update(id: string, dto: UpdateDepartmentDto, user: any, ipAddress?: string, userAgent?: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!department || department.deletedAt) {
      throw new NotFoundException(`Department with ID '${id}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(department.branch.hospitalId, department.branchId, user);

    // Validate duplicate name within the same branch
    if (dto.name) {
      const existing = await this.prisma.department.findFirst({
        where: {
          branchId: department.branchId,
          name: { equals: dto.name.trim(), mode: 'insensitive' },
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException(`Department with name '${dto.name}' already exists in this branch.`);
      }
    }

    // Validate and assign department head if specified
    if (dto.headDoctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: dto.headDoctorId },
      });
      if (!doctor || doctor.deletedAt) {
        throw new NotFoundException(`Doctor with ID '${dto.headDoctorId}' not found.`);
      }
      this.departmentHeads.set(id, dto.headDoctorId);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.department.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          description: dto.description ? dto.description.trim() : undefined,
          updatedBy: user.id,
        },
      });

      const result = {
        ...updated,
        headDoctorId: this.departmentHeads.get(id) || null,
      };

      await this.createAuditLog(user.id, 'DEPARTMENT_UPDATED', 'Department', id, department, result, ipAddress, userAgent, tx);

      return result;
    });
  }

  async remove(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!department || department.deletedAt) {
      throw new NotFoundException(`Department with ID '${id}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(department.branch.hospitalId, department.branchId, user);

    // Check active rooms dependency
    const activeRooms = await this.prisma.room.count({
      where: { departmentId: id, deletedAt: null },
    });
    if (activeRooms > 0) {
      throw new BadRequestException('Cannot soft delete department with active rooms.');
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.department.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      this.departmentHeads.delete(id);

      await this.createAuditLog(user.id, 'DEPARTMENT_DELETED', 'Department', id, department, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async findOne(id: string, user: any) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { branch: true, rooms: { where: { deletedAt: null } } },
    });
    if (!department || department.deletedAt) {
      throw new NotFoundException(`Department with ID '${id}' not found.`);
    }

    this.validateReadScope(department.branch.hospitalId, department.branchId, user);

    return {
      ...department,
      headDoctorId: this.departmentHeads.get(id) || null,
    };
  }

  async findAll(branchId: string, user: any) {
    const branch = await this.prisma.hospitalBranch.findUnique({ where: { id: branchId } });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${branchId}' not found.`);
    }

    this.validateReadScope(branch.hospitalId, branch.id, user);

    const list = await this.prisma.department.findMany({
      where: { branchId, deletedAt: null },
    });

    return list.map((dept) => ({
      ...dept,
      headDoctorId: this.departmentHeads.get(dept.id) || null,
    }));
  }

  private validateAdminScope(hospitalId: string, branchId: string, user: any) {
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
      if (user.branchId !== branchId) {
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
