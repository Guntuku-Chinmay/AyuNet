import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DiagnosesService } from './diagnoses.service';
import { AddDiagnosisDto } from './dto/add-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@ApiTags('diagnoses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('diagnoses')
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new diagnosis to EMR' })
  @ApiResponse({ status: 201, description: 'Diagnosis added successfully.' })
  create(
    @Body() dto: AddDiagnosisDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.diagnosesService.create(dto, user.id, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update diagnosis details' })
  @ApiResponse({ status: 200, description: 'Diagnosis updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosisDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.diagnosesService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a diagnosis from EMR' })
  @ApiResponse({ status: 200, description: 'Diagnosis removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.diagnosesService.remove(id, user.id, ip, ua);
  }
}
