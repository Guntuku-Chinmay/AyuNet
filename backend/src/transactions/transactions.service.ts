import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        payment: true,
        invoice: { include: { patient: { include: { userProfile: true } } } },
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID '${id}' not found.`);
    }
    return transaction;
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        invoice: { include: { patient: { include: { userProfile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
