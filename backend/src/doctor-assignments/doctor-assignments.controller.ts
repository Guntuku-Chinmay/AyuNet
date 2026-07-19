import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DoctorAssignmentsService } from './doctor-assignments.service';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { TransferDoctorDto } from './dto/transfer-doctor.dto';

@ApiTags('doctor-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctor-hospitals')
export class DoctorAssignmentsController {
  constructor(private readonly assignmentsService: DoctorAssignmentsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Assign a doctor to a hospital branch' })
  @ApiResponse({ status: 201, description: 'The doctor has been assigned successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin scope violations.' })
  @ApiResponse({ status: 409, description: 'Conflict: Doctor already assigned to this branch.' })
  create(
    @Body() assignDoctorDto: AssignDoctorDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.assignmentsService.assignDoctor(assignDoctorDto, user, ipAddress, userAgent);
  }

  @Post('transfer')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Transfer a doctor from one branch to another' })
  @ApiResponse({ status: 201, description: 'The doctor has been transferred successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin scope violations.' })
  @ApiResponse({ status: 404, description: 'Doctor or branch not found.' })
  transfer(
    @Body() transferDoctorDto: TransferDoctorDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.assignmentsService.transferDoctor(transferDoctorDto, user, ipAddress, userAgent);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List all doctor assignments' })
  @ApiQuery({ name: 'branchId', type: String, required: false, description: 'Filter assignments by branch ID' })
  @ApiResponse({ status: 200, description: 'Return all doctor assignments.' })
  findAll(
    @Query('branchId') branchId: string | undefined,
    @CurrentUser() user: any
  ) {
    return this.assignmentsService.findAll(branchId, user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Remove a doctor assignment' })
  @ApiResponse({ status: 200, description: 'The doctor assignment has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Doctor assignment not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.assignmentsService.removeAssignment(id, user, ipAddress, userAgent);
  }
}
