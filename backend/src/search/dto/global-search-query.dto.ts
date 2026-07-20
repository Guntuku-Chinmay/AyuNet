import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GlobalSearchQueryDto {
  @ApiProperty({ description: 'Search term or query string', example: 'John' })
  @IsString()
  @IsNotEmpty()
  q!: string;

  @ApiPropertyOptional({ description: 'Specific entity types to filter by (Patient, Doctor, Appointment, EMR, Prescriptions, LabReports, Invoices, Files, Notifications)', example: ['Patient', 'Doctor'] })
  @IsArray()
  @IsOptional()
  entityTypes?: string[];

  @ApiPropertyOptional({ description: 'Maximum search result limit', default: 20 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search result offset page', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset?: number = 0;
}
