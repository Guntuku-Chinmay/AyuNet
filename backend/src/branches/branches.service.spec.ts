import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { PrismaService } from '../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { BadRequestException } from '@nestjs/common';

describe('BranchesService', () => {
  let service: BranchesService;

  const mockPrismaService = {
    hospitalBranch: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    department: {
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
        BranchesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AddressesService, useValue: mockAddressesService },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('should throw BadRequestException if branch has active departments', async () => {
      mockPrismaService.hospitalBranch.findUnique.mockResolvedValueOnce({ id: 'b1', name: 'Branch 1', hospitalId: 'h1' });
      mockPrismaService.department.count.mockResolvedValueOnce(1); // active department exists

      await expect(service.remove('b1', { roles: ['SUPER_ADMIN'] })).rejects.toThrow(BadRequestException);
    });
  });
});
