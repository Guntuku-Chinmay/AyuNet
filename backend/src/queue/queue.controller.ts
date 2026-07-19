import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueueService } from './queue.service';

@ApiTags('queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  @ApiOperation({ summary: 'View daily active waiting queue' })
  @ApiResponse({ status: 200, description: 'Return current queue list.' })
  findQueue(
    @Query('doctorId') doctorId?: string,
    @Query('branchId') branchId?: string
  ) {
    return this.queueService.getDailyQueue(doctorId, undefined, branchId);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'View daily queue for a specific doctor' })
  findDoctorQueue(@Param('doctorId') doctorId: string) {
    return this.queueService.getDailyQueue(doctorId);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'View daily queue for a specific department' })
  findDepartmentQueue(@Param('departmentId') departmentId: string) {
    return this.queueService.getDailyQueue(undefined, departmentId);
  }

  @Post(':visitId/priority')
  @ApiOperation({ summary: 'Set priority level for a visit in queue' })
  setPriority(
    @Param('visitId') visitId: string,
    @Body('priority') priority: 'REGULAR' | 'VIP' | 'EMERGENCY',
    @CurrentUser() user: any
  ) {
    return this.queueService.setPriority(visitId, priority, user.id);
  }

  @Post(':visitId/skip')
  @ApiOperation({ summary: 'Skip patient in waiting queue' })
  skipPatient(
    @Param('visitId') visitId: string,
    @CurrentUser() user: any
  ) {
    return this.queueService.skipPatient(visitId, user.id);
  }

  @Post(':visitId/recall')
  @ApiOperation({ summary: 'Recall patient to active check-in consult queue' })
  recallPatient(
    @Param('visitId') visitId: string,
    @CurrentUser() user: any
  ) {
    return this.queueService.recallPatient(visitId, user.id);
  }
}
