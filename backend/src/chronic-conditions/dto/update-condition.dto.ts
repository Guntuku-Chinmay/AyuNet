import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConditionStatus } from '@prisma/client';

export class UpdateConditionDto {
  @ApiPropertyOptional({ description: 'The chronic condition name' })
  @IsString()
  @IsOptional()
  conditionName?: string;

  @ApiPropertyOptional({ description: 'The code of the condition' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Date of original diagnosis (ISO string)' })
  @IsDateString()
  @IsOptional()
  diagnosedDate?: string;

  @ApiPropertyOptional({ description: 'Condition status', enum: ConditionStatus })
  @IsEnum(ConditionStatus)
  @IsOptional()
  status?: ConditionStatus;

  @ApiPropertyOptional({ description: 'Clinical notes or observations' })
  @IsString()
  @IsOptional()
  notes?: string;
}
