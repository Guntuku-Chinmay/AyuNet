import { IsUUID, IsArray, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLabOrderDto {
  @ApiPropertyOptional({ description: 'The assigned Diagnostic Center ID' })
  @IsUUID()
  @IsOptional()
  diagnosticCenterId?: string;

  @ApiPropertyOptional({ description: 'List of Lab Test IDs to be performed', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  testIds?: string[];
}
