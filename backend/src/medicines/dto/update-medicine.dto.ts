import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineForm } from '@prisma/client';

export class UpdateMedicineDto {
  @ApiPropertyOptional({ description: 'The commercial brand name of the drug' })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiPropertyOptional({ description: 'The active pharmaceutical ingredient generic name' })
  @IsString()
  @IsOptional()
  genericName?: string;

  @ApiPropertyOptional({ description: 'The physical dosage form of the drug', enum: MedicineForm })
  @IsEnum(MedicineForm)
  @IsOptional()
  form?: MedicineForm;

  @ApiPropertyOptional({ description: 'Strength dosage description' })
  @IsString()
  @IsOptional()
  strength?: string;

  @ApiPropertyOptional({ description: 'Manufacturing company name' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Special descriptions or warnings' })
  @IsString()
  @IsOptional()
  description?: string;
}
