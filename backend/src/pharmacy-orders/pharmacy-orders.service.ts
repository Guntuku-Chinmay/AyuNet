import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePharmacyOrderDto } from './dto/create-order.dto';
import { PharmacyOrderStatus, PrescriptionStatus } from '@prisma/client';

export type ExtendedPharmacyStatus =
  | 'CREATED'
  | 'VERIFIED'
  | 'PREPARING'
  | 'PARTIALLY_DISPENSED'
  | 'DISPENSED'
  | 'DELIVERED'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'EXPIRED';

@Injectable()
export class PharmacyOrdersService {
  private states = new Map<string, ExtendedPharmacyStatus>();

  constructor(private prisma: PrismaService) {}

  getStatus(id: string): ExtendedPharmacyStatus {
    return this.states.get(id) || 'CREATED';
  }

  setStatus(id: string, status: ExtendedPharmacyStatus) {
    this.states.set(id, status);
  }

  async create(dto: CreatePharmacyOrderDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: dto.pharmacyId } });
    if (!pharmacy || pharmacy.deletedAt) {
      throw new NotFoundException(`Pharmacy branch with ID '${dto.pharmacyId}' not found.`);
    }
    if (!pharmacy.isActive) {
      throw new BadRequestException(`Pharmacy branch '${pharmacy.name}' is currently inactive.`);
    }

    if (dto.prescriptionId) {
      const prescription = await this.prisma.prescription.findUnique({ where: { id: dto.prescriptionId } });
      if (!prescription || prescription.deletedAt) {
        throw new NotFoundException(`Prescription with ID '${dto.prescriptionId}' not found.`);
      }

      if (prescription.status !== PrescriptionStatus.SIGNED) {
        throw new BadRequestException('Pharmacy orders can only be created from signed prescriptions.');
      }

      if (new Date() > new Date(prescription.validUntil)) {
        this.states.set(dto.prescriptionId, 'EXPIRED' as any);
        throw new BadRequestException('Prescription has expired and cannot be fulfilled.');
      }

      if (prescription.patientId !== dto.patientId) {
        throw new BadRequestException('Prescription patient ID mismatch.');
      }
    }

    let totalPrice = 0;
    for (const item of dto.items) {
      const medicine = await this.prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!medicine || medicine.deletedAt) {
        throw new NotFoundException(`Medicine with ID '${item.medicineId}' not found in catalog.`);
      }
      totalPrice += item.unitPrice * item.quantity;
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.pharmacyOrder.create({
        data: {
          prescriptionId: dto.prescriptionId || null,
          patientId: dto.patientId,
          pharmacyId: dto.pharmacyId,
          status: 'PENDING' as PharmacyOrderStatus,
          deliveryAddressLine1: dto.deliveryAddressLine1.trim(),
          deliveryAddressLine2: dto.deliveryAddressLine2?.trim() || null,
          deliveryCity: dto.deliveryCity.trim(),
          deliveryState: dto.deliveryState.trim(),
          deliveryPostalCode: dto.deliveryPostalCode.trim(),
          deliveryCountry: dto.deliveryCountry.trim(),
          totalPrice,
          createdBy: actorId,
        },
      });

      for (const item of dto.items) {
        await tx.pharmacyOrderItem.create({
          data: {
            pharmacyOrderId: order.id,
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            createdBy: actorId,
          },
        });
      }

      this.states.set(order.id, 'CREATED');

      const result = {
        ...order,
        status: 'CREATED' as ExtendedPharmacyStatus,
      };

      await this.createAuditLog(actorId, 'PHARMACY_ORDER_CREATED', 'PharmacyOrder', order.id, null, result, ipAddress, userAgent, tx);

      const patientUser = await tx.patient.findUnique({ where: { id: dto.patientId }, include: { userProfile: true } });
      if (patientUser) {
        await tx.notification.create({
          data: {
            recipientId: patientUser.userProfile.userId,
            title: 'Order Created',
            content: `Your pharmacy order #${order.id.slice(0, 8)} has been created successfully.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }

      return result;
    });
  }

  async verify(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'CREATED') {
      throw new BadRequestException('Pharmacy order must be in CREATED state to be verified.');
    }

    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: actorId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    const isPharmacist = userWithRoles?.userRoles.some(ur => ur.role.name === 'PHARMACIST' || ur.role.name === 'ADMIN');
    if (!isPharmacist) {
      throw new ForbiddenException('Only licensed pharmacists are authorized to verify prescriptions.');
    }

    this.states.set(id, 'VERIFIED');

    return this.prisma.$transaction(async (tx) => {
      await tx.pharmacyOrder.update({
        where: { id },
        data: { status: 'CONFIRMED' as PharmacyOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_VERIFIED', 'PharmacyOrder', id, { status: currentStatus }, { status: 'VERIFIED' }, ipAddress, userAgent, tx);
    });
  }

  async prepare(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'VERIFIED') {
      throw new BadRequestException('Pharmacy order must be verified before starting preparation.');
    }

    this.states.set(id, 'PREPARING');

    return this.prisma.$transaction(async (tx) => {
      await tx.pharmacyOrder.update({
        where: { id },
        data: { status: 'PREPARING' as PharmacyOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'PHARMACY_ORDER_PREPARING', 'PharmacyOrder', id, { status: currentStatus }, { status: 'PREPARING' }, ipAddress, userAgent, tx);
    });
  }

  async partialDispense(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'PREPARING' && currentStatus !== 'PARTIALLY_DISPENSED') {
      throw new BadRequestException('Pharmacy order must be in preparing phase to perform partial dispensing.');
    }

    this.states.set(id, 'PARTIALLY_DISPENSED');

    return this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'PARTIAL_DISPENSING', 'PharmacyOrder', id, { status: currentStatus }, { status: 'PARTIALLY_DISPENSED' }, ipAddress, userAgent, tx);
    });
  }

  async dispense(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'PREPARING' && currentStatus !== 'PARTIALLY_DISPENSED' && currentStatus !== 'VERIFIED') {
      throw new BadRequestException('Pharmacy order must be verified or preparing to dispense.');
    }

    this.states.set(id, 'DISPENSED');

    return this.prisma.$transaction(async (tx) => {
      await tx.pharmacyOrder.update({
        where: { id },
        data: { status: 'DISPATCHED' as PharmacyOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'MEDICINES_DISPENSED', 'PharmacyOrder', id, { status: currentStatus }, { status: 'DISPENSED' }, ipAddress, userAgent, tx);

      const patientUser = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patientUser) {
        await tx.notification.create({
          data: {
            recipientId: patientUser.userProfile.userId,
            title: 'Medicines Ready',
            content: `Medicines for Order #${order.id.slice(0, 8)} are ready.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async deliver(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DISPENSED') {
      throw new BadRequestException('Only dispensed orders can be dispatched or delivered.');
    }

    this.states.set(id, 'DELIVERED');

    return this.prisma.$transaction(async (tx) => {
      await tx.pharmacyOrder.update({
        where: { id },
        data: { status: 'DELIVERED' as PharmacyOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'ORDER_DELIVERED', 'PharmacyOrder', id, { status: currentStatus }, { status: 'DELIVERED' }, ipAddress, userAgent, tx);

      const patientUser = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patientUser) {
        await tx.notification.create({
          data: {
            recipientId: patientUser.userProfile.userId,
            title: 'Order Dispatched',
            content: `Your pharmacy order #${order.id.slice(0, 8)} has been dispatched for delivery.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });

        await tx.notification.create({
          data: {
            recipientId: patientUser.userProfile.userId,
            title: 'Order Delivered',
            content: `Your pharmacy order #${order.id.slice(0, 8)} has been delivered successfully.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async collect(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DISPENSED' && currentStatus !== 'PREPARING' && currentStatus !== 'VERIFIED') {
      throw new BadRequestException('Order cannot be collected before dispensing/preparation.');
    }

    this.states.set(id, 'COLLECTED');

    return this.prisma.$transaction(async (tx) => {
      await tx.pharmacyOrder.update({
        where: { id },
        data: { status: 'DELIVERED' as PharmacyOrderStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'ORDER_COLLECTED', 'PharmacyOrder', id, { status: currentStatus }, { status: 'COLLECTED' }, ipAddress, userAgent, tx);

      const patientUser = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patientUser) {
        await tx.notification.create({
          data: {
            recipientId: patientUser.userProfile.userId,
            title: 'Order Collected',
            content: `Your pharmacy order #${order.id.slice(0, 8)} has been collected.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async cancel(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus === 'DELIVERED' || currentStatus === 'COLLECTED' || currentStatus === 'CANCELLED') {
      throw new BadRequestException('Delivered or already cancelled orders cannot be cancelled.');
    }

    this.states.set(id, 'CANCELLED');

    return this.prisma.$transaction(async (tx) => {
      await tx.pharmacyOrder.update({
        where: { id },
        data: { status: 'CANCELLED' as PharmacyOrderStatus, deletedAt: new Date(), deletedBy: actorId },
      });

      await this.createAuditLog(actorId, 'ORDER_CANCELLED', 'PharmacyOrder', id, { status: currentStatus }, { status: 'CANCELLED' }, ipAddress, userAgent, tx);

      const patientUser = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patientUser) {
        await tx.notification.create({
          data: {
            recipientId: patientUser.userProfile.userId,
            title: 'Order Cancelled',
            content: `Your pharmacy order #${order.id.slice(0, 8)} has been cancelled.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }
    });
  }

  async findOne(id: string, user: any) {
    const order = await this.prisma.pharmacyOrder.findUnique({
      where: { id },
      include: {
        patient: { include: { userProfile: true } },
        pharmacy: true,
        items: { include: { medicine: true } },
      },
    });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Pharmacy order with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);

    if (user.roles?.includes('PATIENT')) {
      const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: user.id } });
      if (!actorProfile || order.patient.userProfileId !== actorProfile.id) {
        throw new ForbiddenException('You are not authorized to view this pharmacy order.');
      }
    }

    if (user.roles?.includes('CAREGIVER')) {
      const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: user.id } });
      const caregiver = actorProfile ? await this.prisma.caregiver.findFirst({ where: { userProfileId: actorProfile.id } }) : null;
      if (!caregiver) {
        throw new ForbiddenException('Caregiver details not resolved.');
      }
      const link = await this.prisma.patientCaregiver.findUnique({
        where: { patientId_caregiverId: { patientId: order.patientId, caregiverId: caregiver.id } },
      });
      if (!link) {
        throw new ForbiddenException('You do not have delegation rights for this patient.');
      }
    }

    return {
      ...order,
      status: currentStatus,
    };
  }

  async findAll(user: any) {
    const where: any = { deletedAt: null };

    if (user.roles?.includes('PATIENT')) {
      const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: user.id } });
      if (actorProfile) {
        const patient = await this.prisma.patient.findUnique({ where: { userProfileId: actorProfile.id } });
        if (patient) {
          where.patientId = patient.id;
        }
      }
    }

    const list = await this.prisma.pharmacyOrder.findMany({
      where,
      include: { patient: { include: { userProfile: true } }, pharmacy: true },
      orderBy: { createdAt: 'desc' },
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
