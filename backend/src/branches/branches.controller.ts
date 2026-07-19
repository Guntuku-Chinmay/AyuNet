import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@ApiTags('branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN')
  @ApiOperation({ summary: 'Create a new hospital branch' })
  @ApiResponse({ status: 201, description: 'The branch has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Active dependencies block.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin scope violations.' })
  @ApiResponse({ status: 409, description: 'Conflict: duplicate license number.' })
  create(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.branchesService.create(createBranchDto, user, ipAddress, userAgent);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List hospital branches based on user scope' })
  @ApiResponse({ status: 200, description: 'Return scoped hospital branches.' })
  findAll(@CurrentUser() user: any) {
    return this.branchesService.findAll(user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get details of a hospital branch' })
  @ApiResponse({ status: 200, description: 'Return branch details.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.branchesService.findOne(id, user);
  }

  @Get(':id/stats')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Get occupancy and resource statistics of a branch' })
  @ApiResponse({ status: 200, description: 'Return branch statistics.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  getStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.branchesService.getBranchStats(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Update a hospital branch' })
  @ApiResponse({ status: 200, description: 'The branch has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.branchesService.update(id, updateBranchDto, user, ipAddress, userAgent);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'BRANCH_ADMIN')
  @ApiOperation({ summary: 'Soft delete a hospital branch' })
  @ApiResponse({ status: 200, description: 'The branch has been successfully soft-deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Active departments block deletion.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.branchesService.remove(id, user, ipAddress, userAgent);
  }
}
