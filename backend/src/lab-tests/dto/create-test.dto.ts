import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty({ description: 'Unique test code (e.g. CBC, LFT, KFT)', example: 'CBC' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Full description name of the test', example: 'Complete Blood Count' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Details about the lab test' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The biological specimen type required', example: 'Whole Blood' })
  @IsString()
  @IsNotEmpty()
  sampleType!: string;
}
