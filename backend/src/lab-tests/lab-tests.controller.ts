import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LabTestsService } from './lab-tests.service';
import { CreateLabTestDto } from './dto/create-test.dto';
import { UpdateLabTestDto } from './dto/update-test.dto';

@ApiTags('lab-tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lab-tests')
export class LabTestsController {
  constructor(private readonly labTestsService: LabTestsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new lab test catalog profile' })
  @ApiResponse({ status: 201, description: 'Lab test registered successfully.' })
  create(
    @Body() dto: CreateLabTestDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labTestsService.create(dto, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list lab tests in catalog' })
  @ApiQuery({ name: 'query', required: false, description: 'Keyword to search test codes or names' })
  findAll(@Query('query') query: string) {
    return this.labTestsService.findAll(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modify lab test attributes' })
  @ApiResponse({ status: 200, description: 'Lab test updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLabTestDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labTestsService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove lab test from catalog' })
  @ApiResponse({ status: 200, description: 'Lab test removed successfully.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.labTestsService.remove(id, user.id, ip, ua);
  }
}
