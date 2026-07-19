import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, RoomStatus } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ description: 'The department ID where the room belongs', example: 'e6bcf120-5d63-4a1d-a3df-795a2d7b5f88' })
  @IsUUID()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({ description: 'The room number/code', example: 'Room-301' })
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @ApiProperty({ description: 'The type of room', enum: RoomType, example: RoomType.ICU })
  @IsEnum(RoomType)
  @IsNotEmpty()
  roomType!: RoomType;

  @ApiPropertyOptional({ description: 'The current status of the room', enum: RoomStatus, example: RoomStatus.ACTIVE })
  @IsEnum(RoomStatus)
  @IsOptional()
  roomStatus?: RoomStatus;
}
