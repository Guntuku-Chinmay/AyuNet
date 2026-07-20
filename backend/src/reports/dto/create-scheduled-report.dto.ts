import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduledReportDto {
  @ApiProperty({ description: 'Report category type', example: 'REVENUE_SUMMARY' })
  @IsString()
  @IsNotEmpty()
  reportType!: string;

  @ApiProperty({ description: 'Schedule frequency (DAILY, WEEKLY, MONTHLY)', example: 'DAILY' })
  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @ApiPropertyOptional({ description: 'Output export format', default: 'CSV' })
  @IsString()
  @IsOptional()
  format?: string = 'CSV';

  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail!: string;
}
