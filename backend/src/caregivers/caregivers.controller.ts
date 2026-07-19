import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CaregiversService } from './caregivers.service';
import { RegisterCaregiverDto } from './dto/register-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';

@ApiTags('caregivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('caregivers')
export class CaregiversController {
  constructor(private readonly caregiversService: CaregiversService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Register a new caregiver' })
  @ApiResponse({ status: 201, description: 'The caregiver has been registered successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict: email already registered.' })
  register(
    @Body() registerCaregiverDto: RegisterCaregiverDto,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.register(registerCaregiverDto, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: 'List all active caregivers' })
  @ApiResponse({ status: 200, description: 'Return list of active caregivers.' })
  findAll() {
    return this.caregiversService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a caregiver' })
  @ApiResponse({ status: 200, description: 'Return caregiver details.' })
  @ApiResponse({ status: 404, description: 'Caregiver not found.' })
  findOne(@Param('id') id: string) {
    return this.caregiversService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update caregiver profile details' })
  @ApiResponse({ status: 200, description: 'The caregiver profile has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Caregiver not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCaregiverDto: UpdateCaregiverDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.update(id, updateCaregiverDto, user.id, ipAddress, userAgent);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a caregiver' })
  @ApiResponse({ status: 200, description: 'The caregiver has been successfully soft-deleted.' })
  @ApiResponse({ status: 404, description: 'Caregiver not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.remove(id, user.id, ipAddress, userAgent);
  }
}
