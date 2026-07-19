import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChronicConditionsService } from './chronic-conditions.service';
import { AddConditionDto } from './dto/add-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';

@ApiTags('chronic-conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chronic-conditions')
export class ChronicConditionsController {
  constructor(private readonly conditionsService: ChronicConditionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a patient chronic condition profile' })
  @ApiResponse({ status: 201, description: 'Condition recorded successfully.' })
  create(
    @Body() dto: AddConditionDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.conditionsService.create(dto, user.id, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update chronic condition details' })
  @ApiResponse({ status: 200, description: 'Condition updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConditionDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.conditionsService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove chronic condition record' })
  @ApiResponse({ status: 200, description: 'Condition removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.conditionsService.remove(id, user.id, ip, ua);
  }
}
