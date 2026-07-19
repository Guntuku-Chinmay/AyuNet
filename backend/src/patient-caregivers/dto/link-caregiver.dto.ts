import { IsUUID, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkCaregiverDto {
  @ApiProperty({ description: 'The caregiver ID to link', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  caregiverId!: string;

  @ApiProperty({ description: 'The relationship type', example: 'Spouse' })
  @IsString()
  @IsNotEmpty()
  relationshipType!: string;

  @ApiProperty({ description: 'The access authorization level (e.g. FULL, READ_ONLY, EMERGENCY_ONLY)', example: 'FULL' })
  @IsString()
  @IsNotEmpty()
  accessLevel!: string;
}
