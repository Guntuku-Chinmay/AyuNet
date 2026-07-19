import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineForm } from '@prisma/client';

export class CreateMedicineDto {
  @ApiProperty({ description: 'The commercial brand name of the drug', example: 'Panadol' })
  @IsString()
  @IsNotEmpty()
  brandName!: string;

  @ApiProperty({ description: 'The active pharmaceutical ingredient generic name', example: 'Paracetamol' })
  @IsString()
  @IsNotEmpty()
  genericName!: string;

  @ApiProperty({ description: 'The physical dosage form of the drug', enum: MedicineForm, example: MedicineForm.TABLET })
  @IsEnum(MedicineForm)
  @IsNotEmpty()
  form!: MedicineForm;

  @ApiProperty({ description: 'Strength dosage description (e.g. 500mg, 10ml)', example: '500mg' })
  @IsString()
  @IsNotEmpty()
  strength!: string;

  @ApiPropertyOptional({ description: 'Manufacturing company name' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Special descriptions or warnings' })
  @IsString()
  @IsOptional()
  description?: string;
}
