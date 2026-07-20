import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationsService {
  private apiKeys = new Map<string, { id: string; name: string; keyPrefix: string; secretHash: string; scopes: string[]; expiresAt: Date; createdAt: Date }>();
  private webhooks = new Map<string, { id: string; targetUrl: string; events: string[]; secret: string; isActive: boolean; createdAt: Date }>();
  private webhookDeliveries: Array<{ id: string; webhookId: string; event: string; payload: any; signature: string; statusCode: number; success: boolean; deliveredAt: Date }> = [];

  constructor(private prisma: PrismaService) {}

  generateHmacSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async createApiKey(dto: CreateApiKeyDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const rawKey = `ayunet_live_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const id = `apk-${Date.now()}`;
    const expiresAt = new Date(Date.now() + (dto.expiresInDays || 365) * 24 * 60 * 60 * 1000);

    const apiKeyRecord = {
      id,
      name: dto.name,
      keyPrefix: `${rawKey.substring(0, 15)}...`,
      secretHash,
      scopes: dto.scopes,
      expiresAt,
      createdAt: new Date(),
    };

    this.apiKeys.set(id, apiKeyRecord);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'API_KEY_CREATED', 'ApiKey', id, null, { name: dto.name, scopes: dto.scopes }, ipAddress, userAgent, tx);
    });

    return {
      id,
      name: dto.name,
      apiKey: rawKey,
      scopes: dto.scopes,
      expiresAt,
    };
  }

  async getApiKeys() {
    const list: any[] = [];
    this.apiKeys.forEach(k => list.push({ id: k.id, name: k.name, keyPrefix: k.keyPrefix, scopes: k.scopes, expiresAt: k.expiresAt, createdAt: k.createdAt }));
    return list;
  }

  async updateApiKey(id: string, scopes: string[], actorId: string) {
    const existing = this.apiKeys.get(id);
    if (!existing) {
      throw new NotFoundException(`API Key with ID '${id}' not found.`);
    }

    const updated = { ...existing, scopes };
    this.apiKeys.set(id, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'API_KEY_UPDATED', 'ApiKey', id, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async revokeApiKey(id: string, actorId: string) {
    const existing = this.apiKeys.get(id);
    if (!existing) {
      throw new NotFoundException(`API Key with ID '${id}' not found.`);
    }

    this.apiKeys.delete(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'API_KEY_REVOKED', 'ApiKey', id, existing, null, '127.0.0.1', 'system', tx);
    });

    return { message: 'API Key revoked successfully.' };
  }

  async createWebhook(dto: CreateWebhookDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const id = `whk-${Date.now()}`;
    const secret = dto.secret || crypto.randomBytes(32).toString('hex');

    const webhook = {
      id,
      targetUrl: dto.targetUrl,
      events: dto.events,
      secret,
      isActive: true,
      createdAt: new Date(),
    };

    this.webhooks.set(id, webhook);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WEBHOOK_REGISTERED', 'Webhook', id, null, webhook, ipAddress, userAgent, tx);
    });

    return webhook;
  }

  async getWebhooks() {
    const list: any[] = [];
    this.webhooks.forEach(w => list.push(w));
    return list;
  }

  async updateWebhook(id: string, dto: UpdateWebhookDto, actorId: string) {
    const existing = this.webhooks.get(id);
    if (!existing) {
      throw new NotFoundException(`Webhook with ID '${id}' not found.`);
    }

    const updated = {
      ...existing,
      targetUrl: dto.targetUrl || existing.targetUrl,
      events: dto.events || existing.events,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
    };
    this.webhooks.set(id, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WEBHOOK_UPDATED', 'Webhook', id, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async deleteWebhook(id: string, actorId: string) {
    const existing = this.webhooks.get(id);
    if (!existing) {
      throw new NotFoundException(`Webhook with ID '${id}' not found.`);
    }

    this.webhooks.delete(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WEBHOOK_DELETED', 'Webhook', id, existing, null, '127.0.0.1', 'system', tx);
    });

    return { message: 'Webhook deleted successfully.' };
  }

  async replayWebhook(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new NotFoundException(`Webhook with ID '${id}' not found.`);
    }

    const mockPayload = { event: 'AppointmentCreated', timestamp: new Date().toISOString(), data: { id: 'app-sample-123' } };
    const signature = this.generateHmacSignature(JSON.stringify(mockPayload), webhook.secret);

    const deliveryRecord = {
      id: `del-${Date.now()}`,
      webhookId: id,
      event: 'AppointmentCreated',
      payload: mockPayload,
      signature,
      statusCode: 200,
      success: true,
      deliveredAt: new Date(),
    };

    this.webhookDeliveries.push(deliveryRecord);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WEBHOOK_DELIVERED', 'Webhook', id, null, deliveryRecord, ipAddress, userAgent, tx);
    });

    return deliveryRecord;
  }

  async getPatientFhir(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { userProfile: true },
    });
    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID '${id}' not found.`);
    }

    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        { system: 'https://ayunet.org/fhir/id', value: patient.id },
      ],
      name: [
        { use: 'official', family: patient.userProfile.lastName, given: [patient.userProfile.firstName] },
      ],
      gender: patient.gender ? patient.gender.toLowerCase() : 'unknown',
      birthDate: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : undefined,
    };
  }

  async getLabReportFhir(id: string) {
    const labReport = await this.prisma.labReport.findUnique({
      where: { id },
      include: { labOrder: { include: { patient: { include: { userProfile: true } } } } },
    });
    if (!labReport || labReport.deletedAt) {
      throw new NotFoundException(`Lab report with ID '${id}' not found.`);
    }

    return {
      resourceType: 'DiagnosticReport',
      id: labReport.id,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '11502-2', display: 'Laboratory Report' }],
      },
      subject: {
        reference: `Patient/${labReport.labOrder.patientId}`,
        display: `${labReport.labOrder.patient.userProfile.firstName} ${labReport.labOrder.patient.userProfile.lastName}`,
      },
      issued: labReport.createdAt.toISOString(),
      conclusion: labReport.summaryFindings || 'Lab test results completed.',
    };
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
