import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferenceDto {
  @ApiProperty({ description: 'Notification category group', example: 'APPOINTMENTS' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ description: 'Enable/Disable email channel alerts' })
  @IsBoolean()
  @IsNotEmpty()
  emailEnabled!: boolean;

  @ApiProperty({ description: 'Enable/Disable SMS channel alerts' })
  @IsBoolean()
  @IsNotEmpty()
  smsEnabled!: boolean;

  @ApiProperty({ description: 'Enable/Disable Push channel alerts' })
  @IsBoolean()
  @IsNotEmpty()
  pushEnabled!: boolean;

  @ApiProperty({ description: 'Enable/Disable In-App channel alerts' })
  @IsBoolean()
  @IsNotEmpty()
  inAppEnabled!: boolean;
}
