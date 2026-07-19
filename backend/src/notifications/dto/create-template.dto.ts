import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Unique template name identifier', example: 'WELCOME_MESSAGE' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Template body message content with variables like {{firstName}}', example: 'Hello {{firstName}}, welcome to AyuNet!' })
  @IsString()
  @IsNotEmpty()
  body!: string;
}
