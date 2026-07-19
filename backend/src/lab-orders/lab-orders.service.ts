import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLabOrderDto } from './dto/create-order.dto';
import { LabOrderStatus } from '@prisma/client';

export type ExtendedLabStatus = 'ORDERED' | 'ACCEPTED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'REPORT_READY' | 'VERIFIED' | 'DELIVERED' | 'CANCELLED';

@Injectable()
export class LabOrdersService {
  private states = new Map<string, ExtendedLabStatus>();

  constructor(private prisma: PrismaService) {}

  getStatus(id: string): ExtendedLabStatus {
    return this.states.get(id) || 'ORDERED';
  }

  setStatus(id: string, status: ExtendedLabStatus) {
    this.states.set(id, status);
  }

  async create(dto: CreateLabOrderDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    const center = await this.prisma.diagnosticCenter.findUnique({ where: { id: dto.diagnosticCenterId } });
    if (!center || center.deletedAt) {
      throw new NotFoundException(`Diagnostic center with ID '${dto.diagnosticCenterId}' not found.`);
    }
    if (!center.isActive) {
      throw new BadRequestException(`Diagnostic center '${center.name}' is currently inactive.`);
    }

    if (dto.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
      if (!doctor || doctor.deletedAt) {
        throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found.`);
      }
    }

    if (dto.medicalRecordId) {
      const record = await this.prisma.medicalRecord.findUnique({ where: { id: dto.medicalRecordId } });
      if (!record || record.deletedAt) {
        throw new NotFoundException(`Medical record with ID '${dto.medicalRecordId}' not found.`);
      }
      if (!record.visitId) {
        throw new BadRequestException('EMR record must have an associated active Visit to book lab orders.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.labOrder.create({
        data: {
          medicalRecordId: dto.medicalRecordId || null,
          patientId: dto.patientId,
          doctorId: dto.doctorId || null,
          diagnosticCenterId: dto.diagnosticCenterId,
          status: 'PLACED' as LabOrderStatus,
          orderedAt: new Date(),
          createdBy: actorId,
        },
      });

      for (const testId of dto.testIds) {
        const test = await tx.labTest.findUnique({ where: { id: testId } });
        if (!test || test.deletedAt) {
          throw new NotFoundException(`Lab test with ID '${testId}' not found in catalog.`);
        }
        await tx.labOrderTest.create({
          data: {
            labOrderId: order.id,
            labTestId: testId,
            createdBy: actorId,
          },
        });
      }

      this.states.set(order.id, 'ORDERED');

      const result = {
        ...order,
        status: 'ORDERED' as ExtendedLabStatus,
      };

      await this.createAuditLog(actorId, 'LAB_ORDER_CREATED', 'LabOrder', order.id, null, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async accept(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'ORDERED') {
      throw new BadRequestException('Lab order must be in ORDERED state to be accepted.');
    }

    this.states.set(id, 'ACCEPTED');

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'LAB_ORDER_ACCEPTED', 'LabOrder', id, { status: currentStatus }, { status: 'ACCEPTED' }, ipAddress, userAgent, tx);
    });

    return { id, status: 'ACCEPTED' as ExtendedLabStatus };
  }

  async collectSample(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'ACCEPTED' && currentStatus !== 'ORDERED') {
      throw new BadRequestException('Lab order must be accepted or ordered to collect samples.');
    }

    this.states.set(id, 'SAMPLE_COLLECTED');

    return this.prisma.$transaction(async (tx) => {
      await tx.labOrder.update({
        where: { id },
        data: { status: 'SAMPLE_COLLECTED' as LabOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'SAMPLE_COLLECTED', 'LabOrder', id, { status: currentStatus }, { status: 'SAMPLE_COLLECTED' }, ipAddress, userAgent, tx);

      const patient = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patient) {
        await tx.notification.create({
          data: {
            recipientId: patient.userProfile.userId,
            title: 'Sample Collection Scheduled',
            content: `Your sample collection has been completed for Lab Order #${order.id.slice(0, 8)}.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async process(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'SAMPLE_COLLECTED') {
      throw new BadRequestException('Lab order must have collected sample before starting processing.');
    }

    this.states.set(id, 'PROCESSING');

    return this.prisma.$transaction(async (tx) => {
      await tx.labOrder.update({
        where: { id },
        data: { status: 'PROCESSING' as LabOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'LAB_ORDER_PROCESSING', 'LabOrder', id, { status: currentStatus }, { status: 'PROCESSING' }, ipAddress, userAgent, tx);
    });
  }

  async verify(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'PROCESSING' && currentStatus !== 'REPORT_READY') {
      throw new BadRequestException('Lab report findings must be ready or processing to be verified.');
    }

    const doctorProfile = await this.prisma.userProfile.findFirst({ where: { userId: actorId } });
    const doctor = doctorProfile ? await this.prisma.doctor.findUnique({ where: { userProfileId: doctorProfile.id } }) : null;
    if (!doctor) {
      throw new ForbiddenException('Only licensed pathologists can verify lab reports.');
    }

    this.states.set(id, 'VERIFIED');

    return this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'REPORT_VERIFIED', 'LabOrder', id, { status: currentStatus }, { status: 'VERIFIED' }, ipAddress, userAgent, tx);

      const patient = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patient) {
        await tx.notification.create({
          data: {
            recipientId: patient.userProfile.userId,
            title: 'Report Verified',
            content: `Your laboratory report for Order #${order.id.slice(0, 8)} has been verified and released by Dr. ${doctorProfile!.lastName}.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async deliver(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'VERIFIED') {
      throw new BadRequestException('Only verified reports can be delivered to patient access portfolios.');
    }

    this.states.set(id, 'DELIVERED');

    return this.prisma.$transaction(async (tx) => {
      await tx.labOrder.update({
        where: { id },
        data: { status: 'COMPLETED' as LabOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'REPORT_DELIVERED', 'LabOrder', id, { status: currentStatus }, { status: 'DELIVERED' }, ipAddress, userAgent, tx);

      const patient = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patient) {
        await tx.notification.create({
          data: {
            recipientId: patient.userProfile.userId,
            title: 'Report Delivered',
            content: `Your laboratory findings for Order #${order.id.slice(0, 8)} are now ready to view.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async cancel(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
      throw new BadRequestException('Delivered or already cancelled orders cannot be cancelled.');
    }

    this.states.set(id, 'CANCELLED');

    return this.prisma.$transaction(async (tx) => {
      await tx.labOrder.update({
        where: { id },
        data: { status: 'CANCELLED' as LabOrderStatus, deletedAt: new Date(), deletedBy: actorId },
      });

      await this.createAuditLog(actorId, 'LAB_ORDER_CANCELLED', 'LabOrder', id, { status: currentStatus }, { status: 'CANCELLED' }, ipAddress, userAgent, tx);
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: { include: { userProfile: true } },
        doctor: { include: { userProfile: true } },
        diagnosticCenter: true,
        labOrderTests: { include: { labTest: true } },
        labReports: true,
      },
    });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    return {
      ...order,
      status: currentStatus,
    };
  }

  async findAll() {
    const list = await this.prisma.labOrder.findMany({
      where: { deletedAt: null },
      include: { patient: { include: { userProfile: true } }, diagnosticCenter: true },
      orderBy: { orderedAt: 'desc' },
    });

    return list.map((order) => ({
      ...order,
      status: this.getStatus(order.id),
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
