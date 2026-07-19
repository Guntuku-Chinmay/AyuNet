import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

export type RxStatus = 'DRAFT' | 'SIGNED' | 'DISPENSED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

@Injectable()
export class PrescriptionsService {
  private states = new Map<string, RxStatus>();

  constructor(
    private prisma: PrismaService,
    private medicalRecordsService: MedicalRecordsService
  ) {}

  getStatus(id: string): RxStatus {
    return this.states.get(id) || 'DRAFT';
  }

  async create(dto: CreatePrescriptionDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id: dto.medicalRecordId },
      include: { visit: true },
    });
    if (!record || record.deletedAt) {
      throw new NotFoundException(`Medical record with ID '${dto.medicalRecordId}' not found.`);
    }

    const emrStatus = this.medicalRecordsService.getStatus(dto.medicalRecordId);
    if (emrStatus !== 'FINALIZED' && emrStatus !== 'LOCKED') {
      throw new BadRequestException('EMR record must be finalized before prescribing medications.');
    }

    if (!record.visitId) {
      throw new BadRequestException('Prescription requires an EMR record associated with an active clinical visit.');
    }

    const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
    if (!doctor || doctor.deletedAt) {
      throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found.`);
    }

    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const rx = await tx.prescription.create({
        data: {
          medicalRecordId: dto.medicalRecordId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          issuedAt: new Date(),
          validUntil: new Date(dto.validUntil),
          digitalSignature: dto.digitalSignature || '',
          status: 'DRAFT',
          createdBy: actorId,
        },
      });

      this.states.set(rx.id, 'DRAFT');

      const result = {
        ...rx,
        status: 'DRAFT' as RxStatus,
        items: [],
      };

      await this.createAuditLog(actorId, 'PRESCRIPTION_CREATED', 'Prescription', rx.id, null, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async update(id: string, dto: UpdatePrescriptionDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({ where: { id } });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DRAFT') {
      throw new BadRequestException('Only draft prescriptions are editable.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.prescription.update({
        where: { id },
        data: {
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          digitalSignature: dto.digitalSignature || undefined,
          updatedBy: actorId,
        },
      });

      const items = await tx.prescriptionItem.findMany({ where: { prescriptionId: id, deletedAt: null } });
      const result = {
        ...updated,
        status: currentStatus,
        items,
      };

      await this.createAuditLog(actorId, 'PRESCRIPTION_UPDATED', 'Prescription', id, rx, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async sign(id: string, digitalSignature: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id },
      include: { items: { include: { medicine: true } } },
    });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DRAFT') {
      throw new BadRequestException('Only draft prescriptions can be signed.');
    }

    if (rx.items.length === 0) {
      throw new BadRequestException('A signed prescription must contain at least one medicine item.');
    }

    const doctorProfile = await this.prisma.userProfile.findFirst({ where: { userId: actorId } });
    const doctor = doctorProfile ? await this.prisma.doctor.findUnique({ where: { userProfileId: doctorProfile.id } }) : null;
    if (!doctor) {
      throw new ForbiddenException('Only licensed clinical doctors are authorized to sign prescriptions.');
    }

    const patientAllergies = await this.prisma.allergy.findMany({
      where: { patientId: rx.patientId, status: 'ACTIVE', deletedAt: null },
    });

    for (const item of rx.items) {
      const genericName = item.medicine.genericName.toLowerCase();
      const conflict = patientAllergies.find((a) => a.allergen.toLowerCase() === genericName);
      if (conflict) {
        throw new BadRequestException(`Allergy Warning: Patient is allergic to '${item.medicine.genericName}' (Reaction: ${conflict.reaction || 'unknown'}).`);
      }
    }

    const patientUser = await this.prisma.patient.findUnique({
      where: { id: rx.patientId },
      include: { userProfile: true },
    });
    const patientUserId = patientUser?.userProfile.userId || rx.patientId;

    this.states.set(id, 'SIGNED');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.prescription.update({
        where: { id },
        data: {
          status: 'SIGNED',
          digitalSignature,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_SIGNED', 'Prescription', id, { status: currentStatus }, { status: 'SIGNED' }, ipAddress, userAgent, tx);

      await tx.notification.create({
        data: {
          recipientId: patientUserId,
          title: 'Prescription Signed',
          content: `Your prescription has been signed by Dr. ${doctorProfile?.lastName}.`,
          channel: 'IN_APP',
          createdBy: actorId,
        },
      });

      return {
        ...updated,
        status: 'SIGNED' as RxStatus,
      };
    });
  }

  async cancel(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({ where: { id } });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DRAFT' && currentStatus !== 'SIGNED') {
      throw new BadRequestException('Only draft or signed prescriptions can be cancelled.');
    }

    this.states.set(id, 'CANCELLED');

    return this.prisma.$transaction(async (tx) => {
      await tx.prescription.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_CANCELLED', 'Prescription', id, { status: currentStatus }, { status: 'CANCELLED' }, ipAddress, userAgent, tx);

      return { id, status: 'CANCELLED' as RxStatus };
    });
  }

  async expire(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({ where: { id } });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'SIGNED') {
      throw new BadRequestException('Only active signed prescriptions can be expired.');
    }

    this.states.set(id, 'EXPIRED');

    return this.prisma.$transaction(async (tx) => {
      await tx.prescription.update({
        where: { id },
        data: {
          status: 'EXPIRED',
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_EXPIRED', 'Prescription', id, { status: currentStatus }, { status: 'EXPIRED' }, ipAddress, userAgent, tx);

      return { id, status: 'EXPIRED' as RxStatus };
    });
  }

  async dispense(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({ where: { id } });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'SIGNED') {
      throw new BadRequestException('Only signed prescriptions can be dispensed.');
    }

    const patientUser = await this.prisma.patient.findUnique({
      where: { id: rx.patientId },
      include: { userProfile: true },
    });
    const patientUserId = patientUser?.userProfile.userId || rx.patientId;

    this.states.set(id, 'DISPENSED');

    return this.prisma.$transaction(async (tx) => {
      await tx.prescription.update({
        where: { id },
        data: {
          status: 'DISPENSED',
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_DISPENSED', 'Prescription', id, { status: currentStatus }, { status: 'DISPENSED' }, ipAddress, userAgent, tx);

      await tx.notification.create({
        data: {
          recipientId: patientUserId,
          title: 'Prescription Dispensed',
          content: 'Your prescribed medicines have been successfully dispensed.',
          channel: 'IN_APP',
          createdBy: actorId,
        },
      });

      return { id, status: 'DISPENSED' as RxStatus };
    });
  }

  async clone(previousId: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id: previousId },
      include: { items: true },
    });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${previousId}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const clonedRx = await tx.prescription.create({
        data: {
          medicalRecordId: rx.medicalRecordId,
          patientId: rx.patientId,
          doctorId: rx.doctorId,
          issuedAt: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          digitalSignature: '',
          status: 'DRAFT',
          createdBy: actorId,
        },
      });

      this.states.set(clonedRx.id, 'DRAFT');

      for (const item of rx.items) {
        if (!item.deletedAt) {
          await tx.prescriptionItem.create({
            data: {
              prescriptionId: clonedRx.id,
              medicineId: item.medicineId,
              dosage: item.dosage,
              frequency: item.frequency,
              durationDays: item.durationDays,
              quantity: item.quantity,
              instructions: item.instructions,
              createdBy: actorId,
            },
          });
        }
      }

      await this.createAuditLog(actorId, 'PRESCRIPTION_CLONED', 'Prescription', clonedRx.id, null, clonedRx, ipAddress, userAgent, tx);

      return { id: clonedRx.id, status: 'DRAFT' as RxStatus };
    });
  }

  async findOne(id: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: { include: { userProfile: true } },
        doctor: { include: { userProfile: true } },
        items: { include: { medicine: true } },
      },
    });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    return {
      ...rx,
      status: currentStatus,
    };
  }

  async findAll(user: any) {
    const where: any = { deletedAt: null };

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

    const list = await this.prisma.prescription.findMany({
      where,
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, items: { include: { medicine: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((rx) => ({
      ...rx,
      status: this.getStatus(rx.id),
    }));
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
