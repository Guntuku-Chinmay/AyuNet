import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PatientQueryDto {
  @ApiPropertyOptional({ description: 'Search term for name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by Medical Record Number (MRN)' })
  @IsString()
  @IsOptional()
  mrn?: string;

  @ApiPropertyOptional({ description: 'Filter by national ID' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Filter by passport number' })
  @IsString()
  @IsOptional()
  passport?: string;

  @ApiPropertyOptional({ description: 'Filter by insurance number' })
  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @ApiPropertyOptional({ description: 'Pagination page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Pagination page size limit', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
