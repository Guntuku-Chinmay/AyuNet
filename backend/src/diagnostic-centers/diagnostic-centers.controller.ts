import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DiagnosticCentersService } from './diagnostic-centers.service';
import { CreateDiagnosticCenterDto } from './dto/create-center.dto';
import { UpdateDiagnosticCenterDto } from './dto/update-center.dto';

@ApiTags('diagnostic-centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('diagnostic-centers')
export class DiagnosticCentersController {
  constructor(private readonly centersService: DiagnosticCentersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new diagnostic center branch' })
  @ApiResponse({ status: 201, description: 'Center registered successfully.' })
  create(
    @Body() dto: CreateDiagnosticCenterDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.centersService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered active diagnostic centers' })
  findAll() {
    return this.centersService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modify diagnostic center details or toggle status' })
  @ApiResponse({ status: 200, description: 'Center updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosticCenterDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.centersService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'De-register/soft-delete a diagnostic center branch' })
  @ApiResponse({ status: 200, description: 'Center deleted successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.centersService.remove(id, user.id, ip, ua);
  }
}
