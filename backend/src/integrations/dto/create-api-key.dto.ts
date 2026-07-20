import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Key description or partner name', example: 'Apollo Lab Integration' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Permission scopes granted to the API Key', example: ['read:patients', 'write:appointments'] })
  @IsArray()
  @IsNotEmpty()
  scopes!: string[];

  @ApiPropertyOptional({ description: 'Key validity duration in days', default: 365 })
  @IsNumber()
  @IsOptional()
  expiresInDays?: number = 365;
}
