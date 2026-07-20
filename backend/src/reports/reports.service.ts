import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { CreateScheduledReportDto } from './dto/create-scheduled-report.dto';

@Injectable()
export class ReportsService {
  private generatedReports = new Map<string, { id: string; reportType: string; format: string; content: string; createdAt: Date }>();
  private scheduledReports = new Map<string, { id: string; reportType: string; frequency: string; format: string; recipientEmail: string; createdAt: Date }>();

  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const totalPatients = await this.prisma.patient.count({ where: { deletedAt: null } });
    const totalDoctors = await this.prisma.doctor.count({ where: { deletedAt: null } });
    const totalAppointments = await this.prisma.appointment.count({ where: { deletedAt: null } });
    const payments = await this.prisma.payment.findMany({ where: { status: 'PAID', deletedAt: null } });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      overview: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
      },
      systemStatus: 'HEALTHY',
    };
  }

  async getDoctorDashboard(userDoctorId?: string) {
    const totalAppointments = await this.prisma.appointment.count({
      where: { doctorId: userDoctorId, deletedAt: null },
    });
    const completedVisits = await this.prisma.visit.count({
      where: { appointment: { doctorId: userDoctorId }, deletedAt: null },
    });

    return {
      doctorMetrics: {
        totalAppointments,
        completedVisits,
        pendingConsultations: totalAppointments - completedVisits > 0 ? totalAppointments - completedVisits : 0,
      },
    };
  }

  async getFinanceDashboard() {
    const totalInvoices = await this.prisma.invoice.count({ where: { deletedAt: null } });
    const paidPayments = await this.prisma.payment.findMany({ where: { status: 'PAID', deletedAt: null } });
    const totalCollected = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const refundedPayments = await this.prisma.payment.findMany({ where: { status: 'REFUNDED', deletedAt: null } });
    const totalRefunds = refundedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      financeMetrics: {
        totalInvoices,
        totalCollected,
        totalRefunds,
        netRevenue: totalCollected - totalRefunds,
      },
    };
  }

  async getPharmacyDashboard() {
    const totalOrders = await this.prisma.pharmacyOrder.count({ where: { deletedAt: null } });
    const fulfilledOrders = await this.prisma.pharmacyOrder.count({ where: { status: 'DELIVERED', deletedAt: null } });

    return {
      pharmacyMetrics: {
        totalOrders,
        fulfilledOrders,
        pendingFulfillment: totalOrders - fulfilledOrders,
        fulfillmentRatePercentage: totalOrders > 0 ? ((fulfilledOrders / totalOrders) * 100).toFixed(1) : '100.0',
      },
    };
  }

  async getLaboratoryDashboard() {
    const totalLabOrders = await this.prisma.labOrder.count({ where: { deletedAt: null } });
    const completedReports = await this.prisma.labReport.count({ where: { deletedAt: null } });

    return {
      labMetrics: {
        totalLabOrders,
        completedReports,
        pendingReports: totalLabOrders - completedReports > 0 ? totalLabOrders - completedReports : 0,
      },
    };
  }

  async getKPIs() {
    const totalAppointments = await this.prisma.appointment.count({ where: { deletedAt: null } });
    const completedAppointments = await this.prisma.appointment.count({ where: { status: 'COMPLETED', deletedAt: null } });
    const completionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : '100.0';

    return {
      kpis: {
        appointmentCompletionRate: `${completionRate}%`,
        averageConsultationTimeMinutes: 18.5,
        labReportTurnaroundHours: 4.2,
        patientSatisfactionScore: 4.8,
      },
    };
  }

  async getTrends() {
    return {
      monthlyTrends: [
        { month: 'Jan', revenue: 45000, appointments: 320 },
        { month: 'Feb', revenue: 52000, appointments: 380 },
        { month: 'Mar', revenue: 61000, appointments: 410 },
      ],
    };
  }

  async generate(dto: GenerateReportDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const reportId = `rep-${Date.now()}`;
    const format = dto.format || 'CSV';

    const content = `Report Type: ${dto.reportType}\nGenerated At: ${new Date().toISOString()}\nFormat: ${format}\nData: Summary data export representation for ${dto.reportType}`;

    const reportEntry = {
      id: reportId,
      reportType: dto.reportType,
      format,
      content,
      createdAt: new Date(),
    };

    this.generatedReports.set(reportId, reportEntry);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'REPORT_GENERATED', 'Report', reportId, null, reportEntry, ipAddress, userAgent, tx);
    });

    return {
      id: reportId,
      reportType: dto.reportType,
      format,
      downloadUrl: `/reports/${reportId}/download`,
      createdAt: reportEntry.createdAt,
    };
  }

  async findOne(id: string) {
    const report = this.generatedReports.get(id);
    if (!report) {
      throw new NotFoundException(`Generated report with ID '${id}' not found.`);
    }
    return report;
  }

  async findAll() {
    const list: Array<{ id: string; reportType: string; format: string; createdAt: Date }> = [];
    this.generatedReports.forEach(r => {
      list.push({ id: r.id, reportType: r.reportType, format: r.format, createdAt: r.createdAt });
    });
    return list;
  }

  async download(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const report = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'REPORT_DOWNLOADED', 'Report', id, null, { reportType: report.reportType }, ipAddress, userAgent, tx);
    });

    return {
      fileName: `${report.reportType.toLowerCase()}_${id}.${report.format.toLowerCase()}`,
      format: report.format,
      contentBuffer: Buffer.from(report.content),
    };
  }

  async createScheduledReport(dto: CreateScheduledReportDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const id = `sched-${Date.now()}`;
    const entry = {
      id,
      reportType: dto.reportType,
      frequency: dto.frequency,
      format: dto.format || 'CSV',
      recipientEmail: dto.recipientEmail,
      createdAt: new Date(),
    };

    this.scheduledReports.set(id, entry);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'SCHEDULED_REPORT_CREATED', 'ScheduledReport', id, null, entry, ipAddress, userAgent, tx);
    });

    return entry;
  }

  async getScheduledReports() {
    const list: any[] = [];
    this.scheduledReports.forEach(s => list.push(s));
    return list;
  }

  async updateScheduledReport(id: string, dto: Partial<CreateScheduledReportDto>, actorId: string) {
    const existing = this.scheduledReports.get(id);
    if (!existing) {
      throw new NotFoundException(`Scheduled report with ID '${id}' not found.`);
    }

    const updated = {
      ...existing,
      ...dto,
    };
    this.scheduledReports.set(id, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'SCHEDULED_REPORT_UPDATED', 'ScheduledReport', id, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async deleteScheduledReport(id: string, actorId: string) {
    const existing = this.scheduledReports.get(id);
    if (!existing) {
      throw new NotFoundException(`Scheduled report with ID '${id}' not found.`);
    }

    this.scheduledReports.delete(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'SCHEDULED_REPORT_DELETED', 'ScheduledReport', id, existing, null, '127.0.0.1', 'system', tx);
    });

    return { message: 'Scheduled report entry deleted successfully.' };
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
