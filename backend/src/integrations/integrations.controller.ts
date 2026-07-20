import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IntegrationsService } from './integrations.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('api-keys')
  @ApiOperation({ summary: 'Generate a new partner API Key' })
  @ApiResponse({ status: 201, description: 'API Key generated.' })
  createApiKey(
    @Body() dto: CreateApiKeyDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.integrationsService.createApiKey(dto, user.id, ip, ua);
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'List generated API Keys' })
  getApiKeys() {
    return this.integrationsService.getApiKeys();
  }

  @Patch('api-keys/:id')
  @ApiOperation({ summary: 'Update API Key permission scopes' })
  updateApiKey(
    @Param('id') id: string,
    @Body('scopes') scopes: string[],
    @CurrentUser() user: any
  ) {
    return this.integrationsService.updateApiKey(id, scopes, user.id);
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke an active API Key' })
  revokeApiKey(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.integrationsService.revokeApiKey(id, user.id);
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Register an outgoing webhook subscription' })
  @ApiResponse({ status: 201, description: 'Webhook registered.' })
  createWebhook(
    @Body() dto: CreateWebhookDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.integrationsService.createWebhook(dto, user.id, ip, ua);
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'List registered webhooks' })
  getWebhooks() {
    return this.integrationsService.getWebhooks();
  }

  @Patch('webhooks/:id')
  @ApiOperation({ summary: 'Update webhook target URL or subscribed events' })
  updateWebhook(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @CurrentUser() user: any
  ) {
    return this.integrationsService.updateWebhook(id, dto, user.id);
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Delete a webhook subscription' })
  deleteWebhook(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.integrationsService.deleteWebhook(id, user.id);
  }

  @Post('webhooks/:id/replay')
  @ApiOperation({ summary: 'Replay a webhook event dispatch' })
  replayWebhook(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.integrationsService.replayWebhook(id, user.id, ip, ua);
  }

  @Get('fhir/r4/Patient/:id')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 Patient representation' })
  getPatientFhir(@Param('id') id: string) {
    return this.integrationsService.getPatientFhir(id);
  }

  @Get('fhir/r4/DiagnosticReport/:id')
  @ApiOperation({ summary: 'Get HL7 FHIR R4 DiagnosticReport (Lab Report) representation' })
  getLabReportFhir(@Param('id') id: string) {
    return this.integrationsService.getLabReportFhir(id);
  }
}
