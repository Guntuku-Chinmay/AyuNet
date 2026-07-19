import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@ApiTags('hospitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new hospital network' })
  @ApiResponse({ status: 201, description: 'The hospital network has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Active dependencies block.' })
  @ApiResponse({ status: 409, description: 'Conflict: duplicate name or license.' })
  create(
    @Body() createHospitalDto: CreateHospitalDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.hospitalsService.create(createHospitalDto, user.id, ipAddress, userAgent);
  }

  @Get()
  @Roles('PLATFORM_ADMIN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')
  @ApiOperation({ summary: 'List all active hospital networks' })
  @ApiResponse({ status: 200, description: 'Return all active hospital networks.' })
  findAll() {
    return this.hospitalsService.findAll();
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Get details of a hospital network' })
  @ApiResponse({ status: 200, description: 'Return the hospital network details.' })
  @ApiResponse({ status: 404, description: 'Hospital network not found.' })
  findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }

  @Patch(':id')
  @Roles('PLATFORM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a hospital network' })
  @ApiResponse({ status: 200, description: 'The hospital network has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Hospital network not found.' })
  update(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.hospitalsService.update(id, updateHospitalDto, user.id, ipAddress, userAgent);
  }

  @Delete(':id')
  @Roles('PLATFORM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Soft delete a hospital network' })
  @ApiResponse({ status: 200, description: 'The hospital network has been successfully soft-deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Active branches dependency blocks deletion.' })
  @ApiResponse({ status: 404, description: 'Hospital network not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.hospitalsService.remove(id, user.id, ipAddress, userAgent);
  }
}
