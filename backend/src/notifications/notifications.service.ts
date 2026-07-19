import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

export interface NotificationProvider {
  send(recipient: string, title: string, content: string): Promise<boolean>;
}

@Injectable()
export class NotificationsService {
  private templates = new Map<string, string>();
  private mockQuietHours = { start: 22, end: 7 }; // 10 PM to 7 AM

  private emailProvider: NotificationProvider = {
    async send(recipient, title, content) {
      console.log(`[EMAIL ADAPTER] Sending to ${recipient}: ${title} - ${content}`);
      return true;
    }
  };

  private smsProvider: NotificationProvider = {
    async send(recipient, title, content) {
      console.log(`[SMS ADAPTER] Sending to ${recipient}: ${title} - ${content}`);
      return true;
    }
  };

  private pushProvider: NotificationProvider = {
    async send(recipient, title, content) {
      console.log(`[PUSH ADAPTER] Sending to ${recipient}: ${title} - ${content}`);
      return true;
    }
  };

  constructor(private prisma: PrismaService) {
    this.templates.set('WELCOME_MESSAGE', 'Hello {{firstName}}, welcome to AyuNet Health Portal!');
    this.templates.set('OTP_VERIFICATION', 'Your security verification OTP code is {{otpCode}}.');
    this.templates.set('PASSWORD_RESET', 'Click the link to reset your password: {{resetUrl}}.');
    this.templates.set('APPOINTMENT_CONFIRMATION', 'Your appointment with Dr. {{doctorName}} on {{date}} is confirmed.');
  }

  compileTemplate(templateName: string, variables: any): string {
    const raw = this.templates.get(templateName);
    if (!raw) {
      throw new NotFoundException(`Notification template '${templateName}' not found.`);
    }

    let compiled = raw;
    for (const key of Object.keys(variables)) {
      compiled = compiled.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    }
    return compiled;
  }

  isQuietHours(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= this.mockQuietHours.start || currentHour < this.mockQuietHours.end;
  }

