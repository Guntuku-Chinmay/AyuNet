import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice draft' })
  @ApiResponse({ status: 201, description: 'Invoice draft generated.' })
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.invoicesService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List all patient invoices' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an invoice' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice draft details' })
  @ApiResponse({ status: 200, description: 'Invoice updated.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.invoicesService.update(id, dto, user.id, ip, ua);
  }

  @Post(':id/issue')
  @ApiOperation({ summary: 'Issue/finalize the invoice draft' })
  issue(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.invoicesService.issue(id, user.id, ip, ua);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Void / Cancel the invoice' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.invoicesService.cancel(id, user.id, ip, ua);
  }

  @Post(':id/pdf')
  @ApiOperation({ summary: 'Generate and stream invoice PDF file representation' })
  async downloadPdf(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const invoice = await this.invoicesService.findOne(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(Buffer.from('%PDF-1.4 ... AyuNet mock invoice receipt ...'));
  }
}
