import { IsUUID, IsNotEmpty, IsString, IsInt, Min, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateSlotsDto {
  @ApiProperty({ description: 'The doctor ID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ description: 'The hospital branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ description: 'Target date to generate slots', example: '2026-07-20' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ description: 'Start time of generation range', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be HH:MM format' })
  startTime!: string;

  @ApiProperty({ description: 'End time of generation range', example: '17:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be HH:MM format' })
  endTime!: string;

  @ApiPropertyOptional({ description: 'Slot interval in minutes', example: 20, default: 20 })
  @IsInt()
  @Min(5)
  @IsOptional()
  slotDurationMinutes?: number = 20;
}
