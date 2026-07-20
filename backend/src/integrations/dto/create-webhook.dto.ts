import { IsNotEmpty, IsString, IsUrl, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty({ description: 'Target destination URL for webhook HTTP dispatches', example: 'https://partner.clinic.com/webhooks/ayunet' })
  @IsUrl()
  @IsNotEmpty()
  targetUrl!: string;

  @ApiProperty({ description: 'List of subscribed domain event types', example: ['AppointmentCreated', 'LabReportVerified', 'InvoicePaid'] })
  @IsArray()
  @IsNotEmpty()
  events!: string[];

  @ApiPropertyOptional({ description: 'Optional HMAC SHA-256 secret signature key' })
  @IsString()
  @IsOptional()
  secret?: string;
}
