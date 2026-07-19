import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-record.dto';
import { AddendumDto } from './dto/addendum.dto';

export type EmrStatus = 'DRAFT' | 'UNDER_REVIEW' | 'FINALIZED' | 'LOCKED' | 'ARCHIVED';

@Injectable()
export class MedicalRecordsService {
  private states = new Map<string, EmrStatus>();
  private addendumCache = new Map<string, string[]>();

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicalRecordDto, creatorId?: string, ipAddress?: string, userAgent?: string) {
    // Validate doctor is licensed/exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { userProfile: true },
    });
    if (!doctor || doctor.deletedAt) {
      throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found.`);
    }

    // Validate Visit if provided
    if (dto.visitId) {
      const visit = await this.prisma.visit.findUnique({ where: { id: dto.visitId } });
      if (!visit || visit.deletedAt) {
        throw new NotFoundException(`Visit with ID '${dto.visitId}' not found.`);
      }
      if (visit.doctorId !== dto.doctorId || visit.patientId !== dto.patientId) {
        throw new BadRequestException('Visit mismatch with selected doctor or patient.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.medicalRecord.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          visitId: dto.visitId || null,
          recordDate: new Date(),
          symptoms: dto.symptoms.trim(),
          clinicalNotes: dto.clinicalNotes.trim(),
          treatmentPlan: dto.treatmentPlan?.trim() || null,
          createdBy: creatorId,
        },
      });

      this.states.set(record.id, 'DRAFT');

      const result = {
        ...record,
        status: 'DRAFT' as EmrStatus,
        addendums: [],
      };

      await this.createAuditLog(creatorId, 'EMR_CREATED', 'MedicalRecord', record.id, null, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async update(id: string, dto: UpdateMedicalRecordDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: { doctor: { include: { userProfile: true } } },
    });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`EMR with ID '${id}' not found.`);
    }

    const currentStatus = this.states.get(id) || 'DRAFT';
    if (currentStatus !== 'DRAFT') {
      throw new BadRequestException('Only medical records in DRAFT status can be modified.');
    }

    // Only the authoring doctor can edit draft
    const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: actorId } });
    const actorDoctor = actorProfile ? await this.prisma.doctor.findUnique({ where: { userProfileId: actorProfile.id } }) : null;

    if (!actorDoctor || record.doctorId !== actorDoctor.id) {
      throw new ForbiddenException('Only the authoring doctor is permitted to edit draft records.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.medicalRecord.update({
        where: { id },
        data: {
          symptoms: dto.symptoms ? dto.symptoms.trim() : undefined,
          clinicalNotes: dto.clinicalNotes ? dto.clinicalNotes.trim() : undefined,
          treatmentPlan: dto.treatmentPlan ? dto.treatmentPlan.trim() : undefined,
          updatedBy: actorId,
        },
      });

      const addendums = this.addendumCache.get(id) || [];
      const result = {
        ...updated,
        status: currentStatus,
        addendums,
      };

      await this.createAuditLog(actorId, 'EMR_UPDATED', 'MedicalRecord', id, record, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async finalize(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`EMR with ID '${id}' not found.`);
    }

    const currentStatus = this.states.get(id) || 'DRAFT';
    if (currentStatus !== 'DRAFT' && currentStatus !== 'UNDER_REVIEW') {
      throw new BadRequestException('Record is already finalized or locked.');
    }

    this.states.set(id, 'FINALIZED');

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'EMR_FINALIZED', 'MedicalRecord', id, { status: currentStatus }, { status: 'FINALIZED' }, ipAddress, userAgent, tx);
    });

    return { id, status: 'FINALIZED' };
  }

  async lock(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`EMR with ID '${id}' not found.`);
    }

    const currentStatus = this.states.get(id) || 'DRAFT';
    if (currentStatus !== 'FINALIZED') {
      throw new BadRequestException('Only finalized records can be locked.');
    }

    this.states.set(id, 'LOCKED');

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'EMR_LOCKED', 'MedicalRecord', id, { status: currentStatus }, { status: 'LOCKED' }, ipAddress, userAgent, tx);
    });

    return { id, status: 'LOCKED' };
  }

  async archive(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`EMR with ID '${id}' not found.`);
    }

    const currentStatus = this.states.get(id) || 'DRAFT';
    if (currentStatus !== 'FINALIZED' && currentStatus !== 'LOCKED') {
      throw new BadRequestException('Only finalized or locked records can be archived.');
    }

    this.states.set(id, 'ARCHIVED');

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'EMR_ARCHIVED', 'MedicalRecord', id, { status: currentStatus }, { status: 'ARCHIVED' }, ipAddress, userAgent, tx);
    });

    return { id, status: 'ARCHIVED' };
  }

  async addAddendum(id: string, dto: AddendumDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: { doctor: { include: { userProfile: true } } },
    });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`EMR with ID '${id}' not found.`);
    }

    const currentStatus = this.states.get(id) || 'DRAFT';
    if (currentStatus !== 'FINALIZED' && currentStatus !== 'LOCKED') {
      throw new BadRequestException('Corrections can only be signed as addendums on finalized or locked records.');
    }

    const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: actorId } });
    const actorDoctor = actorProfile ? await this.prisma.doctor.findUnique({ where: { userProfileId: actorProfile.id }, include: { userProfile: true } }) : null;

    if (!actorDoctor) {
      throw new ForbiddenException('Only licensed doctors can append signed addendums.');
    }

    const dateString = new Date().toISOString();
    const formattedAddendum = `[Addendum signed by Dr. ${actorDoctor.userProfile.firstName} ${actorDoctor.userProfile.lastName} on ${dateString}]: ${dto.addendumText.trim()}`;

    return this.prisma.$transaction(async (tx) => {
      const updatedNotes = `${record.clinicalNotes}\n\n${formattedAddendum}`;
      await tx.medicalRecord.update({
        where: { id },
        data: { clinicalNotes: updatedNotes, updatedBy: actorId },
      });

      const list = this.addendumCache.get(id) || [];
      list.push(formattedAddendum);
      this.addendumCache.set(id, list);

      await this.createAuditLog(actorId, 'CLINICAL_ADDENDUM_ADDED', 'MedicalRecord', id, null, { addendum: formattedAddendum }, ipAddress, userAgent, tx);

      return { id, addendum: formattedAddendum };
    });
  }

  async findOne(id: string, user: any, breakTheGlassReason?: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: { include: { userProfile: true } },
        doctor: { include: { userProfile: true } },
        visit: true,
        diagnoses: true,
      },
    });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`EMR with ID '${id}' not found.`);
    }

    const currentStatus = this.states.get(id) || 'DRAFT';

    await this.verifyAccess(record, currentStatus, user, breakTheGlassReason, ipAddress, userAgent);

    const addendums = this.addendumCache.get(id) || [];

    return {
      ...record,
      status: currentStatus,
      addendums,
    };
  }

  async findAll(user: any) {
    const where: any = { deletedAt: null };

    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN') || user.roles?.includes('BRANCH_ADMIN')) {
      throw new ForbiddenException('Administrators have no access to clinical medical record listings.');
    }

    if (user.roles?.includes('PATIENT')) {
      const patient = await this.prisma.patient.findFirst({ where: { userProfile: { userId: user.id } } });
      if (!patient) return [];
      where.patientId = patient.id;
    }

    if (user.roles?.includes('CAREGIVER')) {
      const caregiver = await this.prisma.caregiver.findFirst({ where: { userProfile: { userId: user.id } } });
      if (!caregiver) return [];
      const links = await this.prisma.patientCaregiver.findMany({ where: { caregiverId: caregiver.id } });
      where.patientId = { in: links.map((l) => l.patientId) };
    }

    const list = await this.prisma.medicalRecord.findMany({
      where,
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, diagnoses: true },
      orderBy: { recordDate: 'desc' },
    });

    return list.map((record) => {
      const currentStatus = this.states.get(record.id) || 'DRAFT';
      const addendums = this.addendumCache.get(record.id) || [];
      return {
        ...record,
        status: currentStatus,
        addendums,
      };
    });
  }

  private async verifyAccess(record: any, status: EmrStatus, user: any, breakTheGlassReason?: string, ipAddress?: string, userAgent?: string) {
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN')) {
      throw new ForbiddenException('Clinical data access is forbidden for administrative roles.');
    }

    const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: user.id } });

    if (user.roles?.includes('PATIENT')) {
      if (!actorProfile || record.patient.userProfileId !== actorProfile.id) {
        throw new ForbiddenException('You are not authorized to access this medical record.');
      }
      if (status === 'DRAFT' || status === 'UNDER_REVIEW') {
        throw new ForbiddenException('Patients are only permitted to read finalized medical records.');
      }
      return;
    }

    if (user.roles?.includes('CAREGIVER')) {
      const caregiver = actorProfile ? await this.prisma.caregiver.findFirst({ where: { userProfileId: actorProfile.id } }) : null;
      if (caregiver) {
        const link = await this.prisma.patientCaregiver.findUnique({
          where: { patientId_caregiverId: { patientId: record.patientId, caregiverId: caregiver.id } },
        });
        if (link) {
          if (status === 'DRAFT' || status === 'UNDER_REVIEW') {
            throw new ForbiddenException('Caregivers are restricted to viewing finalized medical records only.');
          }
          return;
        }
      }
      throw new ForbiddenException('You do not have delegation rights for this patient.');
    }

    if (user.roles?.includes('DOCTOR')) {
      const doctor = actorProfile ? await this.prisma.doctor.findFirst({ where: { userProfileId: actorProfile.id } }) : null;
      if (doctor) {
        if (record.doctorId === doctor.id) {
          return;
        }
        if (breakTheGlassReason && breakTheGlassReason.trim().length > 0) {
          await this.prisma.auditLog.create({
            data: {
              actorId: user.id,
              action: 'BREAK_THE_GLASS_ACCESS',
              entityName: 'MedicalRecord',
              entityId: record.id,
              newValues: { reason: breakTheGlassReason.trim() },
              ipAddress: ipAddress || '127.0.0.1',
              userAgent: userAgent || 'system',
              createdBy: user.id,
            },
          });
          return;
        }
      }
    }

    throw new ForbiddenException('You do not have permission to read this clinical record. Emergency access requires justification.');
  }

  getStatus(id: string): EmrStatus {
    return this.states.get(id) || 'DRAFT';
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
