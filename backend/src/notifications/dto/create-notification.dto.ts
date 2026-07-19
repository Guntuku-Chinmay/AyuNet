import { IsUUID, IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({ description: 'Notification title', example: 'Lab Report Ready' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Notification body content', example: 'Your lab report for CBC is ready.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'Selected communication channel', enum: NotificationChannel, example: NotificationChannel.IN_APP })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiPropertyOptional({ description: 'Key-value variable properties or context metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
