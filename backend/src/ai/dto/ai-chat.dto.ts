import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiChatDto {
  @ApiProperty({ description: 'User input prompt or message for the AI assistant', example: 'What should I keep in mind before taking paracetamol?' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: 'Optional conversation session ID for context retention' })
  @IsString()
  @IsOptional()
  conversationId?: string;

  @ApiPropertyOptional({ description: 'LLM provider override', default: 'openai' })
  @IsString()
  @IsOptional()
  provider?: string = 'openai';
}
