import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SpecializationsService } from './specializations.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

@ApiTags('specializations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('specializations')
export class SpecializationsController {
  constructor(private readonly specializationsService: SpecializationsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Create a new medical specialization' })
  @ApiResponse({ status: 201, description: 'The specialization has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Conflict: duplicate name.' })
  create(
    @Body() createSpecializationDto: CreateSpecializationDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.specializationsService.create(createSpecializationDto, user.id, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: 'List all active specializations' })
  @ApiResponse({ status: 200, description: 'Return all active specializations.' })
  findAll() {
    return this.specializationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specialization' })
  @ApiResponse({ status: 200, description: 'Return specialization details.' })
  @ApiResponse({ status: 404, description: 'Specialization not found.' })
  findOne(@Param('id') id: string) {
    return this.specializationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update a specialization' })
  @ApiResponse({ status: 200, description: 'The specialization has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Specialization not found.' })
  update(
    @Param('id') id: string,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.specializationsService.update(id, updateSpecializationDto, user.id, ipAddress, userAgent);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Soft delete a specialization' })
  @ApiResponse({ status: 200, description: 'The specialization has been successfully soft-deleted.' })
  @ApiResponse({ status: 404, description: 'Specialization not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.specializationsService.remove(id, user.id, ipAddress, userAgent);
  }
}
