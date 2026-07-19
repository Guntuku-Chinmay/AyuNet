import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-record.dto';
import { AddendumDto } from './dto/addendum.dto';

@ApiTags('medical-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new clinical EMR record' })
  @ApiResponse({ status: 201, description: 'EMR created successfully.' })
  create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List medical records for patient or caregiver context' })
  findAll(@CurrentUser() user: any) {
    return this.medicalRecordsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View a medical record (supports emergency Break-the-Glass access)' })
  @ApiQuery({ name: 'breakTheGlassReason', required: false, description: 'Mandatory justification reason for emergency bypass' })
  findOne(
    @Param('id') id: string,
    @Query('breakTheGlassReason') breakTheGlassReason: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.findOne(id, user, breakTheGlassReason, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft medical record details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.update(id, dto, user.id, ip, ua);
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize draft record, locking direct edits' })
  finalize(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.finalize(id, user.id, ip, ua);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Lock finalized record' })
  lock(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.lock(id, user.id, ip, ua);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive finalized or locked record' })
  archive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.archive(id, user.id, ip, ua);
  }

  @Post(':id/addendum')
  @ApiOperation({ summary: 'Sign and append clinical correction addendum to finalized/locked record' })
  addendum(
    @Param('id') id: string,
    @Body() dto: AddendumDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.medicalRecordsService.addAddendum(id, dto, user.id, ip, ua);
  }
}