  async send(dto: CreateNotificationDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const recipient = await this.prisma.user.findUnique({ where: { id: dto.recipientId }, include: { userProfile: true } });
    if (!recipient || recipient.deletedAt) {
      throw new NotFoundException(`Recipient with ID '${dto.recipientId}' not found.`);
    }

    if (dto.metadata?.idempotencyKey) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          recipientId: dto.recipientId,
          metadata: { path: ['idempotencyKey'], equals: dto.metadata.idempotencyKey },
          deletedAt: null,
        },
      });
      if (existing) {
        return existing;
      }
    }

    const category = dto.metadata?.category || 'GENERAL';
    const preference = await this.prisma.notificationPreference.findFirst({
      where: { userId: dto.recipientId, category, deletedAt: null },
    });

    if (preference) {
      const isChannelEnabled =
        (dto.channel === NotificationChannel.EMAIL && preference.emailEnabled) ||
        (dto.channel === NotificationChannel.SMS && preference.smsEnabled) ||
        (dto.channel === NotificationChannel.PUSH && preference.pushEnabled) ||
        (dto.channel === NotificationChannel.IN_APP && preference.inAppEnabled);

      if (!isChannelEnabled) {
        throw new BadRequestException(`Recipient has disabled ${dto.channel} notifications for category '${category}'.`);
      }
    }

    let status: NotificationStatus = 'PENDING' as NotificationStatus;
    const isEmergency = dto.metadata?.isEmergency === true;

    if (this.isQuietHours() && !isEmergency && dto.channel !== NotificationChannel.IN_APP) {
      status = 'PENDING' as NotificationStatus;
    } else {
      let success = true;
      const contactTarget = recipient.email || recipient.phoneNumber || 'push-device-token';
      try {
        if (dto.channel === NotificationChannel.EMAIL) {
          success = await this.emailProvider.send(contactTarget, dto.title, dto.content);
        } else if (dto.channel === NotificationChannel.SMS) {
          success = await this.smsProvider.send(contactTarget, dto.title, dto.content);
        } else if (dto.channel === NotificationChannel.PUSH) {
          success = await this.pushProvider.send(contactTarget, dto.title, dto.content);
        }
      } catch (err) {
        success = false;
      }
      status = success ? ('SENT' as NotificationStatus) : ('FAILED' as NotificationStatus);
    }

    return this.prisma.$transaction(async (tx) => {
      const notification = await tx.notification.create({
        data: {
          recipientId: dto.recipientId,
          title: dto.title,
          content: dto.content,
          channel: dto.channel,
          status,
          metadata: dto.metadata || null,
          createdBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'NOTIFICATION_CREATED', 'Notification', notification.id, null, notification, ipAddress, userAgent, tx);
      return notification;
    });
  }

  async markRead(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.deletedAt) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.notification.update({
        where: { id },
        data: {
          status: 'READ' as NotificationStatus,
          readAt: new Date(),
          updatedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'NOTIFICATION_READ', 'Notification', id, notification, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async archive(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.deletedAt) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.notification.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
        },
      });

      await this.createAuditLog(actorId, 'NOTIFICATION_ARCHIVED', 'Notification', id, notification, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async retry(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id }, include: { recipient: true } });
    if (!notification || notification.deletedAt) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }

    if (notification.status !== ('FAILED' as NotificationStatus)) {
      throw new BadRequestException('Only failed notifications can be retried.');
    }

    let success = true;
    const contactTarget = notification.recipient.email || notification.recipient.phoneNumber || 'push-device-token';
    try {
      if (notification.channel === NotificationChannel.EMAIL) {
        success = await this.emailProvider.send(contactTarget, notification.title, notification.content);
      } else if (notification.channel === NotificationChannel.SMS) {
        success = await this.smsProvider.send(contactTarget, notification.title, notification.content);
      } else if (notification.channel === NotificationChannel.PUSH) {
        success = await this.pushProvider.send(contactTarget, notification.title, notification.content);
      }
    } catch (err) {
      success = false;
    }

    const status = success ? ('SENT' as NotificationStatus) : ('FAILED' as NotificationStatus);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.notification.update({
        where: { id },
        data: { status, updatedBy: actorId },
      });

      await this.createAuditLog(actorId, 'NOTIFICATION_RETRIED', 'Notification', id, notification, updated, ipAddress, userAgent, tx);
      return updated;
    });
  }

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId, deletedAt: null },
    });
  }

  async updatePreference(dto: UpdatePreferenceDto, userId: string, actorId: string) {
    const existing = await this.prisma.notificationPreference.findFirst({
      where: { userId, category: dto.category, deletedAt: null },
    });

    return this.prisma.$transaction(async (tx) => {
      let preference;
      if (existing) {
        preference = await tx.notificationPreference.update({
          where: { id: existing.id },
          data: {
            emailEnabled: dto.emailEnabled,
            smsEnabled: dto.smsEnabled,
            pushEnabled: dto.pushEnabled,
            inAppEnabled: dto.inAppEnabled,
            updatedBy: actorId,
          },
        });
      } else {
        preference = await tx.notificationPreference.create({
          data: {
            userId,
            category: dto.category,
            emailEnabled: dto.emailEnabled,
            smsEnabled: dto.smsEnabled,
            pushEnabled: dto.pushEnabled,
            inAppEnabled: dto.inAppEnabled,
            createdBy: actorId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'PREFERENCE_CHANGED',
          entityName: 'NotificationPreference',
          entityId: preference.id,
          oldValues: existing ? JSON.parse(JSON.stringify(existing)) : null,
          newValues: JSON.parse(JSON.stringify(preference)),
          ipAddress: '127.0.0.1',
          userAgent: 'system',
          createdBy: actorId,
        },
      });

      return preference;
    });
  }

  async createTemplate(dto: CreateTemplateDto, _actorId: string) {
    if (this.templates.has(dto.name)) {
      throw new ConflictException(`Template with identifier '${dto.name}' already exists.`);
    }
    this.templates.set(dto.name, dto.body);
    return { name: dto.name, body: dto.body };
  }
  async triggerNotification(
    recipientId: string,
    title: string,
    content: string,
    channel: NotificationChannel = NotificationChannel.IN_APP,
    metadata: any = {}
  ) {
    return this.send({ recipientId, title, content, channel, metadata }, 'system');
  }
  async getTemplates() {
    const list: Array<{ name: string; body: string }> = [];
    this.templates.forEach((body, name) => {
      list.push({ name, body });
    });
    return list;
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: { recipient: { include: { userProfile: true } } },
    });
    if (!notification || notification.deletedAt) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }
    return notification;
  }

  async findAll(recipientId?: string) {
    const where: any = { deletedAt: null };
    if (recipientId) {
      where.recipientId = recipientId;
    }
    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
