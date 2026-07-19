import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  const mockPrismaService = {
    patient: {
      findUnique: jest.fn().mockResolvedValue({ id: 'patient-id', userProfile: { userId: 'patient-user-id' } }),
    },
    doctor: {
      findUnique: jest.fn().mockResolvedValue({ id: 'doctor-id', userProfile: { userId: 'doctor-user-id' } }),
    },
    hospitalBranch: {
      findUnique: jest.fn().mockResolvedValue({ id: 'branch-id' }),
    },
    timeSlot: {
      findUnique: jest.fn().mockResolvedValue({ id: 'slot-id', doctorId: 'doctor-id', branchId: 'branch-id', isReserved: false }),
      update: jest.fn(),
    },
    appointment: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockNotificationsService = {
    triggerNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookAppointment', () => {
    it('should throw BadRequestException if scheduled start time is in the past', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      await expect(
        service.bookAppointment({
          patientId: 'patient-id',
          doctorId: 'doctor-id',
          branchId: 'branch-id',
          timeSlotId: 'slot-id',
          scheduledStartAt: pastDate.toISOString(),
          scheduledEndAt: new Date().toISOString(),
          type: 'OUTPATIENT',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if doctor has overlapping appointment', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockPrismaService.appointment.findFirst.mockResolvedValueOnce({ id: 'overlap-app-id' }); // Doctor overlap

      await expect(
        service.bookAppointment({
          patientId: 'patient-id',
          doctorId: 'doctor-id',
          branchId: 'branch-id',
          timeSlotId: 'slot-id',
          scheduledStartAt: futureDate.toISOString(),
          scheduledEndAt: new Date(futureDate.getTime() + 20 * 60000).toISOString(),
          type: 'OUTPATIENT',
        })
      ).rejects.toThrow(ConflictException);
    });
  });
});
