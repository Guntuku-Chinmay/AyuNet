import { IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PayerType } from '@prisma/client';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Payer party classification', enum: PayerType })
  @IsEnum(PayerType)
  @IsOptional()
  payerType?: PayerType;

  @ApiPropertyOptional({ description: 'Payment due date' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Calculated subtotal amount' })
  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Tax charges applied' })
  @IsNumber()
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ description: 'Discounts applied' })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Total gross payable amount' })
  @IsNumber()
  @IsOptional()
  total?: number;
}
