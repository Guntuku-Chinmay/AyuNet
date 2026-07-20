import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import * as crypto from 'crypto';

export interface StorageAdapter {
  upload(key: string, buffer: Buffer): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<boolean>;
}

@Injectable()
export class FilesService {
  private allowedMimeTypes = new Set([
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain',
    'application/dicom', 'image/tiff', 'application/zip'
  ]);

  private hashes = new Map<string, string>();
  private versions = new Map<string, Array<{ version: number; storagePath: string; fileName: string; createdAt: Date }>>();
  private shares = new Map<string, Array<{ id: string; attachmentId: string; sharedWithUserId: string; expiresAt: Date }>>();

  private storageAdapter: StorageAdapter = {
    async upload(key: string, _buffer: Buffer) {
      return `storage/local/${key}`;
    },
    async download(key: string) {
      return Buffer.from(`Simulated file content for ${key}`);
    },
    async delete(_key: string) {
      return true;
    }
  };

  constructor(private prisma: PrismaService) {}

  validateMimeType(fileType: string) {
    if (!this.allowedMimeTypes.has(fileType.toLowerCase())) {
      throw new BadRequestException(`File type '${fileType}' is not supported. Supported types: JPG, PNG, WEBP, PDF, DOCX, XLSX, TXT, DICOM, TIFF, ZIP.`);
    }
  }

  async upload(dto: UploadFileDto, actorId: string, ipAddress?: string, userAgent?: string) {
    this.validateMimeType(dto.fileType);

    const hashPayload = `${dto.fileName}-${dto.fileSizeBytes}-${dto.fileType}`;
    const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    if (this.hashes.has(hash)) {
      const existingId = this.hashes.get(hash)!;
      const existing = await this.prisma.attachment.findUnique({ where: { id: existingId } });
      if (existing && !existing.deletedAt) {
        throw new ConflictException(`Duplicate file detected with matching checksum hash (${hash.substring(0, 8)}...).`);
      }
    }

    const storagePath = `uploads/${Date.now()}-${dto.fileName}`;
    await this.storageAdapter.upload(storagePath, Buffer.from(dto.fileName));

    return this.prisma.$transaction(async (tx) => {
      const attachment = await tx.attachment.create({
        data: {
          fileName: dto.fileName,
          fileType: dto.fileType,
          fileSizeBytes: BigInt(dto.fileSizeBytes),
          storagePath,
          isPublic: dto.isPublic || false,
          createdBy: actorId,
        },
      });

      this.hashes.set(hash, attachment.id);

      const initialVersion = {
        version: 1,
        storagePath,
        fileName: dto.fileName,
        createdAt: new Date(),
      };
      this.versions.set(attachment.id, [initialVersion]);

      if (dto.entityType === 'MedicalRecord' && dto.entityId) {
        await tx.medicalRecordAttachment.create({
          data: {
            medicalRecordId: dto.entityId,
            attachmentId: attachment.id,
            createdBy: actorId,
          },
        });
      } else if (dto.entityType === 'LabReport' && dto.entityId) {
        await tx.labReportAttachment.create({
          data: {
            labReportId: dto.entityId,
            attachmentId: attachment.id,
            createdBy: actorId,
          },
        });
      }

      await this.createAuditLog(actorId, 'FILE_UPLOADED', 'Attachment', attachment.id, null, attachment, ipAddress, userAgent, tx);
      return {
        ...attachment,
        fileSizeBytes: Number(attachment.fileSizeBytes),
        hash,
        tags: dto.tags || [],
      };
    });
  }

