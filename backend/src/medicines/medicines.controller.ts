import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@ApiTags('medicines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new medicine in the catalog' })
  @ApiResponse({ status: 201, description: 'Medicine cataloged successfully.' })
  create(
    @Body() dto: CreateMedicineDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicinesService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list medicines in AyuNet catalog' })
  @ApiQuery({ name: 'query', required: false, description: 'Keyword to search generic or brand names' })
  findAll(@Query('query') query: string) {
    return this.medicinesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details of a medicine' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modify catalog medicine attributes' })
  @ApiResponse({ status: 200, description: 'Medicine modified successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicineDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicinesService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove medicine from catalog' })
  @ApiResponse({ status: 200, description: 'Medicine removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicinesService.remove(id, user.id, ip, ua);
  }
}
