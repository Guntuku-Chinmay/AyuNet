import { IsUUID, IsNotEmpty, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDoctorDto {
  @ApiProperty({ description: 'The doctor ID to transfer', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({ description: 'The source branch ID to transfer from', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  fromBranchId!: string;

  @ApiProperty({ description: 'The target branch ID to transfer to', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  toBranchId!: string;

  @ApiPropertyOptional({ description: 'Whether this new branch is the primary location for the doctor', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'List of department IDs in the target branch to associate the doctor with', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  departmentIds?: string[];
}
