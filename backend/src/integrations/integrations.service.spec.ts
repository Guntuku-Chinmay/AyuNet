import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../database/prisma.service';

describe('IntegrationsService', () => {
  let service: IntegrationsService;

  const mockPrismaService = {
    patient: { findUnique: jest.fn() },
    labReport: { findUnique: jest.fn() },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('HMAC SHA-256 Signature', () => {
    it('should generate valid HMAC signature', () => {
      const payload = JSON.stringify({ event: 'AppointmentCreated', id: '123' });
      const secret = 'super_secret_webhook_key';
      const sig = service.generateHmacSignature(payload, secret);

      expect(sig).toBeDefined();
      expect(sig.length).toBe(64);
    });
  });
});
