import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'The invoice ID being settled' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId!: string;

  @ApiProperty({ description: 'Amount paid', example: 1130.00 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiProperty({ description: 'The payment gateway name (Razorpay, Stripe, Cash, etc.)', example: 'Stripe' })
  @IsString()
  @IsNotEmpty()
  paymentGateway!: string;

  @ApiProperty({ description: 'External transaction or reference ID from the gateway', example: 'ch_3Mtg5zLkdIwHu7ix1' })
  @IsString()
  @IsNotEmpty()
  gatewayReferenceId!: string;
}
