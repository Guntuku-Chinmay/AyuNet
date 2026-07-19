import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TimeSlotsService } from './time-slots.service';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { BlockSlotDto } from './dto/block-slot.dto';

@ApiTags('availability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('availability')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch available time slots' })
  @ApiResponse({ status: 200, description: 'Return list of available time slots.' })
  findAvailable(
    @Query('doctorId') doctorId?: string,
    @Query('branchId') branchId?: string,
    @Query('departmentId') departmentId?: string
  ) {
    return this.timeSlotsService.fetchAvailableSlots(doctorId, branchId, departmentId);
  }

  @Get(':doctorId')
  @ApiOperation({ summary: 'Fetch available time slots for a specific doctor' })
  @ApiResponse({ status: 200, description: 'Return list of available time slots for the doctor.' })
  findDoctorSlots(@Param('doctorId') doctorId: string) {
    return this.timeSlotsService.fetchAvailableSlots(doctorId);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate available slots dynamically based on date/time range' })
  @ApiResponse({ status: 201, description: 'Slots generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid date/time range or parameters.' })
  generate(
    @Body() generateSlotsDto: GenerateSlotsDto,
    @CurrentUser() user: any
  ) {
    return this.timeSlotsService.generateSlots(generateSlotsDto, user.id);
  }

  @Post('block')
  @ApiOperation({ summary: 'Block doctor slot availability' })
  @ApiResponse({ status: 201, description: 'Slot blocked successfully.' })
  block(
    @Body() blockSlotDto: BlockSlotDto,
    @CurrentUser() user: any
  ) {
    return this.timeSlotsService.blockSlot(blockSlotDto, user.id);
  }

  @Post('unblock/:id')
  @ApiOperation({ summary: 'Unblock a previously blocked slot' })
  @ApiResponse({ status: 200, description: 'Slot unblocked successfully.' })
  unblock(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.timeSlotsService.unblockSlot(id, user.id);
  }

  @Post('unblock')
  @ApiOperation({ summary: 'Unblock a slot using request body slotId' })
  @ApiResponse({ status: 200, description: 'Slot unblocked successfully.' })
  unblockBody(
    @Body('slotId') id: string,
    @CurrentUser() user: any
  ) {
    return this.timeSlotsService.unblockSlot(id, user.id);
  }
}
