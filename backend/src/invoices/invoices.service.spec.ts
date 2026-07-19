import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('InvoicesService', () => {
  let service: InvoicesService;

  const mockPrismaService = {
    patient: {
      findUnique: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Invoice Cancel / Void Rules', () => {
    it('should throw BadRequestException if trying to cancel/void a paid invoice', async () => {
      mockPrismaService.invoice.findUnique.mockResolvedValueOnce({
        id: 'invoice-id',
        patientId: 'patient-id',
        status: 'PAID',
      });

      service.setStatus('invoice-id', 'PAID');

      await expect(
        service.cancel('invoice-id', 'user-id')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
