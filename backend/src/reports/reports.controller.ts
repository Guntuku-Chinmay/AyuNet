import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { CreateScheduledReportDto } from './dto/create-scheduled-report.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate a customized reporting export' })
  @ApiResponse({ status: 201, description: 'Report generated.' })
  generate(
    @Body() dto: GenerateReportDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.reportsService.generate(dto, user.id, ip, ua);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List all generated reports' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get generated report details' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get('reports/:id/download')
  @ApiOperation({ summary: 'Download generated report file representation' })
  download(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.reportsService.download(id, user.id, ip, ua);
  }

  @Get('dashboards/admin')
  @ApiOperation({ summary: 'Get Hospital Administrator executive dashboard metrics' })
  getAdminDashboard() {
    return this.reportsService.getAdminDashboard();
  }

  @Get('dashboards/doctor')
  @ApiOperation({ summary: 'Get Doctor clinical performance metrics' })
  getDoctorDashboard(@CurrentUser() user: any) {
    return this.reportsService.getDoctorDashboard(user.id);
  }

  @Get('dashboards/finance')
  @ApiOperation({ summary: 'Get Finance revenue and collections dashboard' })
  getFinanceDashboard() {
    return this.reportsService.getFinanceDashboard();
  }

  @Get('dashboards/pharmacy')
  @ApiOperation({ summary: 'Get Pharmacy dispensing fulfillment metrics' })
  getPharmacyDashboard() {
    return this.reportsService.getPharmacyDashboard();
  }

  @Get('dashboards/laboratory')
  @ApiOperation({ summary: 'Get Laboratory volume & turnaround metrics' })
  getLaboratoryDashboard() {
    return this.reportsService.getLaboratoryDashboard();
  }

  @Get('analytics/kpis')
  @ApiOperation({ summary: 'Get key performance indicators (KPIs)' })
  getKPIs() {
    return this.reportsService.getKPIs();
  }

  @Get('analytics/trends')
  @ApiOperation({ summary: 'Get multi-metric operational trend line data' })
  getTrends() {
    return this.reportsService.getTrends();
  }

  @Post('scheduled-reports')
  @ApiOperation({ summary: 'Setup recurring scheduled report entry' })
  createScheduledReport(
    @Body() dto: CreateScheduledReportDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.reportsService.createScheduledReport(dto, user.id, ip, ua);
  }

  @Get('scheduled-reports')
  @ApiOperation({ summary: 'List scheduled reports' })
  getScheduledReports() {
    return this.reportsService.getScheduledReports();
  }

  @Patch('scheduled-reports/:id')
  @ApiOperation({ summary: 'Update scheduled report configuration' })
  updateScheduledReport(
    @Param('id') id: string,
    @Body() dto: Partial<CreateScheduledReportDto>,
    @CurrentUser() user: any
  ) {
    return this.reportsService.updateScheduledReport(id, dto, user.id);
  }

  @Delete('scheduled-reports/:id')
  @ApiOperation({ summary: 'Delete scheduled report configuration' })
  deleteScheduledReport(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.reportsService.deleteScheduledReport(id, user.id);
  }
}
