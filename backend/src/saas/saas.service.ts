import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateWhiteLabelDto } from './dto/update-white-label.dto';

@Injectable()
export class SaasService {
  private tenants = new Map<string, { id: string; name: string; domain: string; plan: string; adminEmail: string; isActive: boolean; createdAt: Date }>();
  private subscriptions = new Map<string, { tenantId: string; plan: string; status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'; currentPeriodEnd: Date; seatsLimit: number; storageLimitGb: number }>();
  private meters = new Map<string, { apiCallsCount: number; storageUsedBytes: number; aiTokensCount: number; smsCount: number }>();
  private featureFlags = new Map<string, Map<string, boolean>>();
  private whiteLabels = new Map<string, { tenantId: string; customDomain?: string; logoUrl?: string; primaryColor: string; accentColor: string }>();
  private plugins = new Map<string, { id: string; name: string; version: string; description: string; author: string; isInstalled: boolean }>();

  constructor(private prisma: PrismaService) {
    this.plugins.set('plg-telehealth-zoom', { id: 'plg-telehealth-zoom', name: 'Zoom Telehealth Integration', version: '2.1.0', description: 'Enable seamless video consultations via Zoom.', author: 'AyuNet Labs', isInstalled: false });
    this.plugins.set('plg-insurance-claims', { id: 'plg-insurance-claims', name: 'Claims Clearinghouse Connector', version: '1.4.2', description: 'Automated electronic claim submission.', author: 'HealthTech Connect', isInstalled: false });
  }

  async createTenant(dto: CreateTenantDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const id = `tenant-${Date.now()}`;
    const tenant = {
      id,
      name: dto.name,
      domain: dto.domain.toLowerCase(),
      plan: dto.plan.toUpperCase(),
      adminEmail: dto.adminEmail,
      isActive: true,
      createdAt: new Date(),
    };

    this.tenants.set(id, tenant);

    this.subscriptions.set(id, {
      tenantId: id,
      plan: tenant.plan,
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      seatsLimit: tenant.plan === 'ENTERPRISE' ? 1000 : tenant.plan === 'PROFESSIONAL' ? 100 : 10,
      storageLimitGb: tenant.plan === 'ENTERPRISE' ? 10000 : 100,
    });

    this.meters.set(id, { apiCallsCount: 1400, storageUsedBytes: 540000000, aiTokensCount: 12000, smsCount: 45 });

    const tenantFlags = new Map<string, boolean>();
    tenantFlags.set('ENABLE_AI_ASSISTANT', true);
    tenantFlags.set('ENABLE_FHIR_EXPORT', true);
    tenantFlags.set('ENABLE_BETA_PATIENT_PORTAL', tenant.plan === 'ENTERPRISE');
    this.featureFlags.set(id, tenantFlags);

    this.whiteLabels.set(id, {
      tenantId: id,
      primaryColor: '#0052CC',
      accentColor: '#FFAB00',
    });

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'TENANT_CREATED', 'Tenant', id, null, tenant, ipAddress, userAgent, tx);
    });

    return tenant;
  }

  async getTenants() {
    const list: any[] = [];
    this.tenants.forEach(t => list.push(t));
    return list;
  }

  async getTenant(id: string) {
    const tenant = this.tenants.get(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found.`);
    }
    return tenant;
  }

  async updateTenant(id: string, dto: UpdateTenantDto, actorId: string) {
    const existing = this.tenants.get(id);
    if (!existing) {
      throw new NotFoundException(`Tenant with ID '${id}' not found.`);
    }

    const updated = {
      ...existing,
      name: dto.name || existing.name,
      domain: dto.domain ? dto.domain.toLowerCase() : existing.domain,
      plan: dto.plan ? dto.plan.toUpperCase() : existing.plan,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
    };
    this.tenants.set(id, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'TENANT_UPDATED', 'Tenant', id, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async getSubscriptions(tenantId: string) {
    const sub = this.subscriptions.get(tenantId);
    const meter = this.meters.get(tenantId) || { apiCallsCount: 0, storageUsedBytes: 0, aiTokensCount: 0, smsCount: 0 };
    return {
      subscription: sub,
      metering: meter,
    };
  }

  async changeSubscriptionPlan(tenantId: string, plan: string, actorId: string) {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) {
      throw new NotFoundException(`Subscription for tenant '${tenantId}' not found.`);
    }

    sub.plan = plan.toUpperCase();
    sub.seatsLimit = sub.plan === 'ENTERPRISE' ? 1000 : sub.plan === 'PROFESSIONAL' ? 100 : 10;
    this.subscriptions.set(tenantId, sub);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'SUBSCRIPTION_PLAN_CHANGED', 'Subscription', tenantId, null, { newPlan: sub.plan }, '127.0.0.1', 'system', tx);
    });

    return sub;
  }

  async getFeatureFlags(tenantId: string) {
    const flags = this.featureFlags.get(tenantId) || new Map<string, boolean>();
    const res: Record<string, boolean> = {};
    flags.forEach((val, key) => res[key] = val);
    return res;
  }

  async toggleFeatureFlag(tenantId: string, flagKey: string, enabled: boolean, actorId: string) {
    let flags = this.featureFlags.get(tenantId);
    if (!flags) {
      flags = new Map<string, boolean>();
      this.featureFlags.set(tenantId, flags);
    }
    flags.set(flagKey, enabled);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'FEATURE_FLAG_TOGGLED', 'FeatureFlag', flagKey, null, { enabled }, '127.0.0.1', 'system', tx);
    });

    return { flagKey, enabled };
  }

  async getWhiteLabel(tenantId: string) {
    return this.whiteLabels.get(tenantId) || { tenantId, primaryColor: '#0052CC', accentColor: '#FFAB00' };
  }

  async updateWhiteLabel(tenantId: string, dto: UpdateWhiteLabelDto, actorId: string) {
    const existing = this.whiteLabels.get(tenantId) || { tenantId, primaryColor: '#0052CC', accentColor: '#FFAB00' };
    const updated = {
      ...existing,
      customDomain: dto.customDomain || existing.customDomain,
      logoUrl: dto.logoUrl || existing.logoUrl,
      primaryColor: dto.primaryColor || existing.primaryColor,
      accentColor: dto.accentColor || existing.accentColor,
    };
    this.whiteLabels.set(tenantId, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WHITE_LABEL_UPDATED', 'WhiteLabel', tenantId, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async getMarketplacePlugins() {
    const list: any[] = [];
    this.plugins.forEach(p => list.push(p));
    return list;
  }

  async installMarketplacePlugin(pluginId: string, tenantId: string, actorId: string) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new NotFoundException(`Marketplace plugin with ID '${pluginId}' not found.`);
    }

    plugin.isInstalled = true;
    this.plugins.set(pluginId, plugin);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'PLUGIN_INSTALLED', 'MarketplacePlugin', pluginId, null, { tenantId }, '127.0.0.1', 'system', tx);
    });

    return plugin;
  }

  async getDeveloperSandboxes() {
    return {
      sandboxEnvironment: 'https://sandbox.api.ayunet.org/v1',
      apiKeyHint: 'ayunet_sandbox_key_9921',
      sdkDownloads: [
        { language: 'TypeScript / Node.js', npmPackage: '@ayunet/sdk', version: '2.4.0' },
        { language: 'Flutter / Dart', pubPackage: 'ayunet_flutter', version: '1.8.0' },
        { language: 'Java / Kotlin', mavenArtifact: 'org.ayunet:sdk:3.1.0', version: '3.1.0' },
        { language: 'Swift (iOS)', cocoapod: 'AyuNetSDK', version: '1.5.0' },
      ],
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
