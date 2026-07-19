import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionsService } from './prescriptions.service';
import { PrismaService } from '../database/prisma.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { BadRequestException } from '@nestjs/common';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;

  const mockPrismaService = {
    prescription: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    allergy: {
      findMany: jest.fn(),
    },
    doctor: {
      findUnique: jest.fn(),
    },
    userProfile: {
      findFirst: jest.fn().mockResolvedValue({ id: 'doc-profile-id', lastName: 'House' }),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockMedicalRecordsService = {
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MedicalRecordsService, useValue: mockMedicalRecordsService },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Allergy Conflict Checks', () => {
    it('should throw BadRequestException if patient is allergic to generic ingredient', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValueOnce({
        id: 'rx-id',
        patientId: 'patient-id',
        items: [
          {
            medicine: { genericName: 'Amoxicillin' },
          },
        ],
      });

      mockPrismaService.allergy.findMany.mockResolvedValueOnce([
        { allergen: 'Amoxicillin', status: 'ACTIVE' },
      ]);

      mockPrismaService.doctor.findUnique.mockResolvedValueOnce({ id: 'doc-id' });

      await expect(
        service.sign('rx-id', 'sig-key', 'doc-user-id')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
