import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PatientCaregiversService } from './patient-caregivers.service';
import { LinkCaregiverDto } from './dto/link-caregiver.dto';

@ApiTags('patient-caregivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients/:id/caregivers')
export class PatientCaregiversController {
  constructor(private readonly caregiversService: PatientCaregiversService) {}

  @Post()
  @ApiOperation({ summary: 'Link caregiver to patient' })
  @ApiResponse({ status: 201, description: 'Caregiver has been linked, pending approval.' })
  @ApiResponse({ status: 409, description: 'Conflict: caregiver already linked.' })
  create(
    @Param('id') patientId: string,
    @Body() dto: LinkCaregiverDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.linkCaregiver(patientId, dto, user, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: 'List linked caregivers for a patient' })
  @ApiResponse({ status: 200, description: 'Return list of caregivers.' })
  findAll(
    @Param('id') patientId: string,
    @CurrentUser() user: any
  ) {
    return this.caregiversService.getLinkedCaregivers(patientId, user);
  }

  @Patch(':caregiverId/approve')
  @ApiOperation({ summary: 'Approve caregiver delegation request' })
  @ApiResponse({ status: 200, description: 'Delegation approved.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  approve(
    @Param('id') patientId: string,
    @Param('caregiverId') caregiverId: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.approveRequest(patientId, caregiverId, user, ipAddress, userAgent);
  }

  @Patch(':caregiverId/reject')
  @ApiOperation({ summary: 'Reject caregiver delegation request' })
  @ApiResponse({ status: 200, description: 'Delegation rejected and removed.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  reject(
    @Param('id') patientId: string,
    @Param('caregiverId') caregiverId: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.rejectRequest(patientId, caregiverId, user, ipAddress, userAgent);
  }

  @Delete(':caregiverId')
  @ApiOperation({ summary: 'Remove caregiver linkage access' })
  @ApiResponse({ status: 200, description: 'Linkage removed.' })
  @ApiResponse({ status: 404, description: 'Linkage not found.' })
  remove(
    @Param('id') patientId: string,
    @Param('caregiverId') caregiverId: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.caregiversService.removeCaregiver(patientId, caregiverId, user, ipAddress, userAgent);
  }
}
