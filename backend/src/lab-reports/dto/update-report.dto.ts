import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLabReportDto {
  @ApiPropertyOptional({ description: 'Summary findings text' })
  @IsString()
  @IsOptional()
  summaryFindings?: string;
}
