import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { PrismaService } from '../database/prisma.service';

describe('QueueService', () => {
  let service: QueueService;

  const mockPrismaService = {
    visit: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Queue Sorting Weights', () => {
    it('should sort Emergency patients first and Skipped patients last', async () => {
      const now = new Date();
      const checkIn1 = new Date(now.getTime() - 10000);
      const checkIn2 = new Date(now.getTime() - 5000);
      const checkIn3 = new Date(now.getTime() - 2000);

      mockPrismaService.visit.findMany.mockResolvedValueOnce([
        {
          id: 'visit-regular',
          checkInAt: checkIn1,
          branch: { name: 'Branch A' },
          patient: { userProfile: { firstName: 'Alice', lastName: 'Regular' } },
          doctor: { userProfile: { firstName: 'John', lastName: 'Doe' } },
        },
        {
          id: 'visit-emergency',
          checkInAt: checkIn2,
          branch: { name: 'Branch A' },
          patient: { userProfile: { firstName: 'Bob', lastName: 'Emergency' } },
          doctor: { userProfile: { firstName: 'John', lastName: 'Doe' } },
        },
        {
          id: 'visit-skipped',
          checkInAt: checkIn3,
          branch: { name: 'Branch A' },
          patient: { userProfile: { firstName: 'Charlie', lastName: 'Skipped' } },
          doctor: { userProfile: { firstName: 'John', lastName: 'Doe' } },
        },
      ]);

      await service.setPriority('visit-emergency', 'EMERGENCY');
      await service.skipPatient('visit-skipped');

      const queue = await service.getDailyQueue();

      expect(queue[0].visitId).toBe('visit-emergency'); // Emergency at top
      expect(queue[1].visitId).toBe('visit-regular');   // Regular in middle
      expect(queue[2].visitId).toBe('visit-skipped');   // Skipped at end
    });
  });
});
