import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PatientsService } from './patients.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'The patient has been registered successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict: email or identifiers already registered.' })
  register(
    @Body() registerPatientDto: RegisterPatientDto,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.patientsService.register(registerPatientDto, undefined, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: 'Search and query patients (paginated)' })
  @ApiResponse({ status: 200, description: 'Return paginated, filtered patients list.' })
  findAll(
    @Query() query: PatientQueryDto,
    @CurrentUser() user: any
  ) {
    return this.patientsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a patient' })
  @ApiResponse({ status: 200, description: 'Return patient details.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.patientsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient details' })
  @ApiResponse({ status: 200, description: 'The patient has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.patientsService.update(id, updatePatientDto, user, ipAddress, userAgent);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a patient' })
  @ApiResponse({ status: 200, description: 'The patient has been successfully soft-deleted.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.patientsService.remove(id, user, ipAddress, userAgent);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted patient' })
  @ApiResponse({ status: 200, description: 'The patient has been restored successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  restore(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.patientsService.restore(id, user, ipAddress, userAgent);
  }

  @Post(':id/merge')
  @ApiOperation({ summary: 'Merge duplicate patient record into target patient' })
  @ApiResponse({ status: 200, description: 'Record merged successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  merge(
    @Param('id') id: string,
    @Body('targetPatientId') targetPatientId: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.patientsService.mergePatients(id, targetPatientId, user, ipAddress, userAgent);
  }
}
