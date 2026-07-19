import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BedStatus } from '@prisma/client';

export class UpdateBedDto {
  @ApiPropertyOptional({ description: 'The room ID where the bed is located' })
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({ description: 'The bed number/code' })
  @IsString()
  @IsOptional()
  bedNumber?: string;

  @ApiPropertyOptional({ description: 'The current status of the bed', enum: BedStatus })
  @IsEnum(BedStatus)
  @IsOptional()
  status?: BedStatus;
}
