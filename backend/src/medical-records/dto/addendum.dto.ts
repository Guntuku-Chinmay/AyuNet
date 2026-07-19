import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddendumDto {
  @ApiProperty({ description: 'Text content of the addendum correction', example: 'Corrected blood group or follow-up duration' })
  @IsString()
  @IsNotEmpty()
  addendumText!: string;
}
