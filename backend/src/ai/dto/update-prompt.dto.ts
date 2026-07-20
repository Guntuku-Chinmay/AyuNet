import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePromptDto {
  @ApiPropertyOptional({ description: 'System prompt content template text' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Model sampling temperature (0.0 to 1.0)' })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Prompt active status flag' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
