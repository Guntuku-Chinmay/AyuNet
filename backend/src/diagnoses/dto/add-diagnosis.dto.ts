import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddDiagnosisDto {
  @ApiProperty({ description: 'The associated EMR record ID' })
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId!: string;

  @ApiProperty({ description: 'ICD-10 clinical diagnosis code', example: 'I10' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Classification system', example: 'ICD-10', default: 'ICD-10' })
  @IsString()
  @IsOptional()
  codeSystem?: string = 'ICD-10';

  @ApiProperty({ description: 'Full description details', example: 'Essential (primary) hypertension' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Type of diagnosis (e.g. PRIMARY, SECONDARY)', example: 'PRIMARY' })
  @IsString()
  @IsNotEmpty()
  diagnosisType!: string;

  @ApiProperty({ description: 'Clinical status (e.g. ACTIVE, RESOLVED)', example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}
