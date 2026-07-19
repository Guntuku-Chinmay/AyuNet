import { IsString, IsInt, Min, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVaccinationDto {
  @ApiPropertyOptional({ description: 'Vaccine name' })
  @IsString()
  @IsOptional()
  vaccineName?: string;

  @ApiPropertyOptional({ description: 'Dose sequence number' })
  @IsInt()
  @Min(1)
  @IsOptional()
  doseNumber?: number;

  @ApiPropertyOptional({ description: 'Date of administration (ISO string)' })
  @IsDateString()
  @IsOptional()
  administeredDate?: string;

  @ApiPropertyOptional({ description: 'The doctor ID administering the vaccine' })
  @IsUUID()
  @IsOptional()
  administeredByDoctorId?: string;

  @ApiPropertyOptional({ description: 'The facility name where vaccine was administered' })
  @IsString()
  @IsOptional()
  administeredAtFacility?: string;

  @ApiPropertyOptional({ description: 'Vaccine batch lot number' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Vaccine expiry date (ISO string)' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}
