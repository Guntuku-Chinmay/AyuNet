import { IsUUID, IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddPrescriptionItemDto {
  @ApiProperty({ description: 'The medicine ID from catalog' })
  @IsUUID()
  @IsNotEmpty()
  medicineId!: string;

  @ApiProperty({ description: 'Dosage instructions (e.g. 500mg, 1 tablet)', example: '1 tablet' })
  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @ApiProperty({ description: 'Dosage frequency (e.g. Once daily, Twice daily, PRN)', example: 'Twice daily' })
  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @ApiProperty({ description: 'Duration of therapy in days', example: 7 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  durationDays!: number;

  @ApiProperty({ description: 'Total quantity prescribed', example: 14 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;

  @ApiPropertyOptional({ description: 'Special administration instructions', example: 'Take after meals' })
  @IsString()
  @IsOptional()
  instructions?: string;
}
