import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VisitType, AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ description: 'Scheduled start date/time (ISO string)' })
  @IsDateString()
  @IsOptional()
  scheduledStartAt?: string;

  @ApiPropertyOptional({ description: 'Scheduled end date/time (ISO string)' })
  @IsDateString()
  @IsOptional()
  scheduledEndAt?: string;

  @ApiPropertyOptional({ description: 'Type of clinical visit', enum: VisitType })
  @IsEnum(VisitType)
  @IsOptional()
  type?: VisitType;

  @ApiPropertyOptional({ description: 'Current status of the appointment', enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}
