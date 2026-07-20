import { Test, TestingModule } from '@nestjs/testing';
import { SaasService } from './saas.service';
import { PrismaService } from '../database/prisma.service';

describe('SaasService', () => {
  let service: SaasService;

  const mockPrismaService = {
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SaasService>(SaasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Tenant Provisioning & Subscriptions', () => {
    it('should provision tenant and assign enterprise plan seat limits', async () => {
      const dto = {
        name: 'Apollo Hospital Group',
        domain: 'apollo',
        plan: 'ENTERPRISE',
        adminEmail: 'admin@apollo.org',
      };

      const tenant = await service.createTenant(dto, 'user-admin-123');
      expect(tenant).toBeDefined();
      expect(tenant.domain).toBe('apollo');

      const subs = await service.getSubscriptions(tenant.id);
      expect(subs.subscription).toBeDefined();
      expect(subs.subscription?.seatsLimit).toBe(1000);
    });
  });
});
