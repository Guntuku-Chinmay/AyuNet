import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveSearchDto {
  @ApiProperty({ description: 'Name to identify saved search query', example: 'Cardiology Patients' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The search query string', example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiPropertyOptional({ description: 'Saved search filter parameters metadata' })
  @IsObject()
  @IsOptional()
  filters?: any;
}
