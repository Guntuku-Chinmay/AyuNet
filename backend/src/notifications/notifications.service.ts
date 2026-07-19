import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async triggerNotification(
    recipientId: string,
    title: string,
    content: string,
    channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' = 'IN_APP',
    metadata?: any
  ) {
    return this.prisma.notification.create({
      data: {
        recipientId,
        title,
        content,
        channel,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  }
}
