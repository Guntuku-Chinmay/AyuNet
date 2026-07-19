import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsService } from './medical-records.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;

  const mockPrismaService = {
    doctor: {
      findUnique: jest.fn().mockResolvedValue({ id: 'doctor-id', userProfile: { userId: 'doc-user-id' } }),
    },
    userProfile: {
      findFirst: jest.fn(),
    },
    visit: {
      findUnique: jest.fn(),
    },
    medicalRecord: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('EMR State Transitions & Editing', () => {
    it('should throw BadRequestException if trying to update a finalized record', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValueOnce({
        id: 'record-id',
        doctorId: 'doctor-id',
        clinicalNotes: 'Initial notes',
      });

      mockPrismaService.visit.findUnique.mockResolvedValueOnce({ id: 'visit-id', doctorId: 'doctor-id', patientId: 'patient-id' });
      const record = await service.create({
        patientId: 'patient-id',
        doctorId: 'doctor-id',
        visitId: 'visit-id',
        symptoms: 'cough',
        clinicalNotes: 'soap notes',
      });

      await service.finalize(record.id, 'doc-user-id');

      await expect(
        service.update(record.id, { clinicalNotes: 'Updated notes' }, 'doc-user-id')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if doctor other than author tries to edit draft', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValueOnce({
        id: 'record-id',
        doctorId: 'doctor-id',
      });

      mockPrismaService.userProfile.findFirst.mockResolvedValueOnce({ id: 'other-profile-id' });
      mockPrismaService.doctor.findUnique.mockResolvedValueOnce({ id: 'other-doctor-id' });

      await expect(
        service.update('record-id', { clinicalNotes: 'Hacked notes' }, 'other-user-id')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
