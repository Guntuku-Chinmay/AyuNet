import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';

@Injectable()
export class BedsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBedDto, user: any, ipAddress?: string, userAgent?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { department: { include: { branch: true } } },
    });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Room with ID '${dto.roomId}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(room.department.branch.hospitalId, room.department.branchId, user);

    // Validate duplicate bed number within the same room
    const existing = await this.prisma.bed.findFirst({
      where: {
        roomId: dto.roomId,
        bedNumber: { equals: dto.bedNumber.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Bed with number '${dto.bedNumber}' already exists in this room.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const bed = await tx.bed.create({
        data: {
          roomId: dto.roomId,
          bedNumber: dto.bedNumber.trim(),
          status: dto.status || 'AVAILABLE',
          createdBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'BED_CREATED', 'Bed', bed.id, null, bed, ipAddress, userAgent, tx);

      return bed;
    });
  }

  async update(id: string, dto: UpdateBedDto, user: any, ipAddress?: string, userAgent?: string) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
      include: { room: { include: { department: { include: { branch: true } } } } },
    });
    if (!bed || bed.deletedAt) {
      throw new NotFoundException(`Bed with ID '${id}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(bed.room.department.branch.hospitalId, bed.room.department.branchId, user);

    // If changing room
    if (dto.roomId && dto.roomId !== bed.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
        include: { department: { include: { branch: true } } },
      });
      if (!room || room.deletedAt) {
        throw new NotFoundException(`Room with ID '${dto.roomId}' not found.`);
      }
      this.validateAdminScope(room.department.branch.hospitalId, room.department.branchId, user);
    }

    // Validate duplicate bed number
    const targetRoomId = dto.roomId || bed.roomId;
    const targetBedNumber = dto.bedNumber || bed.bedNumber;
    if (dto.bedNumber || dto.roomId) {
      const existing = await this.prisma.bed.findFirst({
        where: {
          roomId: targetRoomId,
          bedNumber: { equals: targetBedNumber.trim(), mode: 'insensitive' },
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException(`Bed with number '${targetBedNumber}' already exists in that room.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bed.update({
        where: { id },
        data: {
          roomId: dto.roomId,
          bedNumber: dto.bedNumber ? dto.bedNumber.trim() : undefined,
          status: dto.status,
          updatedBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'BED_UPDATED', 'Bed', id, bed, updated, ipAddress, userAgent, tx);

      return updated;
    });
  }

  async remove(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
      include: { room: { include: { department: { include: { branch: true } } } } },
    });
    if (!bed || bed.deletedAt) {
      throw new NotFoundException(`Bed with ID '${id}' not found.`);
    }

    // Verify admin scope
    this.validateAdminScope(bed.room.department.branch.hospitalId, bed.room.department.branchId, user);

    // Prevent deletion if OCCUPIED
    if (bed.status === 'OCCUPIED') {
      throw new BadRequestException('Cannot soft delete a bed that is currently occupied.');
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.bed.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      await this.createAuditLog(user.id, 'BED_DELETED', 'Bed', id, bed, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async findOne(id: string, user: any) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
      include: { room: { include: { department: { include: { branch: true } } } } },
    });
    if (!bed || bed.deletedAt) {
      throw new NotFoundException(`Bed with ID '${id}' not found.`);
    }

    this.validateReadScope(bed.room.department.branch.hospitalId, bed.room.department.branchId, user);

    return bed;
  }

  async findAll(roomId: string, user: any) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { department: { include: { branch: true } } },
    });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Room with ID '${roomId}' not found.`);
    }

    this.validateReadScope(room.department.branch.hospitalId, room.department.branchId, user);

    return this.prisma.bed.findMany({
      where: { roomId, deletedAt: null },
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
