import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrescriptionItemsService } from './prescription-items.service';
import { AddPrescriptionItemDto } from './dto/add-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-item.dto';

@ApiTags('prescription-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PrescriptionItemsController {
  constructor(private readonly itemsService: PrescriptionItemsService) {}

  @Post('prescriptions/:id/items')
  @ApiOperation({ summary: 'Add a medicine item to a draft prescription' })
  @ApiResponse({ status: 201, description: 'Item added successfully.' })
  create(
    @Param('id') prescriptionId: string,
    @Body() dto: AddPrescriptionItemDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.itemsService.create(prescriptionId, dto, user.id, ip, ua);
  }

  @Patch('prescription-items/:id')
  @ApiOperation({ summary: 'Modify prescription item quantities or directions' })
  @ApiResponse({ status: 200, description: 'Item updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionItemDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.itemsService.update(id, dto, user.id, ip, ua);
  }

  @Delete('prescription-items/:id')
  @ApiOperation({ summary: 'Remove a medicine item from prescription draft' })
  @ApiResponse({ status: 200, description: 'Item removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.itemsService.remove(id, user.id, ip, ua);
  }
}