  async uploadMultiple(dtos: UploadFileDto[], actorId: string, ipAddress?: string, userAgent?: string) {
    const results = [];
    for (const dto of dtos) {
      const res = await this.upload(dto, actorId, ipAddress, userAgent);
      results.push(res);
    }
    return results;
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment || attachment.deletedAt) {
      throw new NotFoundException(`File with ID '${id}' not found.`);
    }
    return {
      ...attachment,
      fileSizeBytes: Number(attachment.fileSizeBytes),
    };
  }

  async findAll() {
    const list = await this.prisma.attachment.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(item => ({
      ...item,
      fileSizeBytes: Number(item.fileSizeBytes),
    }));
  }

  async download(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.findOne(id);
    const contentBuffer = await this.storageAdapter.download(file.storagePath);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'FILE_DOWNLOADED', 'Attachment', id, null, { fileName: file.fileName }, ipAddress, userAgent, tx);
    });

    return {
      fileName: file.fileName,
      fileType: file.fileType,
      contentBuffer,
    };
  }

  async preview(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'FILE_VIEWED', 'Attachment', id, null, { fileName: file.fileName }, ipAddress, userAgent, tx);
    });

    return {
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      previewUrl: `https://cdn.ayunet.org/preview/${file.storagePath}`,
    };
  }

  async update(id: string, dto: UpdateFileDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.attachment.update({
        where: { id },
        data: {
          fileName: dto.fileName || file.fileName,
          isPublic: dto.isPublic !== undefined ? dto.isPublic : file.isPublic,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'FILE_UPDATED', 'Attachment', id, file, updated, ipAddress, userAgent, tx);
      return {
        ...updated,
        fileSizeBytes: Number(updated.fileSizeBytes),
        tags: dto.tags || [],
      };
    });
  }

  async softDelete(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.attachment.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'FILE_DELETED', 'Attachment', id, file, updated, ipAddress, userAgent, tx);
      return { message: 'File soft deleted successfully.' };
    });
  }

  async restore(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.prisma.attachment.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.attachment.update({
        where: { id },
        data: {
          deletedAt: null,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'FILE_RESTORED', 'Attachment', id, file, updated, ipAddress, userAgent, tx);
      return {
        ...updated,
        fileSizeBytes: Number(updated.fileSizeBytes),
      };
    });
  }

  async share(id: string, dto: ShareFileDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.findOne(id);

    const expiresAt = new Date(Date.now() + (dto.expiresInMinutes || 60) * 60 * 1000);
    const shareEntry = {
      id: `share-${Date.now()}`,
      attachmentId: id,
      sharedWithUserId: dto.sharedWithUserId,
      expiresAt,
    };

    const existingShares = this.shares.get(id) || [];
    existingShares.push(shareEntry);
    this.shares.set(id, existingShares);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'FILE_SHARED', 'Attachment', id, null, { fileName: file.fileName, ...shareEntry }, ipAddress, userAgent, tx);
    });

    return {
      shareUrl: `https://share.ayunet.org/file/${shareEntry.id}`,
      expiresAt,
    };
  }

  async getVersions(id: string) {
    await this.findOne(id);
    return this.versions.get(id) || [];
  }

  async restoreVersion(id: string, versionNumber: number, actorId: string, ipAddress?: string, userAgent?: string) {
    const file = await this.findOne(id);
    const versionList = this.versions.get(id) || [];
    const targetVersion = versionList.find(v => v.version === versionNumber);

    if (!targetVersion) {
      throw new NotFoundException(`Version ${versionNumber} for file ID '${id}' not found.`);
    }

    const newVersionNumber = versionList.length + 1;
    const restoredVersion = {
      version: newVersionNumber,
      storagePath: targetVersion.storagePath,
      fileName: targetVersion.fileName,
      createdAt: new Date(),
    };
    versionList.push(restoredVersion);
    this.versions.set(id, versionList);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.attachment.update({
        where: { id },
        data: {
          fileName: targetVersion.fileName,
          storagePath: targetVersion.storagePath,
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'FILE_VERSION_CREATED', 'Attachment', id, file, updated, ipAddress, userAgent, tx);
      return {
        ...updated,
        fileSizeBytes: Number(updated.fileSizeBytes),
        restoredFromVersion: versionNumber,
      };
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
