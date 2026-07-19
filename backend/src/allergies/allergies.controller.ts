import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AllergiesService } from './allergies.service';
import { AddAllergyDto } from './dto/add-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@ApiTags('allergies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new patient allergy record' })
  @ApiResponse({ status: 201, description: 'Allergy recorded successfully.' })
  create(
    @Body() dto: AddAllergyDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.allergiesService.create(dto, user.id, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update allergy details' })
  @ApiResponse({ status: 200, description: 'Allergy updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAllergyDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.allergiesService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove allergy record' })
  @ApiResponse({ status: 200, description: 'Allergy removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.allergiesService.remove(id, user.id, ip, ua);
  }
}
