import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PharmaciesService } from './pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@ApiTags('pharmacies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new pharmacy branch' })
  @ApiResponse({ status: 201, description: 'Pharmacy registered successfully.' })
  create(
    @Body() dto: CreatePharmacyDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.pharmaciesService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list all active pharmacy branches' })
  @ApiQuery({ name: 'query', required: false, description: 'Keyword to search name or license number' })
  findAll(@Query('query') query?: string) {
    return this.pharmaciesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a pharmacy branch' })
  findOne(@Param('id') id: string) {
    return this.pharmaciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modify pharmacy details or toggle status' })
  @ApiResponse({ status: 200, description: 'Pharmacy updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePharmacyDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.pharmaciesService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a pharmacy branch record' })
  @ApiResponse({ status: 200, description: 'Pharmacy deleted successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.pharmaciesService.remove(id, user.id, ip, ua);
  }
}
