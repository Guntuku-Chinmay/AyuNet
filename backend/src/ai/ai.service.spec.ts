import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../database/prisma.service';

describe('AiService', () => {
  let service: AiService;

  const mockPrismaService = {
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('PII Redaction Pipeline', () => {
    it('should redact email addresses and phone numbers', () => {
      const rawText = 'Contact patient John at john.doe@example.com or call +12345678901.';
      const redacted = service.redactPii(rawText);

      expect(redacted).not.toContain('john.doe@example.com');
      expect(redacted).not.toContain('+12345678901');
      expect(redacted).toContain('[REDACTED_EMAIL]');
      expect(redacted).toContain('[REDACTED_PHONE]');
    });
  });

  describe('Clinical Disclaimer Append', () => {
    it('should append clinical decision disclaimer notice to AI output', () => {
      const text = 'Take 1 tablet after meals.';
      const out = service.appendDisclaimer(text);

      expect(out).toContain('[NOTICE: AI-generated assistance.');
      expect(out).toContain('licensed healthcare professionals');
    });
  });
});
