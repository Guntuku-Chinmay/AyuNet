import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LabReportsService } from './lab-reports.service';
import { UploadLabReportDto } from './dto/upload-report.dto';
import { UpdateLabReportDto } from './dto/update-report.dto';

@ApiTags('lab-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lab-reports')
export class LabReportsController {
  constructor(private readonly reportsService: LabReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a laboratory findings report' })
  @ApiResponse({ status: 201, description: 'Report uploaded successfully.' })
  create(
    @Body() dto: UploadLabReportDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.reportsService.create(dto, user.id, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report draft summary findings' })
  @ApiResponse({ status: 200, description: 'Report updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLabReportDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.reportsService.update(id, dto, user.id, ip, ua);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve report details and findings' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.reportsService.findOne(id, user);
  }
}
