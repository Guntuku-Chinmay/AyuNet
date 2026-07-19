import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecializationDto {
  @ApiProperty({ description: 'The name of the specialization', example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'A short description of the specialization', example: 'Treatment of diseases related to the cardiovascular system' })
  @IsString()
  @IsOptional()
  description?: string;
}
