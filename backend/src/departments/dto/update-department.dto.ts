import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: 'The name of the department' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'A short description of the department' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'The doctor ID of the department head', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsOptional()
  headDoctorId?: string;
}
