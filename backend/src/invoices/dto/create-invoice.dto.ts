import { IsUUID, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayerType } from '@prisma/client';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Description of the service rendered', example: 'Consultation fee' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Amount charged for this service item', example: 500.00 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'The service type category', example: 'CONSULTATION' })
  @IsString()
  @IsNotEmpty()
  type!: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'Payer party classification classification', enum: PayerType, example: PayerType.PATIENT })
  @IsEnum(PayerType)
  payerType!: PayerType;

  @ApiProperty({ description: 'The payment due date' })
  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiPropertyOptional({ description: 'The associated appointment ID' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'The associated pharmacy order ID' })
  @IsUUID()
  @IsOptional()
  pharmacyOrderId?: string;

  @ApiPropertyOptional({ description: 'The associated laboratory order ID' })
  @IsUUID()
  @IsOptional()
  labOrderId?: string;

  @ApiProperty({ description: 'Calculated subtotal amount', example: 1000.00 })
  @IsNumber()
  subtotal!: number;

  @ApiProperty({ description: 'Tax charges applied', example: 180.00 })
  @IsNumber()
  tax!: number;

  @ApiProperty({ description: 'Discounts applied', example: 50.00 })
  @IsNumber()
  discount!: number;

  @ApiProperty({ description: 'Total gross payable amount', example: 1130.00 })
  @IsNumber()
  total!: number;

  @ApiProperty({ description: 'Line items detail list', type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}
