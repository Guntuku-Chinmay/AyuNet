import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { BlockSlotDto } from './dto/block-slot.dto';

@Injectable()
export class TimeSlotsService {
  constructor(private prisma: PrismaService) {}

  async generateSlots(dto: GenerateSlotsDto, creatorId?: string) {
    const duration = dto.slotDurationMinutes || 20;

    // Check doctor active status
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { userProfile: { include: { user: true } } },
    });
    if (!doctor || doctor.deletedAt) {
      throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found.`);
    }

    const startDateTime = new Date(`${dto.date}T${dto.startTime}:00`);
    const endDateTime = new Date(`${dto.date}T${dto.endTime}:00`);

    if (startDateTime.getTime() >= endDateTime.getTime()) {
      throw new BadRequestException('Start time must be before end time.');
    }

    const createdSlots: any[] = [];
    let currentStart = new Date(startDateTime);

    await this.prisma.$transaction(async (tx) => {
      while (currentStart.getTime() < endDateTime.getTime()) {
        const currentEnd = new Date(currentStart.getTime() + duration * 60000);
        if (currentEnd.getTime() > endDateTime.getTime()) {
          break;
        }

        // Check overlap
        const overlap = await tx.timeSlot.findFirst({
          where: {
            doctorId: dto.doctorId,
            branchId: dto.branchId,
            deletedAt: null,
            OR: [
              { startAt: { lte: currentStart }, endAt: { gt: currentStart } },
              { startAt: { lt: currentEnd }, endAt: { gte: currentEnd } },
            ],
          },
        });

        if (overlap) {
          throw new ConflictException(`Slot overlap detected at ${currentStart.toISOString()} - ${currentEnd.toISOString()}.`);
        }

        const slot = await tx.timeSlot.create({
          data: {
            doctorId: dto.doctorId,
            branchId: dto.branchId,
            startAt: currentStart,
            endAt: currentEnd,
            isReserved: false,
            createdBy: creatorId,
          },
        });

        createdSlots.push(slot);
        currentStart = new Date(currentEnd);
      }
    });

    return createdSlots;
  }

  async blockSlot(dto: BlockSlotDto, creatorId?: string) {
    const start = new Date(dto.startAt);
    const end = new Date(dto.endAt);

    return this.prisma.$transaction(async (tx) => {
      // Find if slot exists
      const existing = await tx.timeSlot.findFirst({
        where: {
          doctorId: dto.doctorId,
          branchId: dto.branchId,
          startAt: start,
          endAt: end,
          deletedAt: null,
        },
      });

      if (existing) {
        if (existing.isReserved) {
          throw new ConflictException('Slot is already reserved or blocked.');
        }
        return tx.timeSlot.update({
          where: { id: existing.id },
          data: { isReserved: true, updatedBy: creatorId },
        });
      }

      // Create a blocked slot
      return tx.timeSlot.create({
        data: {
          doctorId: dto.doctorId,
          branchId: dto.branchId,
          startAt: start,
          endAt: end,
          isReserved: true,
          createdBy: creatorId,
        },
      });
    });
  }

  async unblockSlot(id: string, updaterId?: string) {
    const slot = await this.prisma.timeSlot.findUnique({
      where: { id },
    });
    if (!slot || slot.deletedAt) {
      throw new NotFoundException(`Slot with ID '${id}' not found.`);
    }

    // Check if slot has an active appointment
    const appointment = await this.prisma.appointment.findFirst({
      where: { timeSlotId: id, status: { in: ['PENDING', 'CONFIRMED'] }, deletedAt: null },
    });
    if (appointment) {
      throw new BadRequestException('Cannot unblock slot because it has an active appointment booked.');
    }

    return this.prisma.timeSlot.update({
      where: { id },
      data: { isReserved: false, updatedBy: updaterId },
    });
  }

  async fetchAvailableSlots(doctorId?: string, branchId?: string, departmentId?: string) {
    const where: any = { isReserved: false, deletedAt: null };
    if (doctorId) where.doctorId = doctorId;
    if (branchId) where.branchId = branchId;
    if (departmentId) {
      where.doctor = {
        doctorBranches: {
          some: {
            branch: {
              departments: {
                some: { id: departmentId },
              },
            },
          },
        },
      };
    }

    return this.prisma.timeSlot.findMany({
      where,
      include: { doctor: { include: { userProfile: true } }, branch: true },
      orderBy: { startAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const slot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: { doctor: { include: { userProfile: true } }, branch: true },
    });
    if (!slot || slot.deletedAt) {
      throw new NotFoundException(`TimeSlot with ID '${id}' not found.`);
    }
    return slot;
  }
}
