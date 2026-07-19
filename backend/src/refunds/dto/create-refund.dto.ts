import { IsUUID, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({ description: 'The payment transaction ID to refund' })
  @IsUUID()
  @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({ description: 'Amount to refund', example: 500.00 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Reason for refund request', example: 'Consultation cancelled by doctor' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
