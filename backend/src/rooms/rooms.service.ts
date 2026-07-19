import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoomDto, user: any, ipAddress?: string, userAgent?: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
      include: { branch: true },
    });
    if (!department || department.deletedAt) {
      throw new NotFoundException(`Department with ID '${dto.departmentId}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(department.branch.hospitalId, department.branchId, user);

    // Validate duplicate room number within the same department
    const existing = await this.prisma.room.findFirst({
      where: {
        departmentId: dto.departmentId,
        roomNumber: { equals: dto.roomNumber.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Room with number '${dto.roomNumber}' already exists in this department.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          departmentId: dto.departmentId,
          roomNumber: dto.roomNumber.trim(),
          roomType: dto.roomType,
          roomStatus: dto.roomStatus || 'ACTIVE',
          createdBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'ROOM_CREATED', 'Room', room.id, null, room, ipAddress, userAgent, tx);

      return room;
    });
  }

  async update(id: string, dto: UpdateRoomDto, user: any, ipAddress?: string, userAgent?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { department: { include: { branch: true } } },
    });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Room with ID '${id}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(room.department.branch.hospitalId, room.department.branchId, user);

    // If changing department
    if (dto.departmentId && dto.departmentId !== room.departmentId) {
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
        include: { branch: true },
      });
      if (!dept || dept.deletedAt) {
        throw new NotFoundException(`Department with ID '${dto.departmentId}' not found.`);
      }
      this.validateAdminScope(dept.branch.hospitalId, dept.branchId, user);
    }

    // Validate duplicate room number
    const targetDeptId = dto.departmentId || room.departmentId;
    const targetRoomNumber = dto.roomNumber || room.roomNumber;
    if (dto.roomNumber || dto.departmentId) {
      const existing = await this.prisma.room.findFirst({
        where: {
          departmentId: targetDeptId,
          roomNumber: { equals: targetRoomNumber.trim(), mode: 'insensitive' },
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException(`Room with number '${targetRoomNumber}' already exists in that department.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.room.update({
        where: { id },
        data: {
          departmentId: dto.departmentId,
          roomNumber: dto.roomNumber ? dto.roomNumber.trim() : undefined,
          roomType: dto.roomType,
          roomStatus: dto.roomStatus,
          updatedBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'ROOM_UPDATED', 'Room', id, room, updated, ipAddress, userAgent, tx);

      return updated;
    });
  }

  async remove(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { department: { include: { branch: true } } },
    });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Room with ID '${id}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(room.department.branch.hospitalId, room.department.branchId, user);

    // Check active beds dependency
    const activeBeds = await this.prisma.bed.count({
      where: { roomId: id, deletedAt: null },
    });
    if (activeBeds > 0) {
      throw new BadRequestException('Cannot soft delete room with active beds.');
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.room.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'ROOM_DELETED', 'Room', id, room, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async findOne(id: string, user: any) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { department: { include: { branch: true } }, beds: { where: { deletedAt: null } } },
    });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Room with ID '${id}' not found.`);
    }

    this.validateReadScope(room.department.branch.hospitalId, room.department.branchId, user);

    const stats = await this.getRoomOccupancy(id);
    return {
      ...room,
      occupancy: stats,
    };
  }

  async findAll(departmentId: string, user: any) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: { branch: true },
    });
    if (!department || department.deletedAt) {
      throw new NotFoundException(`Department with ID '${departmentId}' not found.`);
    }

    this.validateReadScope(department.branch.hospitalId, department.branchId, user);

    const rooms = await this.prisma.room.findMany({
      where: { departmentId, deletedAt: null },
    });

    return Promise.all(
      rooms.map(async (room) => {
        const stats = await this.getRoomOccupancy(room.id);
        return {
          ...room,
          occupancy: stats,
        };
      })
    );
  }

  async getRoomOccupancy(id: string) {
    const [totalBeds, occupiedBeds] = await Promise.all([
      this.prisma.bed.count({ where: { roomId: id, deletedAt: null } }),
      this.prisma.bed.count({ where: { roomId: id, status: 'OCCUPIED', deletedAt: null } }),
    ]);
    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    return { totalBeds, occupiedBeds, occupancyPercentage };
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
