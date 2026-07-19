import { IsUUID, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleAppointmentDto {
  @ApiProperty({ description: 'The new time slot ID to book' })
  @IsUUID()
  @IsNotEmpty()
  timeSlotId!: string;

  @ApiProperty({ description: 'Scheduled start date/time (ISO string)', example: '2026-07-20T11:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledStartAt!: string;

  @ApiProperty({ description: 'Scheduled end date/time (ISO string)', example: '2026-07-20T11:20:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledEndAt!: string;
}
