import { IsUUID, IsNotEmpty, IsString, IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordVaccinationDto {
  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Vaccine name', example: 'BCG' })
  @IsString()
  @IsNotEmpty()
  vaccineName!: string;

  @ApiPropertyOptional({ description: 'Dose sequence number (e.g. 1, 2, Booster)', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  doseNumber?: number = 1;

  @ApiProperty({ description: 'Date of administration (ISO string)', example: '2026-07-20' })
  @IsDateString()
  @IsNotEmpty()
  administeredDate!: string;

  @ApiPropertyOptional({ description: 'The doctor ID administering the vaccine' })
  @IsUUID()
  @IsOptional()
  administeredByDoctorId?: string;

  @ApiPropertyOptional({ description: 'The facility name where vaccine was administered', example: 'AyuNet Hyderabad Branch' })
  @IsString()
  @IsOptional()
  administeredAtFacility?: string;

  @ApiPropertyOptional({ description: 'Vaccine batch lot number', example: 'BCH-88990' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Vaccine expiry date (ISO string)', example: '2028-12-31' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}
