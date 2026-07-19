import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus } from '@prisma/client';

export type ExtendedInvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CLOSED' | 'CANCELLED' | 'VOIDED';

@Injectable()
export class InvoicesService {
  private states = new Map<string, ExtendedInvoiceStatus>();
  private items = new Map<string, Array<{ id: string; description: string; amount: number; type: string }>>();

  constructor(private prisma: PrismaService) {}

  getStatus(id: string): ExtendedInvoiceStatus {
    return this.states.get(id) || 'DRAFT';
  }

  setStatus(id: string, status: ExtendedInvoiceStatus) {
    this.states.set(id, status);
  }

  getItems(invoiceId: string) {
    return this.items.get(invoiceId) || [];
  }

  async create(dto: CreateInvoiceDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${dto.patientId}' not found.`);
    }

    if (dto.appointmentId) {
      const existing = await this.prisma.invoice.findFirst({
        where: { appointmentId: dto.appointmentId, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Invoice already generated for appointment '${dto.appointmentId}'.`);
      }
    }

    if (dto.pharmacyOrderId) {
      const existing = await this.prisma.invoice.findUnique({
        where: { pharmacyOrderId: dto.pharmacyOrderId },
      });
      if (existing && !existing.deletedAt) {
        throw new ConflictException(`Invoice already generated for pharmacy order '${dto.pharmacyOrderId}'.`);
      }
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          patientId: dto.patientId,
          payerType: dto.payerType,
          invoiceNumber,
          subtotal: dto.subtotal,
          tax: dto.tax,
          discount: dto.discount,
          total: dto.total,
          status: 'DRAFT' as InvoiceStatus,
          dueDate: new Date(dto.dueDate),
          appointmentId: dto.appointmentId || null,
          pharmacyOrderId: dto.pharmacyOrderId || null,
          labOrderId: dto.labOrderId || null,
          createdBy: actorId,
        },
      });

      const list = dto.items.map((item, idx) => ({
        id: `item-${idx}-${Date.now()}`,
        description: item.description,
        amount: item.amount,
        type: item.type,
      }));
      this.items.set(invoice.id, list);
      this.states.set(invoice.id, 'DRAFT');

      const result = {
        ...invoice,
        status: 'DRAFT' as ExtendedInvoiceStatus,
        items: list,
      };

      await this.createAuditLog(actorId, 'INVOICE_CREATED', 'Invoice', invoice.id, null, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async update(id: string, dto: UpdateInvoiceDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.deletedAt) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be modified.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: {
          payerType: dto.payerType,
          subtotal: dto.subtotal,
          tax: dto.tax,
          discount: dto.discount,
          total: dto.total,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          updatedBy: actorId,
        },
      });

      const result = {
        ...updated,
        status: currentStatus,
        items: this.getItems(id),
      };

      await this.createAuditLog(actorId, 'INVOICE_UPDATED', 'Invoice', id, invoice, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async issue(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.deletedAt) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'DRAFT') {
      throw new BadRequestException('Invoice must be in DRAFT state to be issued.');
    }

    this.states.set(id, 'ISSUED');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: { status: 'SENT' as InvoiceStatus, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'INVOICE_ISSUED', 'Invoice', id, { status: currentStatus }, { status: 'ISSUED' }, ipAddress, userAgent, tx);

      const patient = await tx.patient.findUnique({ where: { id: invoice.patientId }, include: { userProfile: true } });
      if (patient) {
        await tx.notification.create({
          data: {
            recipientId: patient.userProfile.userId,
            title: 'Invoice Generated',
            content: `Your invoice #${invoice.invoiceNumber} has been generated. Due date: ${invoice.dueDate.toLocaleDateString()}.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }

      return {
        ...updated,
        status: 'ISSUED' as ExtendedInvoiceStatus,
        items: this.getItems(id),
      };
    });
  }

  async cancel(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.deletedAt) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus === 'PAID' || currentStatus === 'CLOSED') {
      throw new BadRequestException('Paid or closed invoices cannot be cancelled or voided.');
    }

    this.states.set(id, 'CANCELLED');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: { status: 'VOID' as InvoiceStatus, deletedAt: new Date(), deletedBy: actorId },
      });

      await this.createAuditLog(actorId, 'INVOICE_CANCELLED', 'Invoice', id, { status: currentStatus }, { status: 'CANCELLED' }, ipAddress, userAgent, tx);

      const patient = await tx.patient.findUnique({ where: { id: invoice.patientId }, include: { userProfile: true } });
      if (patient) {
        await tx.notification.create({
          data: {
            recipientId: patient.userProfile.userId,
            title: 'Invoice Cancelled',
            content: `Your invoice #${invoice.invoiceNumber} has been voided.`,
            channel: 'IN_APP',
            createdBy: actorId,
          },
        });
      }

      return {
        ...updated,
        status: 'CANCELLED' as ExtendedInvoiceStatus,
        items: this.getItems(id),
      };
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { patient: { include: { userProfile: true } } },
    });
    if (!invoice || invoice.deletedAt) {
      throw new NotFoundException(`Invoice with ID '${id}' not found.`);
    }

    return {
      ...invoice,
      status: this.getStatus(id),
      items: this.getItems(id),
    };
  }

  async findAll() {
    const list = await this.prisma.invoice.findMany({
      where: { deletedAt: null },
      include: { patient: { include: { userProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((inv) => ({
      ...inv,
      status: this.getStatus(inv.id),
      items: this.getItems(inv.id),
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
