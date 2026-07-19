import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VaccinationsService } from './vaccinations.service';
import { RecordVaccinationDto } from './dto/record-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';

@ApiTags('vaccinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vaccinations')
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a patient vaccination event' })
  @ApiResponse({ status: 201, description: 'Vaccination recorded successfully.' })
  create(
    @Body() dto: RecordVaccinationDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.vaccinationsService.create(dto, user.id, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vaccination details' })
  @ApiResponse({ status: 200, description: 'Vaccination updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVaccinationDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.vaccinationsService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove vaccination record' })
  @ApiResponse({ status: 200, description: 'Vaccination removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.vaccinationsService.remove(id, user.id, ip, ua);
  }
}
