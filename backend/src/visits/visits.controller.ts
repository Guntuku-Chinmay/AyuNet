import { Controller, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VisitsService } from './visits.service';
import { VisitStatus } from '@prisma/client';

@ApiTags('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get()
  @ApiOperation({ summary: 'List all visits with filters' })
  @ApiResponse({ status: 200, description: 'Return visits list.' })
  findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: VisitStatus
  ) {
    return this.visitsService.findAll({ patientId, doctorId, visitStatus: status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a visit' })
  @ApiResponse({ status: 200, description: 'Return visit details.' })
  @ApiResponse({ status: 404, description: 'Visit not found.' })
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update visit check-out or status' })
  @ApiResponse({ status: 200, description: 'Visit updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: { checkOutAt?: Date; visitStatus?: VisitStatus },
    @CurrentUser() user: any
  ) {
    return this.visitsService.update(id, dto, user.id);
  }
}
