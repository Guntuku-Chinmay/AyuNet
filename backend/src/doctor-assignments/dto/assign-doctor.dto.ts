import { IsUUID, IsNotEmpty, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignDoctorDto {
  @ApiProperty({ description: 'The doctor ID to assign', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ description: 'The branch ID to assign to', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiPropertyOptional({ description: 'Whether this branch is the primary location for the doctor', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'List of department IDs inside the branch to associate the doctor with', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  departmentIds?: string[];
}
