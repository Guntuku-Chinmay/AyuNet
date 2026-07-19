import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, InvoiceStatus, TransactionType } from '@prisma/client';

export type ExtendedPaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

@Injectable()
export class PaymentsService {
  private states = new Map<string, ExtendedPaymentStatus>();

  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService
  ) {}

  getStatus(id: string): ExtendedPaymentStatus {
    return this.states.get(id) || 'PENDING';
  }

  setStatus(id: string, status: ExtendedPaymentStatus) {
    this.states.set(id, status);
  }

  async create(dto: CreatePaymentDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
    if (!invoice || invoice.deletedAt) {
      throw new NotFoundException(`Invoice with ID '${dto.invoiceId}' not found.`);
    }

    const invoiceStatus = this.invoicesService.getStatus(dto.invoiceId);
    if (invoiceStatus === 'PAID' || invoiceStatus === 'CLOSED') {
      throw new BadRequestException('Invoice has already been fully paid and closed.');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          currency: dto.currency || 'INR',
          status: 'PENDING' as PaymentStatus,
          paymentGateway: dto.paymentGateway,
          gatewayReferenceId: dto.gatewayReferenceId,
          createdBy: actorId,
        },
      });

      this.states.set(payment.id, 'PENDING');

      const transaction = await tx.transaction.create({
        data: {
          paymentId: payment.id,
          invoiceId: dto.invoiceId,
          transactionType: 'CHARGE' as TransactionType,
          amount: dto.amount,
          currency: dto.currency || 'INR',
          status: 'PENDING',
          gatewayTransactionId: dto.gatewayReferenceId,
          createdBy: actorId,
        },
      });

      this.states.set(payment.id, 'AUTHORIZED');

      const result = {
        ...payment,
        status: 'AUTHORIZED' as ExtendedPaymentStatus,
        transactionId: transaction.id,
      };

      await this.createAuditLog(actorId, 'PAYMENT_CREATED', 'Payment', payment.id, null, result, ipAddress, userAgent, tx);
      return result;
    });
  }

  async capture(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.deletedAt) {
      throw new NotFoundException(`Payment with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'PENDING' && currentStatus !== 'AUTHORIZED') {
      throw new BadRequestException('Payment must be pending or authorized to capture.');
    }

    this.states.set(id, 'PAID');

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status: 'PAID' as PaymentStatus, updatedBy: actorId },
      });

      await tx.transaction.updateMany({
        where: { paymentId: id },
        data: { status: 'SUCCESS' },
      });

      const allPayments = await tx.payment.findMany({
        where: { invoiceId: payment.invoiceId, status: 'PAID' as PaymentStatus, deletedAt: null },
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });

      if (invoice) {
        if (totalPaid >= Number(invoice.total)) {
          await tx.invoice.update({
            where: { id: payment.invoiceId },
            data: { status: 'PAID' as InvoiceStatus },
          });
          this.invoicesService.setStatus(payment.invoiceId, 'PAID');
        } else {
          this.invoicesService.setStatus(payment.invoiceId, 'PARTIALLY_PAID');
        }

        const patient = await tx.patient.findUnique({ where: { id: invoice.patientId }, include: { userProfile: true } });
        if (patient) {
          await tx.notification.create({
            data: {
              recipientId: patient.userProfile.userId,
              title: 'Payment Successful',
              content: `Your payment of ${payment.currency} ${payment.amount} for Invoice #${invoice.invoiceNumber} was successful.`,
              channel: 'IN_APP',
              createdBy: actorId,
            },
          });
        }
      }

      await this.createAuditLog(actorId, 'PAYMENT_CAPURED', 'Payment', id, { status: currentStatus }, { status: 'PAID' }, ipAddress, userAgent, tx);
      return updatedPayment;
    });
  }

  async refund(id: string, amount: number, _reason: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.deletedAt) {
      throw new NotFoundException(`Payment with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    if (currentStatus !== 'PAID') {
      throw new BadRequestException('Only successfully captured paid payments can be refunded.');
    }

    if (amount > Number(payment.amount)) {
      throw new BadRequestException('Refund amount exceeds the original payment capture limit.');
    }

    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: actorId },
      include: { userRoles: { include: { role: true } } },
    });
    const isAdmin = userWithRoles?.userRoles.some(ur => ur.role.name === 'ADMIN' || ur.role.name === 'FINANCE_OFFICER');
    if (!isAdmin) {
      throw new ForbiddenException('Only hospital administration and finance officers can authorize transaction refunds.');
    }

    this.states.set(id, 'REFUNDED');

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status: 'REFUNDED' as PaymentStatus, updatedBy: actorId },
      });

      await tx.transaction.create({
        data: {
          paymentId: id,
          invoiceId: payment.invoiceId,
          transactionType: 'REFUND' as TransactionType,
          amount: -amount,
          currency: payment.currency,
          status: 'SUCCESS',
          gatewayTransactionId: `REF-${payment.gatewayReferenceId}`,
          createdBy: actorId,
        },
      });

      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (invoice) {
        this.invoicesService.setStatus(payment.invoiceId, 'VOIDED');

        const patient = await tx.patient.findUnique({ where: { id: invoice.patientId }, include: { userProfile: true } });
        if (patient) {
          await tx.notification.create({
            data: {
              recipientId: patient.userProfile.userId,
              title: 'Refund Approved',
              content: `A refund of ${payment.currency} ${amount} has been approved for Invoice #${invoice.invoiceNumber}.`,
              channel: 'IN_APP',
              createdBy: actorId,
            },
          });

          await tx.notification.create({
            data: {
              recipientId: patient.userProfile.userId,
              title: 'Refund Completed',
              content: `A refund of ${payment.currency} ${amount} has been credited back to your account.`,
              channel: 'IN_APP',
              createdBy: actorId,
            },
          });
        }
      }

      await this.createAuditLog(actorId, 'REFUND_COMPLETED', 'Payment', id, { status: currentStatus }, { status: 'REFUNDED' }, ipAddress, userAgent, tx);
      return updatedPayment;
    });
  }

  async fail(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.deletedAt) {
      throw new NotFoundException(`Payment with ID '${id}' not found.`);
    }

    const currentStatus = this.getStatus(id);
    this.states.set(id, 'FAILED');

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status: 'FAILED' as PaymentStatus, updatedBy: actorId },
      });

      await tx.transaction.updateMany({
        where: { paymentId: id },
        data: { status: 'FAILED' },
      });

      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (invoice) {
        const patient = await tx.patient.findUnique({ where: { id: invoice.patientId }, include: { userProfile: true } });
        if (patient) {
          await tx.notification.create({
            data: {
              recipientId: patient.userProfile.userId,
              title: 'Payment Failed',
              content: `Your payment try of ${payment.currency} ${payment.amount} for Invoice #${invoice.invoiceNumber} failed.`,
              channel: 'IN_APP',
              createdBy: actorId,
            },
          });
        }
      }

      await this.createAuditLog(actorId, 'PAYMENT_FAILED', 'Payment', id, { status: currentStatus }, { status: 'FAILED' }, ipAddress, userAgent, tx);
      return updatedPayment;
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
