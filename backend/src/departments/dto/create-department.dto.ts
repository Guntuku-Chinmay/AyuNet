import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'The branch ID where the department belongs', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ description: 'The name of the department', example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'A short description of the department', example: 'Cardiology wing dealing with heart conditions' })
  @IsString()
  @IsOptional()
  description?: string;
}
