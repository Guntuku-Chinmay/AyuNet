import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'SaaS Tenant organisation name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Tenant subdomain' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ description: 'Subscription plan' })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiPropertyOptional({ description: 'Tenant active status flag' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
