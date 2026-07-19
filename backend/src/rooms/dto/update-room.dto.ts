import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, RoomStatus } from '@prisma/client';

export class UpdateRoomDto {
  @ApiPropertyOptional({ description: 'The department ID where the room belongs' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'The room number/code' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'The type of room', enum: RoomType })
  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @ApiPropertyOptional({ description: 'The current status of the room', enum: RoomStatus })
  @IsEnum(RoomStatus)
  @IsOptional()
  roomStatus?: RoomStatus;
}
