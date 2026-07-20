import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post('workflows')
  @ApiOperation({ summary: 'Create a new automated workflow definition' })
  @ApiResponse({ status: 201, description: 'Workflow created.' })
  createWorkflow(
    @Body() dto: CreateWorkflowDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.workflowsService.createWorkflow(dto, user.id, ip, ua);
  }

  @Get('workflows')
  @ApiOperation({ summary: 'List all workflow definitions' })
  getWorkflows() {
    return this.workflowsService.getWorkflows();
  }

  @Get('workflows/:id')
  @ApiOperation({ summary: 'Get workflow details by ID' })
  getWorkflow(@Param('id') id: string) {
    return this.workflowsService.getWorkflow(id);
  }

  @Patch('workflows/:id')
  @ApiOperation({ summary: 'Update workflow template parameters' })
  updateWorkflow(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() user: any
  ) {
    return this.workflowsService.updateWorkflow(id, dto, user.id);
  }

  @Delete('workflows/:id')
  @ApiOperation({ summary: 'Delete a workflow definition' })
  deleteWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.workflowsService.deleteWorkflow(id, user.id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List background job executions' })
  getJobs() {
    return this.workflowsService.getJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get background job status details' })
  getJob(@Param('id') id: string) {
    return this.workflowsService.getJob(id);
  }

  @Post('jobs/:id/retry')
  @ApiOperation({ summary: 'Retry a failed background job' })
  retryJob(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.workflowsService.retryJob(id, user.id);
  }

  @Post('jobs/:id/cancel')
  @ApiOperation({ summary: 'Cancel a pending or running background job' })
  cancelJob(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.workflowsService.cancelJob(id, user.id);
  }

  @Post('jobs/:id/pause')
  @ApiOperation({ summary: 'Pause a background job processing queue' })
  pauseQueue(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.workflowsService.pauseQueue(id, user.id);
  }

  @Post('jobs/:id/resume')
  @ApiOperation({ summary: 'Resume a paused background job processing queue' })
  resumeQueue(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.workflowsService.resumeQueue(id, user.id);
  }

  @Get('workflow-metrics')
  @ApiOperation({ summary: 'Get workflow execution metrics' })
  getWorkflowMetrics() {
    return this.workflowsService.getWorkflowMetrics();
  }

  @Get('queue-metrics')
  @ApiOperation({ summary: 'Get background queue health and worker metrics' })
  getQueueMetrics() {
    return this.workflowsService.getQueueMetrics();
  }

  @Get('dlq')
  @ApiOperation({ summary: 'List Dead Letter Queue (DLQ) messages' })
  getDlq() {
    return this.workflowsService.getDlq();
  }

  @Post('dlq/:id/replay')
  @ApiOperation({ summary: 'Replay a dead-letter message' })
  replayDlq(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.workflowsService.replayDlq(id, user.id, ip, ua);
  }
}
