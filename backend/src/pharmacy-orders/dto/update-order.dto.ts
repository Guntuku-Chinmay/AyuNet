import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePharmacyOrderDto {
  @ApiPropertyOptional({ description: 'Delivery destination primary street address' })
  @IsString()
  @IsOptional()
  deliveryAddressLine1?: string;

  @ApiPropertyOptional({ description: 'Delivery destination secondary details' })
  @IsString()
  @IsOptional()
  deliveryAddressLine2?: string;

  @ApiPropertyOptional({ description: 'Delivery destination city' })
  @IsString()
  @IsOptional()
  deliveryCity?: string;

  @ApiPropertyOptional({ description: 'Delivery destination state' })
  @IsString()
  @IsOptional()
  deliveryState?: string;

  @ApiPropertyOptional({ description: 'Delivery destination postal code' })
  @IsString()
  @IsOptional()
  deliveryPostalCode?: string;

  @ApiPropertyOptional({ description: 'Delivery destination country' })
  @IsString()
  @IsOptional()
  deliveryCountry?: string;
}
