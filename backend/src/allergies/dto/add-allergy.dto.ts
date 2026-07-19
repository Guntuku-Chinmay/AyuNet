import { IsUUID, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AllergyType, AllergySeverity, AllergyStatus } from '@prisma/client';

export class AddAllergyDto {
  @ApiProperty({ description: 'The patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ description: 'The offending allergen substance', example: 'Penicillin' })
  @IsString()
  @IsNotEmpty()
  allergen!: string;

  @ApiProperty({ description: 'Allergy classification type', enum: AllergyType, example: AllergyType.DRUG })
  @IsEnum(AllergyType)
  @IsNotEmpty()
  allergyType!: AllergyType;

  @ApiProperty({ description: 'Reaction severity classification', enum: AllergySeverity, example: AllergySeverity.SEVERE })
  @IsEnum(AllergySeverity)
  @IsNotEmpty()
  severity!: AllergySeverity;

  @ApiPropertyOptional({ description: 'Symptomatic reaction details', example: 'Anaphylactic shock' })
  @IsString()
  @IsOptional()
  reaction?: string;

  @ApiPropertyOptional({ description: 'Allergy active status', enum: AllergyStatus, example: AllergyStatus.ACTIVE })
  @IsEnum(AllergyStatus)
  @IsOptional()
  status?: AllergyStatus = AllergyStatus.ACTIVE;
}
