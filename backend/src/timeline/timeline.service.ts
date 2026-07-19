import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class TimelineService {
  constructor(
    private prisma: PrismaService,
    private patientsService: PatientsService
  ) {}

  async getTimeline(patientId: string, user: any) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${patientId}' not found.`);
    }

    // Verify patient access scope
    await this.patientsService.checkPatientAccess(patientId, user);

    const [appointments, prescriptions, labOrders, invoices, visits] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { patientId, deletedAt: null },
        include: { doctor: { include: { userProfile: true } }, branch: true },
      }),
      this.prisma.prescription.findMany({
        where: { patientId, deletedAt: null },
        include: { doctor: { include: { userProfile: true } } },
      }),
      this.prisma.labOrder.findMany({
        where: { patientId, deletedAt: null },
        include: { diagnosticCenter: true },
      }),
      this.prisma.invoice.findMany({
        where: { patientId, deletedAt: null },
      }),
      this.prisma.visit.findMany({
        where: { patientId, deletedAt: null },
        include: { doctor: { include: { userProfile: true } }, branch: true },
      }),
    ]);

    const timelineEvents: any[] = [];

    // Map Appointments
    appointments.forEach((item) => {
      timelineEvents.push({
        id: item.id,
        type: 'APPOINTMENT',
        date: item.scheduledStartAt,
        title: 'Appointment Scheduled',
        description: `Appointment type ${item.type} with Dr. ${item.doctor.userProfile.firstName} ${item.doctor.userProfile.lastName} at ${item.branch.name}`,
        status: item.status,
      });
    });

    // Map Prescriptions
    prescriptions.forEach((item) => {
      timelineEvents.push({
        id: item.id,
        type: 'PRESCRIPTION',
        date: item.issuedAt,
        title: 'Prescription Issued',
        description: `Prescription (Status: ${item.status}) issued by Dr. ${item.doctor.userProfile.firstName} ${item.doctor.userProfile.lastName}. Valid until ${item.validUntil.toDateString()}`,
        status: item.status,
      });
    });

    // Map Lab Orders
    labOrders.forEach((item) => {
      timelineEvents.push({
        id: item.id,
        type: 'LAB_ORDER',
        date: item.orderedAt,
        title: 'Lab Test Ordered',
        description: `Lab order (Status: ${item.status}) sent to diagnostic center: ${item.diagnosticCenter.name}`,
        status: item.status,
      });
    });

    // Map Billing Invoices
    invoices.forEach((item) => {
      timelineEvents.push({
        id: item.id,
        type: 'BILLING',
        date: item.createdAt,
        title: 'Invoice Issued',
        description: `Invoice ${item.invoiceNumber} for subtotal ${item.subtotal}, total ${item.total} (Status: ${item.status})`,
        status: item.status,
      });
    });

    // Map Admissions / Visits
    visits.forEach((item) => {
      timelineEvents.push({
        id: item.id,
        type: 'ADMISSION',
        date: item.checkInAt,
        title: 'Admission / Clinical Visit',
        description: `Checked in for ${item.visitType} at ${item.branch.name} under Dr. ${item.doctor.userProfile.firstName} ${item.doctor.userProfile.lastName}. Check-out: ${item.checkOutAt ? item.checkOutAt.toISOString() : 'Active'}`,
        status: item.visitStatus,
      });
    });

    // Sort chronologically descending
    timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

    return timelineEvents;
  }
}
