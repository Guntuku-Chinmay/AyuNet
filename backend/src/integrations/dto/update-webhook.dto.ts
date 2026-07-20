import { IsUrl, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWebhookDto {
  @ApiPropertyOptional({ description: 'Target destination URL' })
  @IsUrl()
  @IsOptional()
  targetUrl?: string;

  @ApiPropertyOptional({ description: 'Subscribed domain events' })
  @IsArray()
  @IsOptional()
  events?: string[];

  @ApiPropertyOptional({ description: 'Active status toggle' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
