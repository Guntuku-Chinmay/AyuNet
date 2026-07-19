import { Test, TestingModule } from '@nestjs/testing';
import { LabReportsService } from './lab-reports.service';
import { PrismaService } from '../database/prisma.service';
import { LabOrdersService } from '../lab-orders/lab-orders.service';
import { BadRequestException } from '@nestjs/common';

describe('LabReportsService', () => {
  let service: LabReportsService;

  const mockPrismaService = {
    labOrder: {
      findUnique: jest.fn(),
    },
    attachment: {
      findUnique: jest.fn(),
    },
    labReport: {
      create: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockLabOrdersService = {
    getStatus: jest.fn(),
    setStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LabOrdersService, useValue: mockLabOrdersService },
      ],
    }).compile();

    service = module.get<LabReportsService>(LabReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Report Upload Constraints', () => {
    it('should throw BadRequestException if trying to upload report before sample collection', async () => {
      mockPrismaService.labOrder.findUnique.mockResolvedValueOnce({
        id: 'order-id',
        patientId: 'patient-id',
      });

      mockLabOrdersService.getStatus.mockReturnValueOnce('ORDERED');

      await expect(
        service.create({
          labOrderId: 'order-id',
          summaryFindings: 'Hemoglobin normal',
        }, 'tech-user-id')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
