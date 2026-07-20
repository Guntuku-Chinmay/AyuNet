import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../database/prisma.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrismaService = {
    patient: { findMany: jest.fn().mockResolvedValue([]) },
    doctor: { findMany: jest.fn().mockResolvedValue([]) },
    hospital: { findMany: jest.fn().mockResolvedValue([]) },
    invoice: { findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Autocomplete Suggestions', () => {
    it('should generate type-ahead suggestions for prefix terms', async () => {
      const suggestions = await service.getSuggestions('Cardio');
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('Cardio');
    });

    it('should return empty suggestions array if query is too short', async () => {
      const suggestions = await service.getSuggestions('a');
      expect(suggestions).toEqual([]);
    });
  });
});
