import { IsString, IsOptional, IsEmail, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class UpdateBranchDto {
  @ApiPropertyOptional({ description: 'The name of the branch' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'The branch license/registration code' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'The branch phone contact' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'The branch email contact' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'The physical address of the branch' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsOptional()
  address?: CreateAddressDto;

  @ApiPropertyOptional({ description: 'Is the branch active', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
