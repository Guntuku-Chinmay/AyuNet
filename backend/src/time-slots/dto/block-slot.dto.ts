import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockSlotDto {
  @ApiProperty({ description: 'The doctor ID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ description: 'The hospital branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ description: 'Slot start date/time (ISO string)', example: '2026-07-20T09:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  startAt!: string;

  @ApiProperty({ description: 'Slot end date/time (ISO string)', example: '2026-07-20T09:20:00.000Z' })
  @IsString()
  @IsNotEmpty()
  endAt!: string;

  @ApiPropertyOptional({ description: 'Reason for blocking this slot', example: 'Physician Conference' })
  @IsString()
  @IsOptional()
  reason?: string;
}
