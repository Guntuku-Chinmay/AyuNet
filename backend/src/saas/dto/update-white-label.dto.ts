import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWhiteLabelDto {
  @ApiPropertyOptional({ description: 'Custom tenant domain name', example: 'portal.apollohospitals.com' })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiPropertyOptional({ description: 'Branded logo asset URL' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Primary branding theme hex color', example: '#0052CC' })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Accent branding theme hex color', example: '#FFAB00' })
  @IsString()
  @IsOptional()
  accentColor?: string;
}
