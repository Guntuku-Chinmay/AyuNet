import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LabOrdersService } from './lab-orders.service';
import { CreateLabOrderDto } from './dto/create-order.dto';

@ApiTags('lab-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lab-orders')
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient laboratory order request' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  create(
    @Body() dto: CreateLabOrderDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labOrdersService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List laboratory orders' })
  findAll() {
    return this.labOrdersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of laboratory order' })
  findOne(@Param('id') id: string) {
    return this.labOrdersService.findOne(id);
  }

  @Post(':id/collect-sample')
  @ApiOperation({ summary: 'Collect clinical sample and update status' })
  collectSample(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labOrdersService.collectSample(id, user.id, ip, ua);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Mark laboratory processing workflow start' })
  process(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labOrdersService.process(id, user.id, ip, ua);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify report findings (pathologist credentials required)' })
  verify(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labOrdersService.verify(id, user.id, ip, ua);
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Deliver report findings to patient portal file' })
  deliver(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labOrdersService.deliver(id, user.id, ip, ua);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel laboratory order request' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labOrdersService.cancel(id, user.id, ip, ua);
  }
}
