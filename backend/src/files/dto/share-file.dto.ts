import { IsUUID, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShareFileDto {
  @ApiProperty({ description: 'User ID to share file access with' })
  @IsUUID()
  @IsNotEmpty()
  sharedWithUserId!: string;

  @ApiPropertyOptional({ description: 'Link validity duration in minutes', default: 60 })
  @IsNumber()
  @IsOptional()
  expiresInMinutes?: number = 60;
}
