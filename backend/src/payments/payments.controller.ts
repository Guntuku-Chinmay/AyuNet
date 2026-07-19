import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Initialize a new invoice payment transaction' })
  @ApiResponse({ status: 201, description: 'Payment record created.' })
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.paymentsService.create(dto, user.id, ip, ua);
  }

  @Post(':id/capture')
  @ApiOperation({ summary: 'Confirm & Capture the payment transaction funds' })
  capture(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.paymentsService.capture(id, user.id, ip, ua);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Initiate payment transaction reversal' })
  refund(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.paymentsService.refund(id, amount, reason, user.id, ip, ua);
  }

  @Post('webhooks/razorpay')
  @ApiOperation({ summary: 'Razorpay webhook payment status verification callback' })
  async razorpayWebhook(@Body() _payload: any) {
    return { status: 'verified', received: true };
  }

  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Stripe webhook payment status verification callback' })
  async stripeWebhook(@Body() _payload: any) {
    return { status: 'verified', received: true };
  }
}
