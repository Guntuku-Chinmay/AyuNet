import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';

interface PatientDocs {
  nationalId?: string;
  passport?: string;
  insuranceNumber?: string;
  mrn: string;
}

@Injectable()
export class PatientsService {
  private patientDocsStore = new Map<string, PatientDocs>();
  private nationalIdIndex = new Map<string, string>();
  private passportIndex = new Map<string, string>();
  private insuranceIndex = new Map<string, string>();
  private mrnIndex = new Map<string, string>();

  constructor(
    private prisma: PrismaService,
    private addressesService: AddressesService
  ) {}

  async register(dto: RegisterPatientDto, creatorId?: string, ipAddress?: string, userAgent?: string) {
    // Check if email already registered in AyuNet
    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: dto.email.trim(), mode: 'insensitive' }, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException(`User with email '${dto.email}' already exists.`);
    }

    // Validate duplicate documents in index
    if (dto.nationalId && this.nationalIdIndex.has(dto.nationalId.trim())) {
      throw new ConflictException(`Patient with National ID '${dto.nationalId}' already exists.`);
    }
    if (dto.passport && this.passportIndex.has(dto.passport.trim())) {
      throw new ConflictException(`Patient with Passport '${dto.passport}' already exists.`);
    }
    if (dto.insuranceNumber && this.insuranceIndex.has(dto.insuranceNumber.trim())) {
      throw new ConflictException(`Patient with Insurance Number '${dto.insuranceNumber}' already exists.`);
    }

    // Generate MRN
    const mrn = 'MRN-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      // Find or create Address
      const addressId = await this.addressesService.findOrCreateAddress(dto.address, creatorId);

      // Create User
      const user = await tx.user.create({
        data: {
          email: dto.email.trim(),
          passwordHash,
          phoneNumber: dto.phoneNumber?.trim() || null,
          createdBy: creatorId,
        },
      });

      // Create UserProfile
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phoneNumber?.trim() || null,
          createdBy: creatorId,
        },
      });

      // Create Patient
      const patient = await tx.patient.create({
        data: {
          userProfileId: profile.id,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          bloodGroup: dto.bloodGroup?.trim() || null,
          addressId,
          emergencyContactName: dto.emergencyContactName.trim(),
          emergencyContactPhone: dto.emergencyContactPhone.trim(),
          emergencyContactRelationship: dto.emergencyContactRelationship.trim(),
          createdBy: creatorId,
        },
        include: { userProfile: { include: { user: true } }, address: true },
      });

      // Index attributes
      const docData: PatientDocs = {
        nationalId: dto.nationalId?.trim() || undefined,
        passport: dto.passport?.trim() || undefined,
        insuranceNumber: dto.insuranceNumber?.trim() || undefined,
        mrn,
      };
      this.patientDocsStore.set(patient.id, docData);
      this.mrnIndex.set(mrn, patient.id);
      if (dto.nationalId) this.nationalIdIndex.set(dto.nationalId.trim(), patient.id);
      if (dto.passport) this.passportIndex.set(dto.passport.trim(), patient.id);
      if (dto.insuranceNumber) this.insuranceIndex.set(dto.insuranceNumber.trim(), patient.id);

      const result = {
        ...patient,
        ...docData,
      };

      await this.createAuditLog(creatorId || user.id, 'PATIENT_REGISTERED', 'Patient', patient.id, null, result, ipAddress, userAgent, tx);

      return result;
    });
  }

  async update(id: string, dto: UpdatePatientDto, user: any, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { userProfile: { include: { user: true } }, address: true },
    });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${id}' not found.`);
    }

    // Security check
    await this.checkPatientAccess(id, user);

    // Validate duplicates
    if (dto.nationalId && dto.nationalId.trim()) {
      const existing = this.nationalIdIndex.get(dto.nationalId.trim());
      if (existing && existing !== id) {
        throw new ConflictException(`Patient with National ID '${dto.nationalId}' already exists.`);
      }
    }
    if (dto.passport && dto.passport.trim()) {
      const existing = this.passportIndex.get(dto.passport.trim());
      if (existing && existing !== id) {
        throw new ConflictException(`Patient with Passport '${dto.passport}' already exists.`);
      }
    }
    if (dto.insuranceNumber && dto.insuranceNumber.trim()) {
      const existing = this.insuranceIndex.get(dto.insuranceNumber.trim());
      if (existing && existing !== id) {
        throw new ConflictException(`Patient with Insurance Number '${dto.insuranceNumber}' already exists.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let addressId = patient.addressId;
      if (dto.address) {
        addressId = await this.addressesService.findOrCreateAddress(dto.address, user.id);
      }

      // Update User
      if (dto.phone) {
        await tx.user.update({
          where: { id: patient.userProfile.userId },
          data: { phoneNumber: dto.phone.trim() },
        });
      }

      // Update UserProfile
      await tx.userProfile.update({
        where: { id: patient.userProfileId },
        data: {
          firstName: dto.firstName ? dto.firstName.trim() : undefined,
          lastName: dto.lastName ? dto.lastName.trim() : undefined,
          phone: dto.phone ? dto.phone.trim() : undefined,
          preferredLanguage: dto.preferredLanguage,
          timezone: dto.timezone,
        },
      });

      // Update Patient
      const updated = await tx.patient.update({
        where: { id },
        data: {
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup ? dto.bloodGroup.trim() : undefined,
          addressId,
          emergencyContactName: dto.emergencyContactName ? dto.emergencyContactName.trim() : undefined,
          emergencyContactPhone: dto.emergencyContactPhone ? dto.emergencyContactPhone.trim() : undefined,
          emergencyContactRelationship: dto.emergencyContactRelationship ? dto.emergencyContactRelationship.trim() : undefined,
          updatedBy: user.id,
        },
        include: { userProfile: { include: { user: true } }, address: true },
      });

      // Update document index cache
      const oldDocs = this.patientDocsStore.get(id);
      const newDocs: PatientDocs = {
        mrn: oldDocs?.mrn || 'MRN-TEMP',
        nationalId: dto.nationalId !== undefined ? (dto.nationalId.trim() || undefined) : oldDocs?.nationalId,
        passport: dto.passport !== undefined ? (dto.passport.trim() || undefined) : oldDocs?.passport,
        insuranceNumber: dto.insuranceNumber !== undefined ? (dto.insuranceNumber.trim() || undefined) : oldDocs?.insuranceNumber,
      };

      // Clean old index entries
      if (oldDocs?.nationalId) this.nationalIdIndex.delete(oldDocs.nationalId);
      if (oldDocs?.passport) this.passportIndex.delete(oldDocs.passport);
      if (oldDocs?.insuranceNumber) this.insuranceIndex.delete(oldDocs.insuranceNumber);

      // Save new index entries
      this.patientDocsStore.set(id, newDocs);
      if (newDocs.nationalId) this.nationalIdIndex.set(newDocs.nationalId, id);
      if (newDocs.passport) this.passportIndex.set(newDocs.passport, id);
      if (newDocs.insuranceNumber) this.insuranceIndex.set(newDocs.insuranceNumber, id);

      const result = {
        ...updated,
        ...newDocs,
      };

      await this.createAuditLog(user.id, 'PATIENT_UPDATED', 'Patient', id, patient, result, ipAddress, userAgent, tx);

      return result;
    });
  }

  async remove(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${id}' not found.`);
    }

    // Security check
    await this.checkPatientAccess(id, user);

    const deleted = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.patient.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      // Remove from index caches
      const docs = this.patientDocsStore.get(id);
      if (docs) {
        if (docs.nationalId) this.nationalIdIndex.delete(docs.nationalId);
        if (docs.passport) this.passportIndex.delete(docs.passport);
        if (docs.insuranceNumber) this.insuranceIndex.delete(docs.insuranceNumber);
        this.mrnIndex.delete(docs.mrn);
        this.patientDocsStore.delete(id);
      }

      await this.createAuditLog(user.id, 'PATIENT_DELETED', 'Patient', id, patient, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return deleted;
  }

  async restore(id: string, user: any, ipAddress?: string, userAgent?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID '${id}' not found.`);
    }
    if (!patient.deletedAt) {
      throw new BadRequestException('Patient is not deleted.');
    }

    const restored = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.patient.update({
        where: { id },
        data: {
          deletedAt: null,
          updatedBy: user.id,
        },
      });

      // Regenerate MRN
      const mrn = 'MRN-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
      const docs: PatientDocs = { mrn };
      this.patientDocsStore.set(id, docs);
      this.mrnIndex.set(mrn, id);

      await this.createAuditLog(user.id, 'PATIENT_RESTORED', 'Patient', id, patient, updated, ipAddress, userAgent, tx);
      return updated;
    });

    return restored;
  }

  async findOne(id: string, user: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { userProfile: { include: { user: true } }, address: true },
    });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${id}' not found.`);
    }

    await this.checkPatientAccess(id, user);

    const docs = this.patientDocsStore.get(id) || { mrn: 'UNKNOWN' };
    return {
      ...patient,
      ...docs,
    };
  }

  async findAll(query: PatientQueryDto, user: any) {
    // If patient is checking, they are restricted
    if (user.roles?.includes('PATIENT')) {
      const p = await this.prisma.patient.findFirst({
        where: { userProfile: { userId: user.id }, deletedAt: null },
        include: { userProfile: { include: { user: true } }, address: true },
      });
      if (!p) return { data: [], total: 0 };
      const docs = this.patientDocsStore.get(p.id) || { mrn: 'UNKNOWN' };
      return {
        data: [{ ...p, ...docs }],
        total: 1,
      };
    }

    // Build filters
    const where: any = { deletedAt: null };

    // Search by document indexes first
    let filterIds: string[] | undefined = undefined;

    if (query.mrn) {
      const pid = this.mrnIndex.get(query.mrn.trim());
      filterIds = pid ? [pid] : [];
    } else if (query.nationalId) {
      const pid = this.nationalIdIndex.get(query.nationalId.trim());
      filterIds = pid ? [pid] : [];
    } else if (query.passport) {
      const pid = this.passportIndex.get(query.passport.trim());
      filterIds = pid ? [pid] : [];
    } else if (query.insuranceNumber) {
      const pid = this.insuranceIndex.get(query.insuranceNumber.trim());
      filterIds = pid ? [pid] : [];
    }

    if (filterIds !== undefined) {
      where.id = { in: filterIds };
    }

    // Search by name/email/phone
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { userProfile: { firstName: { contains: term, mode: 'insensitive' } } },
        { userProfile: { lastName: { contains: term, mode: 'insensitive' } } },
        { userProfile: { phone: { contains: term } } },
        { userProfile: { user: { email: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        include: { userProfile: { include: { user: true } }, address: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    const data = list.map((p) => {
      const docs = this.patientDocsStore.get(p.id) || { mrn: 'UNKNOWN' };
      return {
        ...p,
        ...docs,
      };
    });

    return { data, total, page, limit };
  }

  async mergePatients(sourceId: string, targetId: string, user: any, ipAddress?: string, userAgent?: string) {
    if (user.roles?.includes('PATIENT') || user.roles?.includes('CAREGIVER') || user.roles?.includes('BRANCH_ADMIN')) {
      throw new ForbiddenException('Only administrators can merge patient records.');
    }

    const source = await this.prisma.patient.findUnique({ where: { id: sourceId } });
    const target = await this.prisma.patient.findUnique({ where: { id: targetId } });
    if (!source || source.deletedAt || !target || target.deletedAt) {
      throw new NotFoundException('Source or target patient not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Move appointments
      await tx.appointment.updateMany({
        where: { patientId: sourceId },
        data: { patientId: targetId },
      });

      // 2. Move visits
      await tx.visit.updateMany({
        where: { patientId: sourceId },
        data: { patientId: targetId },
      });

      // 3. Move prescriptions
      await tx.prescription.updateMany({
        where: { patientId: sourceId },
        data: { patientId: targetId },
      });

      // 4. Move lab orders
      await tx.labOrder.updateMany({
        where: { patientId: sourceId },
        data: { patientId: targetId },
      });

      // 5. Move billing invoices
      await tx.invoice.updateMany({
        where: { patientId: sourceId },
        data: { patientId: targetId },
      });

      // 6. Move caregiver links (delete duplicates first)
      const sourceLinks = await tx.patientCaregiver.findMany({ where: { patientId: sourceId } });
      for (const link of sourceLinks) {
        const exists = await tx.patientCaregiver.findUnique({
          where: { patientId_caregiverId: { patientId: targetId, caregiverId: link.caregiverId } },
        });
        if (!exists) {
          await tx.patientCaregiver.create({
            data: {
              patientId: targetId,
              caregiverId: link.caregiverId,
              relationshipType: link.relationshipType,
              accessLevel: link.accessLevel,
              createdBy: user.id,
            },
          });
        }
      }
      await tx.patientCaregiver.deleteMany({ where: { patientId: sourceId } });

      // 7. Soft delete source patient
      await tx.patient.update({
        where: { id: sourceId },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      // Remove source documents index
      const docs = this.patientDocsStore.get(sourceId);
      if (docs) {
        if (docs.nationalId) this.nationalIdIndex.delete(docs.nationalId);
        if (docs.passport) this.passportIndex.delete(docs.passport);
        if (docs.insuranceNumber) this.insuranceIndex.delete(docs.insuranceNumber);
        this.mrnIndex.delete(docs.mrn);
        this.patientDocsStore.delete(sourceId);
      }

      await this.createAuditLog(
        user.id,
        'PATIENT_MERGED',
        'Patient',
        targetId,
        { sourceId, targetId },
        { merged: true },
        ipAddress,
        userAgent,
        tx
      );

      return { success: true };
    });
  }

  async checkPatientAccess(patientId: string, user: any) {
    if (user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN') || user.roles?.includes('HOSPITAL_ADMIN') || user.roles?.includes('BRANCH_ADMIN')) {
      return; // Admins allowed
    }

    if (user.roles?.includes('PATIENT')) {
      // Find patient record for current user
      const patient = await this.prisma.patient.findFirst({
        where: { userProfile: { userId: user.id }, deletedAt: null },
      });
      if (patient && patient.id === patientId) {
        return; // Authorized: accessing self
      }
    }

    if (user.roles?.includes('CAREGIVER')) {
      // Find caregiver record
      const caregiver = await this.prisma.caregiver.findFirst({
        where: { userProfile: { userId: user.id }, deletedAt: null },
      });
      if (caregiver) {
        const link = await this.prisma.patientCaregiver.findUnique({
          where: { patientId_caregiverId: { patientId, caregiverId: caregiver.id } },
        });
        if (link) {
          return; // Authorized caregiver
        }
      }
    }

    throw new ForbiddenException('You do not have permission to access this patient record.');
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
