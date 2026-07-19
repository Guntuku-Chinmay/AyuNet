import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePharmacyDto {
  @ApiProperty({ description: 'The name of the pharmacy branch', example: 'AyuNet Pharmacy Hyderabad' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unique government license number', example: 'LIC-PH-99081' })
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @ApiProperty({ description: 'The address record ID' })
  @IsUUID()
  @IsNotEmpty()
  addressId!: string;

  @ApiProperty({ description: 'Contact telephone number', example: '+914098765432' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'Official email address', example: 'hyd.pharmacy@ayunet.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
