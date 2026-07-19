import { IsString, IsNotEmpty, IsEmail, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class CreateBranchDto {
  @ApiProperty({ description: 'The parent hospital ID', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  hospitalId!: string;

  @ApiProperty({ description: 'The name of the branch', example: 'Apollo Hyderabad' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The branch license/registration code', example: 'BR-HYD-001' })
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @ApiProperty({ description: 'The branch phone contact', example: '+919988776655' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ description: 'The branch email contact', example: 'hyd@apollo.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'The physical address of the branch' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;
}
