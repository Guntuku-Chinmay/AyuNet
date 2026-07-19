import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpecializationDto {
  @ApiPropertyOptional({ description: 'The name of the specialization' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'A short description of the specialization' })
  @IsString()
  @IsOptional()
  description?: string;
}
