import { IsUUID, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VisitType } from '@prisma/client';

export class BookAppointmentDto {
  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'The doctor ID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ description: 'The hospital branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ description: 'The reserved time slot ID' })
  @IsUUID()
  @IsNotEmpty()
  timeSlotId!: string;

  @ApiProperty({ description: 'Scheduled start date/time (ISO string)', example: '2026-07-20T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledStartAt!: string;

  @ApiProperty({ description: 'Scheduled end date/time (ISO string)', example: '2026-07-20T10:20:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledEndAt!: string;

  @ApiProperty({ description: 'Type of clinical visit', enum: VisitType, example: VisitType.OUTPATIENT })
  @IsEnum(VisitType)
  @IsNotEmpty()
  type!: VisitType;
}
