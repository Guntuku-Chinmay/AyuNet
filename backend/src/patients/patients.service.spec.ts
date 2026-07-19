import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { ForbiddenException } from '@nestjs/common';

describe('PatientsService', () => {
  let service: PatientsService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
    patient: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockAddressesService = {
    findOrCreateAddress: jest.fn().mockResolvedValue('address-uuid'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AddressesService, useValue: mockAddressesService },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPatientAccess', () => {
    it('should throw ForbiddenException if patient accesses other patient record', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValueOnce({
        id: 'patient-uuid-1',
        userProfileId: 'profile-1',
      });

      const userContext = {
        id: 'user-uuid-1',
        roles: ['PATIENT'],
      };

      await expect(
        service.checkPatientAccess('patient-uuid-2', userContext)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass if patient accesses self patient record', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValueOnce({
        id: 'patient-uuid-1',
        userProfileId: 'profile-1',
      });

      const userContext = {
        id: 'user-uuid-1',
        roles: ['PATIENT'],
      };

      await expect(
        service.checkPatientAccess('patient-uuid-1', userContext)
      ).resolves.toBeUndefined();
    });

    it('should pass if admin accesses patient record', async () => {
      const userContext = {
        id: 'admin-uuid',
        roles: ['SUPER_ADMIN'],
      };

      await expect(
        service.checkPatientAccess('patient-uuid-1', userContext)
      ).resolves.toBeUndefined();
    });
  });
});
