import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundsService {
  private refundsList: Array<{ id: string; paymentId: string; amount: number; reason: string; approved: boolean; createdAt: Date }> = [];

  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService
  ) {}

  async create(dto: CreateRefundDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId } });
    if (!payment || payment.deletedAt) {
      throw new NotFoundException(`Payment with ID '${dto.paymentId}' not found.`);
    }

    if (dto.amount > Number(payment.amount)) {
      throw new BadRequestException('Refund amount exceeds the original payment limit.');
    }

    await this.paymentsService.refund(dto.paymentId, dto.amount, dto.reason, actorId, ipAddress, userAgent);

    const refundEntry = {
      id: `ref-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      paymentId: dto.paymentId,
      amount: dto.amount,
      reason: dto.reason,
      approved: true,
      createdAt: new Date(),
    };

    this.refundsList.push(refundEntry);

    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REFUND_REQUESTED',
          entityName: 'Refund',
          entityId: refundEntry.id,
          newValues: JSON.parse(JSON.stringify(refundEntry)),
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'system',
          createdBy: actorId,
        },
      });
    });

    return refundEntry;
  }

  async findOne(id: string) {
    const refund = this.refundsList.find(r => r.id === id);
    if (!refund) {
      throw new NotFoundException(`Refund with ID '${id}' not found.`);
    }
    return refund;
  }

  async findAll() {
    return this.refundsList;
  }
}
