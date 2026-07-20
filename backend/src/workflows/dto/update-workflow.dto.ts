import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: 'Workflow template name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Domain trigger event' })
  @IsString()
  @IsOptional()
  triggerEvent?: string;

  @ApiPropertyOptional({ description: 'Workflow actions sequence' })
  @IsArray()
  @IsOptional()
  actions?: any[];

  @ApiPropertyOptional({ description: 'Workflow active status flag' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
