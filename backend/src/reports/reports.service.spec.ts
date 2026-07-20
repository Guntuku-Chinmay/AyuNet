import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../database/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockPrismaService = {
    patient: { count: jest.fn().mockResolvedValue(120) },
    doctor: { count: jest.fn().mockResolvedValue(15) },
    appointment: { count: jest.fn().mockResolvedValue(450) },
    payment: { findMany: jest.fn().mockResolvedValue([{ amount: 1500 }, { amount: 2500 }]) },
    invoice: { count: jest.fn().mockResolvedValue(300) },
    pharmacyOrder: { count: jest.fn().mockResolvedValue(200) },
    labOrder: { count: jest.fn().mockResolvedValue(180) },
    labReport: { count: jest.fn().mockResolvedValue(175) },
    visit: { count: jest.fn().mockResolvedValue(400) },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('KPI Calculations', () => {
    it('should calculate system-wide KPIs', async () => {
      const res = await service.getKPIs();
      expect(res.kpis).toBeDefined();
      expect(res.kpis.appointmentCompletionRate).toBeDefined();
    });
  });
});
