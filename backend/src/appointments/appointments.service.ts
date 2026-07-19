import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async bookAppointment(dto: BookAppointmentDto, creatorId?: string, ipAddress?: string, userAgent?: string) {
    const start = new Date(dto.scheduledStartAt);
    const end = new Date(dto.scheduledEndAt);
    const now = new Date();

    if (start.getTime() <= now.getTime()) {
      throw new BadRequestException('Appointments must be booked for future times only.');
    }

    // 1. Validate Patient
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      include: { userProfile: { include: { user: true } } },
    });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found or is inactive.`);
    }

    // 2. Validate Doctor
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { userProfile: { include: { user: true } } },
    });
    if (!doctor || doctor.deletedAt) {
      throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found or is inactive.`);
    }

    // 3. Validate Branch
    const branch = await this.prisma.hospitalBranch.findUnique({ where: { id: dto.branchId } });
    if (!branch || branch.deletedAt) {
      throw new NotFoundException(`Branch with ID '${dto.branchId}' not found.`);
    }

    // 4. Validate TimeSlot
    const slot = await this.prisma.timeSlot.findUnique({ where: { id: dto.timeSlotId } });
    if (!slot || slot.deletedAt) {
      throw new NotFoundException(`TimeSlot with ID '${dto.timeSlotId}' not found.`);
    }
    if (slot.isReserved) {
      throw new ConflictException('This time slot is already reserved.');
    }
    if (slot.doctorId !== dto.doctorId || slot.branchId !== dto.branchId) {
      throw new BadRequestException('Time slot mismatch with selected doctor or branch.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Prevent double booking for doctor
      const doctorOverlap = await tx.appointment.findFirst({
        where: {
          doctorId: dto.doctorId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          deletedAt: null,
          OR: [
            { scheduledStartAt: { lte: start }, scheduledEndAt: { gt: start } },
            { scheduledStartAt: { lt: end }, scheduledEndAt: { gte: end } },
          ],
        },
      });
      if (doctorOverlap) {
        throw new ConflictException('Doctor has an overlapping appointment slot.');
      }

      // Prevent double booking for patient
      const patientOverlap = await tx.appointment.findFirst({
        where: {
          patientId: dto.patientId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          deletedAt: null,
          OR: [
            { scheduledStartAt: { lte: start }, scheduledEndAt: { gt: start } },
            { scheduledStartAt: { lt: end }, scheduledEndAt: { gte: end } },
          ],
        },
      });
      if (patientOverlap) {
        throw new ConflictException('Patient has an overlapping appointment scheduled.');
      }

      // Reserve slot
      await tx.timeSlot.update({
        where: { id: dto.timeSlotId },
        data: { isReserved: true, updatedBy: creatorId },
      });

      // Create appointment
      const app = await tx.appointment.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          branchId: dto.branchId,
          timeSlotId: dto.timeSlotId,
          scheduledStartAt: start,
          scheduledEndAt: end,
          type: dto.type,
          status: 'PENDING',
          createdBy: creatorId,
        },
        include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, branch: true },
      });

      // Trigger notifications
      if (patient.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          patient.userProfile.userId,
          'Appointment Booked',
          `Your appointment with Dr. ${doctor.userProfile.firstName} ${doctor.userProfile.lastName} at ${branch.name} is booked.`,
          'IN_APP',
          { appointmentId: app.id }
        );
      }
      if (doctor.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          doctor.userProfile.userId,
          'New Appointment Booked',
          `New appointment booked with patient ${patient.userProfile.firstName} ${patient.userProfile.lastName} on ${start.toDateString()}`,
          'IN_APP',
          { appointmentId: app.id }
        );
      }

      await this.createAuditLog(creatorId, 'APPOINTMENT_CREATED', 'Appointment', app.id, null, app, ipAddress, userAgent, tx);
      return app;
    });
  }

  async confirm(id: string, updaterId: string, ipAddress?: string, userAgent?: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } } },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }
    if (app.status !== 'PENDING') {
      throw new BadRequestException('Only pending appointments can be confirmed.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.appointment.update({
        where: { id },
        data: { status: 'CONFIRMED', updatedBy: updaterId },
      });

      if (app.patient.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          app.patient.userProfile.userId,
          'Appointment Confirmed',
          `Your appointment with Dr. ${app.doctor.userProfile.firstName} ${app.doctor.userProfile.lastName} has been confirmed.`,
          'IN_APP',
          { appointmentId: id }
        );
      }

      await this.createAuditLog(updaterId, 'APPOINTMENT_CONFIRMED', 'Appointment', id, app, result, ipAddress, userAgent, tx);
      return result;
    });

    return updated;
  }

  async cancel(id: string, updaterId: string, ipAddress?: string, userAgent?: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } } },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }
    if (app.status === 'CANCELLED' || app.status === 'COMPLETED') {
      throw new BadRequestException('Appointment is already cancelled or completed.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.appointment.update({
        where: { id },
        data: { status: 'CANCELLED', updatedBy: updaterId },
      });

      // Release Slot
      await tx.timeSlot.update({
        where: { id: app.timeSlotId },
        data: { isReserved: false, updatedBy: updaterId },
      });

      if (app.patient.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          app.patient.userProfile.userId,
          'Appointment Cancelled',
          `Your appointment with Dr. ${app.doctor.userProfile.firstName} ${app.doctor.userProfile.lastName} has been cancelled.`,
          'IN_APP',
          { appointmentId: id }
        );
      }

      await this.createAuditLog(updaterId, 'APPOINTMENT_CANCELLED', 'Appointment', id, app, result, ipAddress, userAgent, tx);
      return result;
    });

    return updated;
  }

  async reschedule(id: string, dto: RescheduleAppointmentDto, updaterId: string, ipAddress?: string, userAgent?: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } } },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }

    const start = new Date(dto.scheduledStartAt);
    const end = new Date(dto.scheduledEndAt);

    // Validate new slot
    const slot = await this.prisma.timeSlot.findUnique({ where: { id: dto.timeSlotId } });
    if (!slot || slot.deletedAt) {
      throw new NotFoundException(`TimeSlot with ID '${dto.timeSlotId}' not found.`);
    }
    if (slot.isReserved && slot.id !== app.timeSlotId) {
      throw new ConflictException('The selected time slot is already reserved.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Release old slot
      await tx.timeSlot.update({
        where: { id: app.timeSlotId },
        data: { isReserved: false, updatedBy: updaterId },
      });

      // Reserve new slot
      await tx.timeSlot.update({
        where: { id: dto.timeSlotId },
        data: { isReserved: true, updatedBy: updaterId },
      });

      const result = await tx.appointment.update({
        where: { id },
        data: {
          timeSlotId: dto.timeSlotId,
          scheduledStartAt: start,
          scheduledEndAt: end,
          status: 'CONFIRMED',
          updatedBy: updaterId,
        },
      });

      if (app.patient.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          app.patient.userProfile.userId,
          'Appointment Rescheduled',
          `Your appointment with Dr. ${app.doctor.userProfile.firstName} ${app.doctor.userProfile.lastName} has been rescheduled to ${start.toLocaleString()}.`,
          'IN_APP',
          { appointmentId: id }
        );
      }

      await this.createAuditLog(updaterId, 'APPOINTMENT_RESCHEDULED', 'Appointment', id, app, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async checkin(id: string, updaterId: string, ipAddress?: string, userAgent?: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } } },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Calculate daily queue count for doctor to generate queue ID
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkinCount = await tx.visit.count({
        where: {
          doctorId: app.doctorId,
          createdAt: { gte: today },
        },
      });

      const queueNo = `Q-${app.doctor.userProfile.lastName.toUpperCase().slice(0, 3)}-${checkinCount + 1}`;

      // Create Visit record
      const visit = await tx.visit.create({
        data: {
          patientId: app.patientId,
          doctorId: app.doctorId,
          branchId: app.branchId,
          appointmentId: app.id,
          visitType: app.type,
          visitStatus: 'ACTIVE',
          checkInAt: new Date(),
          createdBy: updaterId,
        },
      });

      if (app.patient.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          app.patient.userProfile.userId,
          'Patient Checked In',
          `You have checked in for your appointment. Your queue number is ${queueNo}.`,
          'IN_APP',
          { visitId: visit.id }
        );
      }

      await this.createAuditLog(updaterId, 'PATIENT_CHECKED_IN', 'Appointment', id, app, visit, ipAddress, userAgent, tx);
      return { appointment: app, visit, queueNo };
    });
  }

  async startConsultation(id: string, updaterId: string, ipAddress?: string, userAgent?: string) {
    const visit = await this.prisma.visit.findFirst({
      where: { appointmentId: id, deletedAt: null },
      include: { doctor: { include: { userProfile: true } }, patient: { include: { userProfile: true } } },
    });
    if (!visit) {
      throw new NotFoundException(`Active Visit record for Appointment ID '${id}' not found.`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(updaterId, 'CONSULTATION_STARTED', 'Visit', visit.id, null, { started: true }, ipAddress, userAgent, tx);
      return visit;
    });

    if (visit.patient.userProfile.userId) {
      await this.notificationsService.triggerNotification(
        visit.patient.userProfile.userId,
        'Consultation Started',
        `Your consultation with Dr. ${visit.doctor.userProfile.firstName} ${visit.doctor.userProfile.lastName} has started.`,
        'IN_APP',
        { visitId: visit.id }
      );
    }

    return updated;
  }

  async complete(id: string, updaterId: string, ipAddress?: string, userAgent?: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } } },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }

    const visit = await this.prisma.visit.findFirst({
      where: { appointmentId: id, deletedAt: null },
    });

    return this.prisma.$transaction(async (tx) => {
      const updatedApp = await tx.appointment.update({
        where: { id },
        data: { status: 'COMPLETED', updatedBy: updaterId },
      });

      let updatedVisit = null;
      if (visit) {
        updatedVisit = await tx.visit.update({
          where: { id: visit.id },
          data: {
            visitStatus: 'COMPLETED',
            checkOutAt: new Date(),
            updatedBy: updaterId,
          },
        });
      }

      if (app.patient.userProfile.userId) {
        await this.notificationsService.triggerNotification(
          app.patient.userProfile.userId,
          'Appointment Completed',
          `Your visit has been completed successfully. Thank you!`,
          'IN_APP',
          { appointmentId: id }
        );
      }

      await this.createAuditLog(updaterId, 'APPOINTMENT_COMPLETED', 'Appointment', id, app, updatedApp, ipAddress, userAgent, tx);
      return { appointment: updatedApp, visit: updatedVisit };
    });
  }

  async noShow(id: string, updaterId: string, ipAddress?: string, userAgent?: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id },
        data: { status: 'NOSHOW', updatedBy: updaterId },
      });

      // Release slot
      await tx.timeSlot.update({
        where: { id: app.timeSlotId },
        data: { isReserved: false, updatedBy: updaterId },
      });

      await this.createAuditLog(updaterId, 'APPOINTMENT_NOSHOW', 'Appointment', id, app, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, branch: true, visit: true },
    });
    if (!app || app.deletedAt) {
      throw new NotFoundException(`Appointment with ID '${id}' not found.`);
    }
    return app;
  }

  async findAll(query: { patientId?: string; doctorId?: string; branchId?: string; status?: AppointmentStatus }) {
    const where: any = { deletedAt: null };
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.status) where.status = query.status;

    return this.prisma.appointment.findMany({
      where,
      include: { patient: { include: { userProfile: true } }, doctor: { include: { userProfile: true } }, branch: true },
      orderBy: { scheduledStartAt: 'desc' },
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
