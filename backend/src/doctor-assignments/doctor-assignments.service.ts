import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { TransferDoctorDto } from './dto/transfer-doctor.dto';

@Injectable()
export class DoctorAssignmentsService {
  // Map of "doctorId:branchId" to array of departmentIds
  private doctorBranchDepartments = new Map<string, string[]>();

  constructor(private prisma: PrismaService) {}

  async assignDoctor(dto: AssignDoctorDto, user: any, ipAddress?: string, userAgent?: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
    if (!doctor || doctor.deletedAt) {
      throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found.`);
    }

    const branch = await this.prisma.hospitalBranch.findUnique({ where: { id: dto.branchId } });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${dto.branchId}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(branch.hospitalId, branch.id, user);

    // Validate departments exist in branch
    if (dto.departmentIds && dto.departmentIds.length > 0) {
      const dbDepts = await this.prisma.department.findMany({
        where: { id: { in: dto.departmentIds }, branchId: dto.branchId, deletedAt: null },
      });
      if (dbDepts.length !== dto.departmentIds.length) {
        throw new BadRequestException('One or more departments do not belong to the target branch.');
      }
    }

    // Check duplicate assignment
    const existing = await this.prisma.doctorBranch.findUnique({
      where: { doctorId_branchId: { doctorId: dto.doctorId, branchId: dto.branchId } },
    });
    if (existing) {
      throw new ConflictException('Doctor is already assigned to this branch.');
    }

    return this.prisma.$transaction(async (tx) => {
      // If primary is true, remove primary flag from all other assignments
      if (dto.isPrimary) {
        await tx.doctorBranch.updateMany({
          where: { doctorId: dto.doctorId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const assignment = await tx.doctorBranch.create({
        data: {
          doctorId: dto.doctorId,
          branchId: dto.branchId,
          isPrimary: dto.isPrimary || false,
          createdBy: user.id,
        },
        include: { doctor: { include: { userProfile: true } }, branch: true },
      });

      // Persist departments
      const key = `${dto.doctorId}:${dto.branchId}`;
      this.doctorBranchDepartments.set(key, dto.departmentIds || []);

      const result = {
        ...assignment,
        departmentIds: dto.departmentIds || [],
      };

      await this.createAuditLog(user.id, 'DOCTOR_ASSIGNED_TO_BRANCH', 'DoctorBranch', key, null, result, ipAddress, userAgent, tx);

      return result;
    });
  }

  async removeAssignment(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const [doctorId, branchId] = id.split(':');
    if (!doctorId || !branchId) {
      throw new BadRequestException('Invalid assignment ID format. Expected doctorId:branchId');
    }

    const assignment = await this.prisma.doctorBranch.findUnique({
      where: { doctorId_branchId: { doctorId, branchId } },
      include: { branch: true },
    });
    if (!assignment) {
      throw new NotFoundException(`Doctor assignment with doctorId '${doctorId}' and branchId '${branchId}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(assignment.branch.hospitalId, assignment.branchId, user);

    const deleted = await this.prisma.$transaction(async (tx) => {
      const removed = await tx.doctorBranch.delete({
        where: { doctorId_branchId: { doctorId, branchId } },
      });

      const key = `${doctorId}:${branchId}`;
      this.doctorBranchDepartments.delete(key);

      await this.createAuditLog(user.id, 'DOCTOR_REMOVED_FROM_BRANCH', 'DoctorBranch', key, assignment, removed, ipAddress, userAgent, tx);
      return removed;
    });

    return deleted;
  }

  async transferDoctor(dto: TransferDoctorDto, user: any, ipAddress?: string, userAgent?: string) {
    const fromBranch = await this.prisma.hospitalBranch.findUnique({ where: { id: dto.fromBranchId } });
    const toBranch = await this.prisma.hospitalBranch.findUnique({ where: { id: dto.toBranchId } });
    if (!fromBranch || fromBranch.deletedAt || !toBranch || toBranch.deletedAt) {
      throw new NotFoundException('Source or target branch not found.');
    }

    // Verify admin scope for both branches
    this.validateAdminScope(fromBranch.hospitalId, fromBranch.id, user);
    this.validateAdminScope(toBranch.hospitalId, toBranch.id, user);

    // Validate target departments
    if (dto.departmentIds && dto.departmentIds.length > 0) {
      const dbDepts = await this.prisma.department.findMany({
        where: { id: { in: dto.departmentIds }, branchId: dto.toBranchId, deletedAt: null },
      });
      if (dbDepts.length !== dto.departmentIds.length) {
        throw new BadRequestException('One or more departments do not belong to the target branch.');
      }
    }

    // Find source assignment
    const sourceAssignment = await this.prisma.doctorBranch.findUnique({
      where: { doctorId_branchId: { doctorId: dto.doctorId, branchId: dto.fromBranchId } },
    });
    if (!sourceAssignment) {
      throw new NotFoundException('Doctor is not assigned to the source branch.');
    }

    // Check duplicate target assignment
    const targetAssignment = await this.prisma.doctorBranch.findUnique({
      where: { doctorId_branchId: { doctorId: dto.doctorId, branchId: dto.toBranchId } },
    });
    if (targetAssignment) {
      throw new ConflictException('Doctor is already assigned to the target branch.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete source
      await tx.doctorBranch.delete({
        where: { doctorId_branchId: { doctorId: dto.doctorId, branchId: dto.fromBranchId } },
      });
      const oldKey = `${dto.doctorId}:${dto.fromBranchId}`;
      this.doctorBranchDepartments.delete(oldKey);

      // If primary is true, remove primary flag from all other assignments
      if (dto.isPrimary) {
        await tx.doctorBranch.updateMany({
          where: { doctorId: dto.doctorId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // Create target
      const created = await tx.doctorBranch.create({
        data: {
          doctorId: dto.doctorId,
          branchId: dto.toBranchId,
          isPrimary: dto.isPrimary || false,
          createdBy: user.id,
        },
        include: { doctor: { include: { userProfile: true } }, branch: true },
      });

      const newKey = `${dto.doctorId}:${dto.toBranchId}`;
      this.doctorBranchDepartments.set(newKey, dto.departmentIds || []);

      const result = {
        ...created,
        departmentIds: dto.departmentIds || [],
      };

      await this.createAuditLog(
        user.id,
        'DOCTOR_TRANSFERRED',
        'DoctorBranch',
        newKey,
        sourceAssignment,
        result,
        ipAddress,
        userAgent,
        tx
      );

      return result;
    });
  }

  async findAll(branchId: string | undefined, user: any) {
    if (branchId) {
      const branch = await this.prisma.hospitalBranch.findUnique({ where: { id: branchId } });
      if (!branch || branch.deletedAt) {
        throw new NotFoundException(`Branch with ID '${branchId}' not found.`);
      }
      this.validateReadScope(branch.hospitalId, branch.id, user);

      const list = await this.prisma.doctorBranch.findMany({
        where: { branchId },
        include: { doctor: { include: { userProfile: true } }, branch: true },
      });

      return list.map((item) => {
        const key = `${item.doctorId}:${item.branchId}`;
        return {
          ...item,
          departmentIds: this.doctorBranchDepartments.get(key) || [],
        };
      });
    }

    // Scoped list for all branches that user is authorized to read
    const allBranches = await this.prisma.hospitalBranch.findMany({
      where: { deletedAt: null },
    });

    const authorizedBranches = allBranches.filter((b) => {
      try {
        this.validateReadScope(b.hospitalId, b.id, user);
        return true;
      } catch {
        return false;
      }
    });

    const list = await this.prisma.doctorBranch.findMany({
      where: { branchId: { in: authorizedBranches.map((b) => b.id) } },
      include: { doctor: { include: { userProfile: true } }, branch: true },
    });

    return list.map((item) => {
      const key = `${item.doctorId}:${item.branchId}`;
      return {
        ...item,
        departmentIds: this.doctorBranchDepartments.get(key) || [],
      };
    });
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
