import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SaasService } from './saas.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateWhiteLabelDto } from './dto/update-white-label.dto';

@ApiTags('saas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SaasController {
  constructor(private readonly saasService: SaasService) {}

  @Post('tenants')
  @ApiOperation({ summary: 'Provision a new SaaS tenant organisation' })
  @ApiResponse({ status: 201, description: 'Tenant provisioned.' })
  createTenant(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.saasService.createTenant(dto, user.id, ip, ua);
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all registered SaaS tenants' })
  getTenants() {
    return this.saasService.getTenants();
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get tenant details by ID' })
  getTenant(@Param('id') id: string) {
    return this.saasService.getTenant(id);
  }

  @Patch('tenants/:id')
  @ApiOperation({ summary: 'Update tenant profile or subscription tier' })
  updateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: any
  ) {
    return this.saasService.updateTenant(id, dto, user.id);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get active subscription and usage meters' })
  getSubscriptions(@CurrentUser() user: any) {
    return this.saasService.getSubscriptions(user.tenantId || 'tenant-default');
  }

  @Post('subscriptions/change')
  @ApiOperation({ summary: 'Upgrade or downgrade subscription plan' })
  changeSubscriptionPlan(
    @Body('plan') plan: string,
    @CurrentUser() user: any
  ) {
    return this.saasService.changeSubscriptionPlan(user.tenantId || 'tenant-default', plan, user.id);
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'List tenant feature flags' })
  getFeatureFlags(@CurrentUser() user: any) {
    return this.saasService.getFeatureFlags(user.tenantId || 'tenant-default');
  }

  @Patch('feature-flags/:key')
  @ApiOperation({ summary: 'Toggle tenant feature flag' })
  toggleFeatureFlag(
    @Param('key') key: string,
    @Body('enabled') enabled: boolean,
    @CurrentUser() user: any
  ) {
    return this.saasService.toggleFeatureFlag(user.tenantId || 'tenant-default', key, enabled, user.id);
  }

  @Get('white-label')
  @ApiOperation({ summary: 'Get white-label branding assets and custom domain' })
  getWhiteLabel(@CurrentUser() user: any) {
    return this.saasService.getWhiteLabel(user.tenantId || 'tenant-default');
  }

  @Patch('white-label')
  @ApiOperation({ summary: 'Update white-label theme colors and logo URL' })
  updateWhiteLabel(
    @Body() dto: UpdateWhiteLabelDto,
    @CurrentUser() user: any
  ) {
    return this.saasService.updateWhiteLabel(user.tenantId || 'tenant-default', dto, user.id);
  }

  @Get('marketplace/plugins')
  @ApiOperation({ summary: 'List available marketplace extensions' })
  getMarketplacePlugins() {
    return this.saasService.getMarketplacePlugins();
  }

  @Post('marketplace/plugins/:id/install')
  @ApiOperation({ summary: 'Install a marketplace plugin extension' })
  installMarketplacePlugin(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.saasService.installMarketplacePlugin(id, user.tenantId || 'tenant-default', user.id);
  }

  @Get('developer-portal/sandboxes')
  @ApiOperation({ summary: 'Get developer portal API sandbox credentials & SDK downloads' })
  getDeveloperSandboxes() {
    return this.saasService.getDeveloperSandboxes();
  }
}
