import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TimelineService } from './timeline.service';

@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get unified clinical and billing timeline for a patient' })
  @ApiResponse({ status: 200, description: 'Return chronologically sorted timeline list.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  getTimeline(
    @Param('id') patientId: string,
    @CurrentUser() user: any
  ) {
    return this.timelineService.getTimeline(patientId, user);
  }
}
