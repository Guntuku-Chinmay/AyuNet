import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({ description: 'Validity duration deadline' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Digital signature code' })
  @IsString()
  @IsOptional()
  digitalSignature?: string;
}
