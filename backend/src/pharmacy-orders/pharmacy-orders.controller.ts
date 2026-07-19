import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PharmacyOrdersService } from './pharmacy-orders.service';
import { CreatePharmacyOrderDto } from './dto/create-order.dto';

@ApiTags('pharmacy-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pharmacy-orders')
export class PharmacyOrdersController {
  constructor(private readonly ordersService: PharmacyOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pharmacy order from signed prescription' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  create(
    @Body() dto: CreatePharmacyOrderDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List pharmacy orders' })
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of pharmacy order' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify order prescription (pharmacist credentials required)' })
  verify(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.verify(id, user.id, ip, ua);
  }

  @Post(':id/dispense')
  @ApiOperation({ summary: 'Dispense medicines for preparation' })
  dispense(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.dispense(id, user.id, ip, ua);
  }

  @Post(':id/partial-dispense')
  @ApiOperation({ summary: 'Dispense partial medicines' })
  partialDispense(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.partialDispense(id, user.id, ip, ua);
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Dispatch order for home delivery' })
  deliver(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.deliver(id, user.id, ip, ua);
  }

  @Post(':id/collect')
  @ApiOperation({ summary: 'Mark order collected at pickup counter' })
  collect(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.collect(id, user.id, ip, ua);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel pharmacy order' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.ordersService.cancel(id, user.id, ip, ua);
  }
}
