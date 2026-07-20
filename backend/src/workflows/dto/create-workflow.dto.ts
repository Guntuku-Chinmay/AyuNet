import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow template name', example: 'Appointment Reminder Workflow' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Domain trigger event', example: 'AppointmentCreated' })
  @IsString()
  @IsNotEmpty()
  triggerEvent!: string;

  @ApiProperty({ description: 'Workflow actions sequence', example: [{ type: 'SEND_SMS', delayMinutes: 60 }] })
  @IsArray()
  @IsNotEmpty()
  actions!: any[];

  @ApiPropertyOptional({ description: 'Workflow active status flag', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
