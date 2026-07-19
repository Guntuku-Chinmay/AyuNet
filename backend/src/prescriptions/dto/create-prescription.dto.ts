import { IsUUID, IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'The associated medical record ID' })
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId!: string;

  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'The prescribing doctor ID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ description: 'Validity duration deadline of the prescription' })
  @IsDateString()
  @IsNotEmpty()
  validUntil!: string;

  @ApiPropertyOptional({ description: 'Digital signature code or cryptographic verification string' })
  @IsString()
  @IsOptional()
  digitalSignature?: string = '';
}
