import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ description: 'File name', example: 'chest_xray.png' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ description: 'MIME file type', example: 'image/png' })
  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @ApiProperty({ description: 'File size in bytes', example: 2048500 })
  @IsNumber()
  fileSizeBytes!: number;

  @ApiPropertyOptional({ description: 'Whether file can be publicly accessed', default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ description: 'Linked entity type (Patient, Doctor, LabReport, Invoice, etc.)', example: 'Patient' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Linked entity ID' })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Tags associated with the file' })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
