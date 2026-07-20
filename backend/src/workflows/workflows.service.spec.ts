import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../database/prisma.service';

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  const mockPrismaService = {
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Exponential Backoff Calculation', () => {
    it('should calculate correct exponential retry backoff intervals', () => {
      expect(service.calculateExponentialBackoff(0, 1000)).toBe(1000);
      expect(service.calculateExponentialBackoff(1, 1000)).toBe(2000);
      expect(service.calculateExponentialBackoff(2, 1000)).toBe(4000);
      expect(service.calculateExponentialBackoff(3, 1000)).toBe(8000);
    });
  });
});
