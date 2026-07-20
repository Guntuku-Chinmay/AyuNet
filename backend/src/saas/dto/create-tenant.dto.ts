import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'SaaS Tenant organisation name', example: 'Apollo Hospitals Group' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Tenant subdomain or primary vanity URL', example: 'apollo' })
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @ApiProperty({ description: 'Initial subscription plan (FREE, STARTER, PROFESSIONAL, ENTERPRISE)', example: 'PROFESSIONAL' })
  @IsString()
  @IsNotEmpty()
  plan!: string;

  @ApiProperty({ description: 'Tenant administrator contact email address', example: 'admin@apollo.org' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail!: string;
}
