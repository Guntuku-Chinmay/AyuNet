import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Create a new department in a branch' })
  @ApiResponse({ status: 201, description: 'The department has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Active dependencies block.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin scope violations.' })
  @ApiResponse({ status: 409, description: 'Conflict: duplicate department name in branch.' })
  create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.departmentsService.create(createDepartmentDto, user, ipAddress, userAgent);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List all active departments in a branch' })
  @ApiQuery({ name: 'branchId', type: String, required: true, description: 'The branch ID to filter by' })
  @ApiResponse({ status: 200, description: 'Return departments for the branch.' })
  findAll(
    @Query('branchId') branchId: string,
    @CurrentUser() user: any
  ) {
    return this.departmentsService.findAll(branchId, user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get details of a department' })
  @ApiResponse({ status: 200, description: 'Return department details.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'The department has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.departmentsService.update(id, updateDepartmentDto, user, ipAddress, userAgent);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Soft delete a department' })
  @ApiResponse({ status: 200, description: 'The department has been successfully soft-deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Active rooms dependency blocks deletion.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.departmentsService.remove(id, user, ipAddress, userAgent);
  }
}
