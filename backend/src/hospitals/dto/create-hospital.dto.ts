import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class CreateHospitalDto {
  @ApiProperty({ description: 'The name of the hospital network', example: 'Apollo Hospitals' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The corporate registration/license number', example: 'HOSP-12345' })
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @ApiProperty({ description: 'The corporate headquarters address' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;
}
