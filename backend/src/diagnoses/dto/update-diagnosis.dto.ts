import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDiagnosisDto {
  @ApiPropertyOptional({ description: 'ICD-10 clinical diagnosis code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Full description details' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Type of diagnosis (e.g. PRIMARY, SECONDARY)' })
  @IsString()
  @IsOptional()
  diagnosisType?: string;

  @ApiPropertyOptional({ description: 'Clinical status' })
  @IsString()
  @IsOptional()
  status?: string;
}
