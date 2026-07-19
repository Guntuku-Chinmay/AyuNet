import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyOrdersService } from './pharmacy-orders.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PharmacyOrdersService', () => {
  let service: PharmacyOrdersService;

  const mockPrismaService = {
    patient: {
      findUnique: jest.fn(),
    },
    pharmacy: {
      findUnique: jest.fn(),
    },
    prescription: {
      findUnique: jest.fn(),
    },
    medicine: {
      findUnique: jest.fn(),
    },
    pharmacyOrder: {
      create: jest.fn(),
    },
    pharmacyOrderItem: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PharmacyOrdersService>(PharmacyOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Order Creation Constraints', () => {
    it('should throw BadRequestException if prescription is expired', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValueOnce({ id: 'patient-id' });
      mockPrismaService.pharmacy.findUnique.mockResolvedValueOnce({ id: 'pharmacy-id', isActive: true });
      mockPrismaService.prescription.findUnique.mockResolvedValueOnce({
        id: 'presc-id',
        status: 'SIGNED',
        validUntil: new Date(Date.now() - 10000), // Expired 10 seconds ago
        patientId: 'patient-id',
      });

      await expect(
        service.create({
          prescriptionId: 'presc-id',
          patientId: 'patient-id',
          pharmacyId: 'pharmacy-id',
          deliveryAddressLine1: '123 Main St',
          deliveryCity: 'Hyderabad',
          deliveryState: 'TG',
          deliveryPostalCode: '500001',
          deliveryCountry: 'India',
          items: [],
        }, 'user-id')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
