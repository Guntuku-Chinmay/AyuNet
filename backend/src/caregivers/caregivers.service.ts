import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { RegisterCaregiverDto } from './dto/register-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';

@Injectable()
export class CaregiversService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterCaregiverDto, ipAddress?: string, userAgent?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: dto.email.trim(), mode: 'insensitive' }, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException(`User with email '${dto.email}' already registered.`);
    }

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: dto.email.trim(),
          passwordHash,
          phoneNumber: dto.phoneNumber?.trim() || null,
        },
      });

      // Create UserProfile
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phoneNumber?.trim() || null,
        },
      });

      // Create Caregiver
      const caregiver = await tx.caregiver.create({
        data: {
          userProfileId: profile.id,
          licenseNumber: dto.licenseNumber?.trim() || null,
          isProfessional: dto.isProfessional || false,
          specialty: dto.specialty?.trim() || null,
        },
        include: { userProfile: { include: { user: true } } },
      });

      await this.createAuditLog(user.id, 'CAREGIVER_REGISTERED', 'Caregiver', caregiver.id, null, caregiver, ipAddress, userAgent, tx);

      return caregiver;
    });
  }

  async update(id: string, dto: UpdateCaregiverDto, userId: string, ipAddress?: string, userAgent?: string) {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { id },
      include: { userProfile: { include: { user: true } } },
    });
    if (!caregiver || caregiver.deletedAt) {
      throw new NotFoundException(`Caregiver with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Update UserProfile
      await tx.userProfile.update({
        where: { id: caregiver.userProfileId },
        data: {
          firstName: dto.firstName ? dto.firstName.trim() : undefined,
          lastName: dto.lastName ? dto.lastName.trim() : undefined,
          phone: dto.phone ? dto.phone.trim() : undefined,
        },
      });

      // Update Caregiver
      const updated = await tx.caregiver.update({
        where: { id },
        data: {
          licenseNumber: dto.licenseNumber ? dto.licenseNumber.trim() : undefined,
          isProfessional: dto.isProfessional,
          specialty: dto.specialty ? dto.specialty.trim() : undefined,
          updatedBy: userId,
        },
        include: { userProfile: { include: { user: true } } },
      });

      await this.createAuditLog(userId, 'CAREGIVER_UPDATED', 'Caregiver', id, caregiver, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { id },
    });
    if (!caregiver || caregiver.deletedAt) {
      throw new NotFoundException(`Caregiver with ID '${id}' not found.`);
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.caregiver.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      await this.createAuditLog(userId, 'CAREGIVER_DELETED', 'Caregiver', id, caregiver, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async findOne(id: string) {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { id },
      include: { userProfile: { include: { user: true } } },
    });
    if (!caregiver || caregiver.deletedAt) {
      throw new NotFoundException(`Caregiver with ID '${id}' not found.`);
    }
    return caregiver;
  }

  async findAll() {
    return this.prisma.caregiver.findMany({
      where: { deletedAt: null },
      include: { userProfile: { include: { user: true } } },
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
