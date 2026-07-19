import { IsUUID, IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConditionStatus } from '@prisma/client';

export class AddConditionDto {
  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'The chronic condition name (e.g. Diabetes, Hypertension)', example: 'Diabetes' })
  @IsString()
  @IsNotEmpty()
  conditionName!: string;

  @ApiPropertyOptional({ description: 'The code of the condition', example: 'E11.9' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Date of original diagnosis (ISO string)', example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  diagnosedDate?: string;

  @ApiProperty({ description: 'Condition status', enum: ConditionStatus, example: ConditionStatus.ACTIVE })
  @IsEnum(ConditionStatus)
  @IsNotEmpty()
  status!: ConditionStatus;

  @ApiPropertyOptional({ description: 'Clinical notes or observations' })
  @IsString()
  @IsOptional()
  notes?: string;
}
