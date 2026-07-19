import { IsUUID, IsNotEmpty, IsArray, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabOrderDto {
  @ApiPropertyOptional({ description: 'The associated EMR medical record ID' })
  @IsUUID()
  @IsOptional()
  medicalRecordId?: string;

  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiPropertyOptional({ description: 'The ordering clinician doctor ID' })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({ description: 'The assigned Diagnostic Center ID' })
  @IsUUID()
  @IsNotEmpty()
  diagnosticCenterId!: string;

  @ApiProperty({ description: 'List of Lab Test IDs to be performed', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  testIds!: string[];
}
