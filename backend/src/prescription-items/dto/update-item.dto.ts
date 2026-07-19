import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePrescriptionItemDto {
  @ApiPropertyOptional({ description: 'Dosage instructions' })
  @IsString()
  @IsOptional()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Dosage frequency' })
  @IsString()
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional({ description: 'Duration of therapy in days' })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Total quantity prescribed' })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Special administration instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}
