import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { AddDiagnosisDto } from './dto/add-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Injectable()
export class DiagnosesService {
  constructor(
    private prisma: PrismaService,
    private medicalRecordsService: MedicalRecordsService
  ) {}

  async create(dto: AddDiagnosisDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const status = this.medicalRecordsService.getStatus(dto.medicalRecordId);
    if (status !== 'DRAFT') {
      throw new BadRequestException('Diagnoses can only be added to EMR records in DRAFT status.');
    }

    const record = await this.prisma.medicalRecord.findUnique({ where: { id: dto.medicalRecordId } });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`Medical record with ID '${dto.medicalRecordId}' not found.`);
    }

    // Check duplicate code
    const existing = await this.prisma.diagnosis.findFirst({
      where: { medicalRecordId: dto.medicalRecordId, code: dto.code.trim(), deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`Diagnosis code '${dto.code}' is already added to this medical record.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const diagnosis = await tx.diagnosis.create({
        data: {
          medicalRecordId: dto.medicalRecordId,
          code: dto.code.trim(),
          codeSystem: dto.codeSystem || 'ICD-10',
          description: dto.description.trim(),
          diagnosisType: dto.diagnosisType.trim(),
          status: dto.status.trim(),
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'DIAGNOSIS_ADDED', 'Diagnosis', diagnosis.id, null, diagnosis, ipAddress, userAgent, tx);
      return diagnosis;
    });
  }

  async update(id: string, dto: UpdateDiagnosisDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const diagnosis = await this.prisma.diagnosis.findUnique({ where: { id } });
    if (!diagnosis || diagnosis.deletedAt) {
      throw new NotFoundException(`Diagnosis with ID '${id}' not found.`);
    }

    const status = this.medicalRecordsService.getStatus(diagnosis.medicalRecordId);
    if (status !== 'DRAFT') {
      throw new BadRequestException('Diagnoses can only be modified on EMR records in DRAFT status.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.diagnosis.update({
        where: { id },
        data: {
          code: dto.code ? dto.code.trim() : undefined,
          description: dto.description ? dto.description.trim() : undefined,
          diagnosisType: dto.diagnosisType ? dto.diagnosisType.trim() : undefined,
          status: dto.status ? dto.status.trim() : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'DIAGNOSIS_UPDATED', 'Diagnosis', id, diagnosis, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const diagnosis = await this.prisma.diagnosis.findUnique({ where: { id } });
    if (!diagnosis || diagnosis.deletedAt) {
      throw new NotFoundException(`Diagnosis with ID '${id}' not found.`);
    }

    const status = this.medicalRecordsService.getStatus(diagnosis.medicalRecordId);
    if (status !== 'DRAFT') {
      throw new BadRequestException('Diagnoses can only be removed from EMR records in DRAFT status.');
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.diagnosis.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'DIAGNOSIS_REMOVED', 'Diagnosis', id, diagnosis, deleted, ipAddress, userAgent, tx);
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
