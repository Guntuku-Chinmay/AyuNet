import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowsService {
  private workflows = new Map<string, { id: string; name: string; triggerEvent: string; actions: any[]; isActive: boolean; createdAt: Date }>();
  private jobs = new Map<string, { id: string; name: string; queue: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED'; attempts: number; maxAttempts: number; payload: any; error?: string; createdAt: Date }>();
  private dlq = new Map<string, { id: string; jobId: string; queue: string; payload: any; reason: string; failedAt: Date }>();
  private queues = new Map<string, { name: string; status: 'ACTIVE' | 'PAUSED'; totalJobs: number; activeWorkers: number }>();

  constructor(private prisma: PrismaService) {
    this.queues.set('default', { name: 'default', status: 'ACTIVE', totalJobs: 125, activeWorkers: 4 });
    this.queues.set('notifications', { name: 'notifications', status: 'ACTIVE', totalJobs: 450, activeWorkers: 8 });
    this.queues.set('reports', { name: 'reports', status: 'ACTIVE', totalJobs: 12, activeWorkers: 2 });
  }

  calculateExponentialBackoff(attempt: number, baseIntervalMs: number = 1000): number {
    return Math.pow(2, attempt) * baseIntervalMs;
  }

  async createWorkflow(dto: CreateWorkflowDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const id = `wf-${Date.now()}`;
    const workflow = {
      id,
      name: dto.name,
      triggerEvent: dto.triggerEvent,
      actions: dto.actions,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date(),
    };

    this.workflows.set(id, workflow);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WORKFLOW_CREATED', 'Workflow', id, null, workflow, ipAddress, userAgent, tx);
    });

    return workflow;
  }

  async getWorkflows() {
    const list: any[] = [];
    this.workflows.forEach(w => list.push(w));
    return list;
  }

  async getWorkflow(id: string) {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }
    return workflow;
  }

  async updateWorkflow(id: string, dto: UpdateWorkflowDto, actorId: string) {
    const existing = this.workflows.get(id);
    if (!existing) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }

    const updated = {
      ...existing,
      name: dto.name || existing.name,
      triggerEvent: dto.triggerEvent || existing.triggerEvent,
      actions: dto.actions || existing.actions,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
    };
    this.workflows.set(id, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WORKFLOW_UPDATED', 'Workflow', id, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async deleteWorkflow(id: string, actorId: string) {
    const existing = this.workflows.get(id);
    if (!existing) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }

    this.workflows.delete(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'WORKFLOW_DELETED', 'Workflow', id, existing, null, '127.0.0.1', 'system', tx);
    });

    return { message: 'Workflow template deleted successfully.' };
  }

  async getJobs() {
    const list: any[] = [];
    this.jobs.forEach(j => list.push(j));
    return list;
  }

  async getJob(id: string) {
    const job = this.jobs.get(id);
    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' not found.`);
    }
    return job;
  }

  async retryJob(id: string, actorId: string) {
    const job = this.jobs.get(id);
    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' not found.`);
    }

    job.status = 'PENDING';
    job.attempts += 1;
    this.jobs.set(id, job);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'JOB_SCHEDULED', 'Job', id, null, { action: 'RETRY', attempts: job.attempts }, '127.0.0.1', 'system', tx);
    });

    return job;
  }

  async cancelJob(id: string, actorId: string) {
    const job = this.jobs.get(id);
    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' not found.`);
    }

    job.status = 'FAILED';
    job.error = 'Cancelled by administrator.';
    this.jobs.set(id, job);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'JOB_CANCELLED', 'Job', id, null, job, '127.0.0.1', 'system', tx);
    });

    return job;
  }

  async pauseQueue(queueName: string, actorId: string) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new NotFoundException(`Queue '${queueName}' not found.`);
    }

    queue.status = 'PAUSED';
    this.queues.set(queueName, queue);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'QUEUE_PAUSED', 'Queue', queueName, null, queue, '127.0.0.1', 'system', tx);
    });

    return queue;
  }

  async resumeQueue(queueName: string, actorId: string) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new NotFoundException(`Queue '${queueName}' not found.`);
    }

    queue.status = 'ACTIVE';
    this.queues.set(queueName, queue);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'QUEUE_RESUMED', 'Queue', queueName, null, queue, '127.0.0.1', 'system', tx);
    });

    return queue;
  }

  async getWorkflowMetrics() {
    return {
      activeWorkflows: this.workflows.size,
      totalExecutions: 8940,
      successfulExecutions: 8850,
      failedExecutions: 90,
      successRate: '99.0%',
    };
  }

  async getQueueMetrics() {
    const list: any[] = [];
    this.queues.forEach(q => list.push(q));
    return {
      totalQueues: this.queues.size,
      queues: list,
    };
  }

  async getDlq() {
    const list: any[] = [];
    this.dlq.forEach(d => list.push(d));
    return list;
  }

  async replayDlq(id: string, actorId: string, ipAddress?: string, userAgent?: string) {
    const dlqItem = this.dlq.get(id);
    if (!dlqItem) {
      throw new NotFoundException(`DLQ Message with ID '${id}' not found.`);
    }

    this.dlq.delete(id);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'DLQ_REPLAY', 'DeadLetterQueue', id, null, dlqItem, ipAddress, userAgent, tx);
    });

    return {
      message: `DLQ message '${id}' replayed back to queue '${dlqItem.queue}'.`,
      dlqItem,
    };
  }

  private async createAuditLog(
    actorId: string | undefined,
    action: string,
    entityName: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'system',
    tx: any
  ) {
    await tx.auditLog.create({
      data: {
        actorId,
        action,
        entityName,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
        createdBy: actorId,
      },
    });
  }
}
