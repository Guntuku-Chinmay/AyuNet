import { IsNotEmpty, IsString, IsUUID, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiagnosticCenterDto {
  @ApiProperty({ description: 'The name of the diagnostic center', example: 'AyuNet Diagnostics Hyderabad' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unique government license number', example: 'LIC-DG-88992' })
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @ApiProperty({ description: 'The address record ID' })
  @IsUUID()
  @IsNotEmpty()
  addressId!: string;

  @ApiProperty({ description: 'Contact telephone number', example: '+914023456789' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'Official email address', example: 'hyd.lab@ayunet.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
