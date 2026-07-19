import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('notifications')
  @ApiOperation({ summary: 'Send or queue a notification alert' })
  @ApiResponse({ status: 201, description: 'Notification sent/queued successfully.' })
  create(
    @Body() dto: CreateNotificationDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.notificationsService.send(dto, user.id, ip, ua);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'recipientId', required: false, description: 'Filter by recipient user ID' })
  findAll(@Query('recipientId') recipientId?: string) {
    return this.notificationsService.findAll(recipientId);
  }

  @Get('notifications/:id')
  @ApiOperation({ summary: 'Get notification details' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.notificationsService.markRead(id, user.id, ip, ua);
  }

  @Patch('notifications/:id/archive')
  @ApiOperation({ summary: 'Archive/soft-delete a notification' })
  archive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.notificationsService.archive(id, user.id, ip, ua);
  }

  @Post('notifications/:id/retry')
  @ApiOperation({ summary: 'Retry a failed notification dispatch' })
  retry(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.notificationsService.retry(id, user.id, ip, ua);
  }

  @Post('notification-templates')
  @ApiOperation({ summary: 'Register a new notification template layout' })
  createTemplate(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: any
  ) {
    return this.notificationsService.createTemplate(dto, user.id);
  }

  @Get('notification-templates')
  @ApiOperation({ summary: 'List all registered templates' })
  getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Get('notification-preferences')
  @ApiOperation({ summary: 'Get current communication channel preferences' })
  getPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Patch('notification-preferences')
  @ApiOperation({ summary: 'Update communication preference configurations' })
  updatePreference(
    @Body() dto: UpdatePreferenceDto,
    @CurrentUser() user: any
  ) {
    return this.notificationsService.updatePreference(dto, user.id, user.id);
  }
}
