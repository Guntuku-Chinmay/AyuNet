import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully.' })
  create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List prescriptions filtered by role permissions' })
  findAll(@CurrentUser() user: any) {
    return this.prescriptionsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription details including items and status' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft prescription details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.update(id, dto, user.id, ip, ua);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign prescription by doctor' })
  sign(
    @Param('id') id: string,
    @Body('digitalSignature') digitalSignature: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.sign(id, digitalSignature, user.id, ip, ua);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel prescription' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.cancel(id, user.id, ip, ua);
  }

  @Post(':id/expire')
  @ApiOperation({ summary: 'Expire prescription' })
  expire(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.expire(id, user.id, ip, ua);
  }

  @Post(':id/dispense')
  @ApiOperation({ summary: 'Mark prescription as dispensed by pharmacist' })
  dispense(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.dispense(id, user.id, ip, ua);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone or repeat previous prescription details into a new draft' })
  clone(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.prescriptionsService.clone(id, user.id, ip, ua);
  }
}
