import { IsNotEmpty, IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ description: 'Type identifier of the report', example: 'REVENUE_SUMMARY' })
  @IsString()
  @IsNotEmpty()
  reportType!: string;

  @ApiPropertyOptional({ description: 'Export output format (CSV, PDF, EXCEL)', default: 'CSV' })
  @IsString()
  @IsOptional()
  format?: string = 'CSV';

  @ApiPropertyOptional({ description: 'Filter start date ISO string' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter end date ISO string' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Optional hospital branch ID filter' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Optional doctor ID filter' })
  @IsUUID()
  @IsOptional()
  doctorId?: string;
}
