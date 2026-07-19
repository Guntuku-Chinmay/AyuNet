import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({ description: 'Subjective symptoms' })
  @IsString()
  @IsOptional()
  symptoms?: string;

  @ApiPropertyOptional({ description: 'Clinical SOAP notes' })
  @IsString()
  @IsOptional()
  clinicalNotes?: string;

  @ApiPropertyOptional({ description: 'Treatment plan recommendations' })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;
}
