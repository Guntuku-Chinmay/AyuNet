import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'The doctor ID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiPropertyOptional({ description: 'The active visit ID' })
  @IsUUID()
  @IsOptional()
  visitId?: string;

  @ApiProperty({ description: 'Subjective symptoms', example: 'Severe headache and nausea' })
  @IsString()
  @IsNotEmpty()
  symptoms!: string;

  @ApiProperty({ description: 'Clinical SOAP notes' })
  @IsString()
  @IsNotEmpty()
  clinicalNotes!: string;

  @ApiPropertyOptional({ description: 'Treatment plan recommendations' })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;
}
