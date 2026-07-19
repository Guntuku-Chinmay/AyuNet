import { IsUUID, IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PharmacyOrderItemDto {
  @ApiProperty({ description: 'The medicine ID to be fulfilled' })
  @IsUUID()
  @IsNotEmpty()
  medicineId!: string;

  @ApiProperty({ description: 'Quantity requested', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Agreed unit price for fulfillment', example: 12.50 })
  @IsNumber()
  unitPrice!: number;
}

export class CreatePharmacyOrderDto {
  @ApiPropertyOptional({ description: 'The associated signed prescription record ID' })
  @IsUUID()
  @IsOptional()
  prescriptionId?: string;

  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'The target pharmacy branch ID' })
  @IsUUID()
  @IsNotEmpty()
  pharmacyId!: string;

  @ApiProperty({ description: 'Delivery destination primary street address' })
  @IsString()
  @IsNotEmpty()
  deliveryAddressLine1!: string;

  @ApiPropertyOptional({ description: 'Delivery destination secondary details' })
  @IsString()
  @IsOptional()
  deliveryAddressLine2?: string;

  @ApiProperty({ description: 'Delivery destination city' })
  @IsString()
  @IsNotEmpty()
  deliveryCity!: string;

  @ApiProperty({ description: 'Delivery destination state/province' })
  @IsString()
  @IsNotEmpty()
  deliveryState!: string;

  @ApiProperty({ description: 'Delivery destination postal code' })
  @IsString()
  @IsNotEmpty()
  deliveryPostalCode!: string;

  @ApiProperty({ description: 'Delivery destination country' })
  @IsString()
  @IsNotEmpty()
  deliveryCountry!: string;

  @ApiProperty({ description: 'List of order items', type: [PharmacyOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PharmacyOrderItemDto)
  items!: PharmacyOrderItemDto[];
}
