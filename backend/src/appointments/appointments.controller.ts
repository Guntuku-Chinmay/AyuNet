import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment requested successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict: slot already booked or overlaps detected.' })
  create(
    @Body() bookAppointmentDto: BookAppointmentDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.bookAppointment(bookAppointmentDto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List all appointments with filters' })
  @ApiResponse({ status: 200, description: 'Return appointments list.' })
  findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: AppointmentStatus
  ) {
    return this.appointmentsService.findAll({ patientId, doctorId, branchId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an appointment' })
  @ApiResponse({ status: 200, description: 'Return appointment details.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm appointment booking' })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.confirm(id, user.id, ip, ua);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment booking' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.cancel(id, user.id, ip, ua);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule appointment' })
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.reschedule(id, dto, user.id, ip, ua);
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Check in patient for the appointment' })
  checkin(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.checkin(id, user.id, ip, ua);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start consultation session' })
  start(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.startConsultation(id, user.id, ip, ua);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete consultation session' })
  complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.complete(id, user.id, ip, ua);
  }

  @Post(':id/no-show')
  @ApiOperation({ summary: 'Mark patient as No Show' })
  noShow(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.noShow(id, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/Delete appointment' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.appointmentsService.cancel(id, user.id, ip, ua);
  }
}
