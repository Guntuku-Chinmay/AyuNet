import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a payment transaction refund' })
  @ApiResponse({ status: 201, description: 'Refund request processed.' })
  create(
    @Body() dto: CreateRefundDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.refundsService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List all refund requests' })
  findAll() {
    return this.refundsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a refund request' })
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(id);
  }
}
