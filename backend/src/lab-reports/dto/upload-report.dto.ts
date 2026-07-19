import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadLabReportDto {
  @ApiProperty({ description: 'The associated lab order ID' })
  @IsUUID()
  @IsNotEmpty()
  labOrderId!: string;

  @ApiProperty({ description: 'Summary findings text', example: 'Hemoglobin: 14.2 g/dL (Normal)' })
  @IsString()
  @IsNotEmpty()
  summaryFindings!: string;

  @ApiPropertyOptional({ description: 'The attachment file ID representing the PDF or image result sheet' })
  @IsUUID()
  @IsOptional()
  attachmentId?: string;
}
