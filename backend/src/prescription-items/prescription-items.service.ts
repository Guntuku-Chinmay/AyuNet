import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { AddPrescriptionItemDto } from './dto/add-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-item.dto';

@Injectable()
export class PrescriptionItemsService {
  constructor(
    private prisma: PrismaService,
    private prescriptionsService: PrescriptionsService
  ) {}

  async create(prescriptionId: string, dto: AddPrescriptionItemDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const rx = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!rx || rx.deletedAt) {
      throw new NotFoundException(`Prescription with ID '${prescriptionId}' not found.`);
    }

    const rxStatus = this.prescriptionsService.getStatus(prescriptionId);
    if (rxStatus !== 'DRAFT') {
      throw new BadRequestException('Medication items can only be added to DRAFT prescriptions.');
    }

    const medicine = await this.prisma.medicine.findUnique({ where: { id: dto.medicineId } });
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException(`Medicine with ID '${dto.medicineId}' not found in catalog.`);
    }

    // Check duplicate
    const existing = await this.prisma.prescriptionItem.findFirst({
      where: { prescriptionId, medicineId: dto.medicineId, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`Medicine '${medicine.brandName}' is already added to this prescription.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.prescriptionItem.create({
        data: {
          prescriptionId,
          medicineId: dto.medicineId,
          dosage: dto.dosage.trim(),
          frequency: dto.frequency.trim(),
          durationDays: dto.durationDays,
          quantity: dto.quantity,
          instructions: dto.instructions?.trim() || null,
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_ITEM_ADDED', 'PrescriptionItem', item.id, null, item, ipAddress, userAgent, tx);
      return item;
    });
  }

  async update(id: string, dto: UpdatePrescriptionItemDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const item = await this.prisma.prescriptionItem.findUnique({ where: { id } });
    if (!item || item.deletedAt) {
      throw new NotFoundException(`Prescription item with ID '${id}' not found.`);
    }

    const rxStatus = this.prescriptionsService.getStatus(item.prescriptionId);
    if (rxStatus !== 'DRAFT') {
      throw new BadRequestException('Prescription items can only be modified on DRAFT prescriptions.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.prescriptionItem.update({
        where: { id },
        data: {
          dosage: dto.dosage ? dto.dosage.trim() : undefined,
          frequency: dto.frequency ? dto.frequency.trim() : undefined,
          durationDays: dto.durationDays,
          quantity: dto.quantity,
          instructions: dto.instructions !== undefined ? (dto.instructions?.trim() || null) : undefined,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_ITEM_UPDATED', 'PrescriptionItem', id, item, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async remove(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const item = await this.prisma.prescriptionItem.findUnique({ where: { id } });
    if (!item || item.deletedAt) {
      throw new NotFoundException(`Prescription item with ID '${id}' not found.`);
    }

    const rxStatus = this.prescriptionsService.getStatus(item.prescriptionId);
    if (rxStatus !== 'DRAFT') {
      throw new BadRequestException('Prescription items can only be removed from DRAFT prescriptions.');
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.prescriptionItem.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'PRESCRIPTION_ITEM_REMOVED', 'PrescriptionItem', id, item, deleted, ipAddress, userAgent, tx);
      return deleted;
    });
  }

  private async createAuditLog(
    actorId: string | undefined,
    action: string,
    entityName: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'system',
    tx: any
  ) {
    await tx.auditLog.create({
      data: {
        actorId,
        action,
        entityName,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
        createdBy: actorId,
      },
    });
  }
}
