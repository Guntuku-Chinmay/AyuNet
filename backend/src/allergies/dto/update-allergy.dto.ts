import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AllergyType, AllergySeverity, AllergyStatus } from '@prisma/client';

export class UpdateAllergyDto {
  @ApiPropertyOptional({ description: 'The offending allergen substance' })
  @IsString()
  @IsOptional()
  allergen?: string;

  @ApiPropertyOptional({ description: 'Allergy classification type', enum: AllergyType })
  @IsEnum(AllergyType)
  @IsOptional()
  allergyType?: AllergyType;

  @ApiPropertyOptional({ description: 'Reaction severity classification', enum: AllergySeverity })
  @IsEnum(AllergySeverity)
  @IsOptional()
  severity?: AllergySeverity;

  @ApiPropertyOptional({ description: 'Symptomatic reaction details' })
  @IsString()
  @IsOptional()
  reaction?: string;

  @ApiPropertyOptional({ description: 'Allergy active status', enum: AllergyStatus })
  @IsEnum(AllergyStatus)
  @IsOptional()
  status?: AllergyStatus;
}
