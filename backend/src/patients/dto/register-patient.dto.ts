import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class RegisterPatientDto {
  @ApiProperty({ description: 'The patient user email', example: 'patient@ayunet.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'The password', example: 'SecurePassword123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: 'The mobile number', example: '+919876543210' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'First name', example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Date of Birth (YYYY-MM-DD)', example: '1995-05-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth!: string;

  @ApiProperty({ description: 'Gender', enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender!: Gender;

  @ApiPropertyOptional({ description: 'Blood group', example: 'O+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ description: 'National Identification Number', example: 'NAT-123456' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Passport Number', example: 'PASS-987654' })
  @IsString()
  @IsOptional()
  passport?: string;

  @ApiPropertyOptional({ description: 'Insurance Provider Member ID', example: 'INS-887766' })
  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @ApiProperty({ description: 'Emergency contact full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  emergencyContactName!: string;

  @ApiProperty({ description: 'Emergency contact phone number', example: '+919988776655' })
  @IsString()
  @IsNotEmpty()
  emergencyContactPhone!: string;

  @ApiProperty({ description: 'Relationship to emergency contact', example: 'Spouse' })
  @IsString()
  @IsNotEmpty()
  emergencyContactRelationship!: string;

  @ApiProperty({ description: 'The physical address details' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;
}
