import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Create a new room in a department' })
  @ApiResponse({ status: 201, description: 'The room has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Active dependencies block.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin scope violations.' })
  @ApiResponse({ status: 409, description: 'Conflict: duplicate room number in department.' })
  create(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.roomsService.create(createRoomDto, user, ipAddress, userAgent);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List all active rooms in a department' })
  @ApiQuery({ name: 'departmentId', type: String, required: true, description: 'The department ID to filter by' })
  @ApiResponse({ status: 200, description: 'Return rooms for the department.' })
  findAll(
    @Query('departmentId') departmentId: string,
    @CurrentUser() user: any
  ) {
    return this.roomsService.findAll(departmentId, user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get details of a room, including occupancy stats' })
  @ApiResponse({ status: 200, description: 'Return room details.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.roomsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'The room has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.roomsService.update(id, updateRoomDto, user, ipAddress, userAgent);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Soft delete a room' })
  @ApiResponse({ status: 200, description: 'The room has been successfully soft-deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Active beds dependency blocks deletion.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.roomsService.remove(id, user, ipAddress, userAgent);
  }
}
