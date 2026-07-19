import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'First line of the address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @ApiPropertyOptional({ description: 'Second line of the address', example: 'Suite 400' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City name', example: 'Hyderabad' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ description: 'State or region', example: 'Telangana' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ description: 'Postal/Zip code', example: '500081' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @ApiProperty({ description: 'Country name', example: 'India' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate', example: 17.4483 })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate', example: 78.3741 })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
