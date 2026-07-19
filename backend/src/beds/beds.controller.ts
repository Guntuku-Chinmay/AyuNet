import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BedsService } from './beds.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';

@ApiTags('beds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('beds')
export class BedsController {
  constructor(private readonly bedsService: BedsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Create a new bed in a room' })
  @ApiResponse({ status: 201, description: 'The bed has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Active dependencies block.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin scope violations.' })
  @ApiResponse({ status: 409, description: 'Conflict: duplicate bed number in room.' })
  create(
    @Body() createBedDto: CreateBedDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.bedsService.create(createBedDto, user, ipAddress, userAgent);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List all active beds in a room' })
  @ApiQuery({ name: 'roomId', type: String, required: true, description: 'The room ID to filter by' })
  @ApiResponse({ status: 200, description: 'Return beds for the room.' })
  findAll(
    @Query('roomId') roomId: string,
    @CurrentUser() user: any
  ) {
    return this.bedsService.findAll(roomId, user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get details of a bed' })
  @ApiResponse({ status: 200, description: 'Return bed details.' })
  @ApiResponse({ status: 404, description: 'Bed not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bedsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Update a bed status or number' })
  @ApiResponse({ status: 200, description: 'The bed has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Bed not found.' })
  update(
    @Param('id') id: string,
    @Body() updateBedDto: UpdateBedDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.bedsService.update(id, updateBedDto, user, ipAddress, userAgent);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Soft delete a bed' })
  @ApiResponse({ status: 200, description: 'The bed has been successfully soft-deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Bed is occupied.' })
  @ApiResponse({ status: 404, description: 'Bed not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.bedsService.remove(id, user, ipAddress, userAgent);
  }
}
