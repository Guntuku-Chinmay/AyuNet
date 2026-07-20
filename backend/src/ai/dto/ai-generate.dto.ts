import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiGenerateDto {
  @ApiProperty({ description: 'Primary instruction prompt for content generation' })
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @ApiProperty({ description: 'Document generation template target (CLINICAL_NOTE, REFERRAL_LETTER, DISCHARGE_SUMMARY)', example: 'CLINICAL_NOTE' })
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiPropertyOptional({ description: 'Optional template parameter placeholders' })
  @IsObject()
  @IsOptional()
  parameters?: any;

  @ApiPropertyOptional({ description: 'LLM provider override', default: 'openai' })
  @IsString()
  @IsOptional()
  provider?: string = 'openai';
}
