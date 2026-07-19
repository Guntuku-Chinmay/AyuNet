import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BedStatus } from '@prisma/client';

export class CreateBedDto {
  @ApiProperty({ description: 'The room ID where the bed is located', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({ description: 'The bed number/code', example: 'Bed-A' })
  @IsString()
  @IsNotEmpty()
  bedNumber!: string;

  @ApiPropertyOptional({ description: 'The current status of the bed', enum: BedStatus, example: BedStatus.AVAILABLE })
  @IsEnum(BedStatus)
  @IsOptional()
  status?: BedStatus;
}
