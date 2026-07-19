import { Test, TestingModule } from '@nestjs/testing';
import { HospitalsService } from './hospitals.service';
import { PrismaService } from '../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('HospitalsService', () => {
  let service: HospitalsService;

  const mockPrismaService = {
    hospital: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    hospitalBranch: {
      count: jest.fn(),
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
        HospitalsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AddressesService, useValue: mockAddressesService },
      ],
    }).compile();

    service = module.get<HospitalsService>(HospitalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if hospital name exists', async () => {
      mockPrismaService.hospital.findFirst.mockResolvedValueOnce({ id: '1', name: 'Apollo' });

      await expect(
        service.create({ name: 'Apollo', licenseNumber: 'L1', address: {} as any })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if hospital has active branches', async () => {
      mockPrismaService.hospital.findUnique.mockResolvedValueOnce({ id: '1', name: 'Apollo' });
      mockPrismaService.hospitalBranch.count.mockResolvedValueOnce(1); // active branch exists

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});
