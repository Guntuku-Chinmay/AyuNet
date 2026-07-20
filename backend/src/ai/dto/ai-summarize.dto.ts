import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiSummarizeDto {
  @ApiProperty({ description: 'Text content or transcript to summarize' })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({ description: 'Summary domain category (EMR, VISIT, CONSULTATION, DISCHARGE)', example: 'EMR' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ description: 'LLM provider override', default: 'openai' })
  @IsString()
  @IsOptional()
  provider?: string = 'openai';
}
