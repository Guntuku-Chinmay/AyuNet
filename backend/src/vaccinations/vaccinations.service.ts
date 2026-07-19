import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RecordVaccinationDto } from './dto/record-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';

@Injectable()
export class VaccinationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RecordVaccinationDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    if (dto.administeredByDoctorId) {
      const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.administeredByDoctorId } });
      if (!doctor || doctor.deletedAt) {
        throw new NotFoundException(`Doctor with ID '${dto.administeredByDoctorId}' not found.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const vaccination = await tx.vaccination.create({
        data: {
          patientId: dto.patientId,
          vaccineName: dto.vaccineName.trim(),
          doseNumber: dto.doseNumber || 1,
          administeredDate: new Date(dto.administeredDate),
          administeredByDoctorId: dto.administeredByDoctorId || null,
          administeredAtFacility: dto.administeredAtFacility?.trim() || null,
          batchNumber: dto.batchNumber?.trim() || null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'VACCINATION_RECORDED', 'Vaccination', vaccination.id, null, vaccination, ipAddress, userAgent, tx);
      return vaccination;
    });
  }

  async update(id: string, dto: UpdateVaccinationDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const vaccination = await this.prisma.vaccination.findUnique({ where: { id } });
    if (!vaccination || vaccination.deletedAt) {
      throw new NotFoundException(`Vaccination record with ID '${id}' not found.`);
    }

    if (dto.administeredByDoctorId) {
      const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.administeredByDoctorId } });
      if (!doctor || doctor.deletedAt) {
        throw new NotFoundException(`Doctor with ID '${dto.administeredByDoctorId}' not found.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vaccination.update({
        where: { id },
        data: {
          vaccineName: dto.vaccineName ? dto.vaccineName.trim() : undefined,
          doseNumber: dto.doseNumber,
          administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : undefined,
          administeredByDoctorId: dto.administeredByDoctorId,
          administeredAtFacility: dto.administeredAtFacility !== undefined ? (dto.administeredAtFacility?.trim() || null) : undefined,
          batchNumber: dto.batchNumber !== undefined ? (dto.batchNumber?.trim() || null) : undefined,
          expiryDate: dto.expiryDate !== undefined ? (dto.expiryDate ? new Date(dto.expiryDate) : null) : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'VACCINATION_UPDATED', 'Vaccination', id, vaccination, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const vaccination = await this.prisma.vaccination.findUnique({ where: { id } });
    if (!vaccination || vaccination.deletedAt) {
      throw new NotFoundException(`Vaccination record with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.vaccination.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'VACCINATION_REMOVED', 'Vaccination', id, vaccination, deleted, ipAddress, userAgent, tx);
      return deleted;
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
