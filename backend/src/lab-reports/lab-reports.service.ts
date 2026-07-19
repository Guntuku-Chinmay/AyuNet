import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LabOrdersService } from '../lab-orders/lab-orders.service';
import { UploadLabReportDto } from './dto/upload-report.dto';
import { UpdateLabReportDto } from './dto/update-report.dto';
import { LabReportStatus } from '@prisma/client';

@Injectable()
export class LabReportsService {
  constructor(
    private prisma: PrismaService,
    private labOrdersService: LabOrdersService
  ) {}

  async create(dto: UploadLabReportDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.labOrder.findUnique({ where: { id: dto.labOrderId } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`Lab order with ID '${dto.labOrderId}' not found.`);
    }

    const orderStatus = this.labOrdersService.getStatus(dto.labOrderId);
    if (orderStatus === 'ORDERED' || orderStatus === 'ACCEPTED') {
      throw new BadRequestException('Cannot upload clinical findings report before sample collection.');
    }

    if (dto.attachmentId) {
      const attachment = await this.prisma.attachment.findUnique({ where: { id: dto.attachmentId } });
      if (!attachment) {
        throw new NotFoundException(`Attachment with ID '${dto.attachmentId}' not found.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const report = await tx.labReport.create({
        data: {
          labOrderId: dto.labOrderId,
          reportDate: new Date(),
          summaryFindings: dto.summaryFindings.trim(),
          status: 'FINAL' as LabReportStatus,
          createdBy: actorId,
        },
      });

      if (dto.attachmentId) {
        await tx.labReportAttachment.create({
          data: {
            labReportId: report.id,
            attachmentId: dto.attachmentId,
            createdBy: actorId,
          },
        });
      }

      this.labOrdersService.setStatus(dto.labOrderId, 'REPORT_READY');

      await this.createAuditLog(actorId, 'LAB_REPORT_UPLOADED', 'LabReport', report.id, null, report, ipAddress, userAgent, tx);

      const patient = await tx.patient.findUnique({ where: { id: order.patientId }, include: { userProfile: true } });
      if (patient) {
        await tx.notification.create({
          data: {
            recipientId: patient.userProfile.userId,
            title: 'Report Ready',
            content: `Your report findings are uploaded for Order #${order.id.slice(0, 8)}. Awaiting verification.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }

      return report;
    });
  }

  async update(id: string, dto: UpdateLabReportDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const report = await this.prisma.labReport.findUnique({ where: { id } });
    if (!report || report.deletedAt) {
      throw new NotFoundException(`Lab report with ID '${id}' not found.`);
    }

    const orderStatus = this.labOrdersService.getStatus(report.labOrderId);
    if (orderStatus === 'VERIFIED' || orderStatus === 'DELIVERED') {
      throw new BadRequestException('Verified or delivered lab reports are immutable.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.labReport.update({
        where: { id },
        data: {
          summaryFindings: dto.summaryFindings ? dto.summaryFindings.trim() : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'LAB_REPORT_UPDATED', 'LabReport', id, report, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async findOne(id: string, user: any) {
    const report = await this.prisma.labReport.findUnique({
      where: { id },
      include: {
        labOrder: {
          include: {
            patient: { include: { userProfile: true } },
          },
        },
        attachments: { include: { attachment: true } },
      },
    });
    if (!report || report.deletedAt) {
      throw new NotFoundException(`Lab report with ID '${id}' not found.`);
    }

    const orderStatus = this.labOrdersService.getStatus(report.labOrderId);

    if (user.roles?.includes('PATIENT')) {
      const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: user.id } });
      if (!actorProfile || report.labOrder.patient.userProfileId !== actorProfile.id) {
        throw new ForbiddenException('You are not authorized to view this report.');
      }
      if (orderStatus !== 'DELIVERED' && orderStatus !== 'VERIFIED') {
        throw new ForbiddenException('Laboratory findings report is awaiting clinician verification.');
      }
    }

    if (user.roles?.includes('CAREGIVER')) {
      const actorProfile = await this.prisma.userProfile.findFirst({ where: { userId: user.id } });
      const caregiver = actorProfile ? await this.prisma.caregiver.findFirst({ where: { userProfileId: actorProfile.id } }) : null;
      if (!caregiver) {
        throw new ForbiddenException('Caregiver details not resolved.');
      }
      const link = await this.prisma.patientCaregiver.findUnique({
        where: { patientId_caregiverId: { patientId: report.labOrder.patientId, caregiverId: caregiver.id } },
      });
      if (!link) {
        throw new ForbiddenException('You do not have delegation rights for this patient.');
      }
      if (orderStatus !== 'DELIVERED' && orderStatus !== 'VERIFIED') {
        throw new ForbiddenException('Laboratory findings report is awaiting clinician verification.');
      }
    }

    return {
      ...report,
      orderStatus,
    };
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
