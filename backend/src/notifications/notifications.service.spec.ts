import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    notificationPreference: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Template Compilation', () => {
    it('should correctly substitute template variables', () => {
      const compiled = service.compileTemplate('WELCOME_MESSAGE', { firstName: 'Alice' });
      expect(compiled).toBe('Hello Alice, welcome to AyuNet Health Portal!');
    });
  });
});
