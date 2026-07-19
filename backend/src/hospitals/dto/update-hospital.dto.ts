import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class UpdateHospitalDto {
  @ApiPropertyOptional({ description: 'The name of the hospital network' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'The corporate registration/license number' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'The corporate headquarters address' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsOptional()
  address?: CreateAddressDto;
}
