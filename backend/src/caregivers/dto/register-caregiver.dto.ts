import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCaregiverDto {
  @ApiProperty({ description: 'The caregiver user email', example: 'caregiver@ayunet.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'The password', example: 'CaregiverPassword123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: 'The phone number', example: '+919876543219' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'First name', example: 'Mark' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ description: 'Professional license number (if professional)', example: 'CG-LIC-9988' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Is the caregiver professional', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isProfessional?: boolean;

  @ApiPropertyOptional({ description: 'Medical caregiver specialty (e.g. Geriatric Care)', example: 'Geriatric' })
  @IsString()
  @IsOptional()
  specialty?: string;
}
