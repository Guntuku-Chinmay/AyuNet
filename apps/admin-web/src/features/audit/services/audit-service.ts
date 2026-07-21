import { apiClient } from '../../../lib/axios-client';
import { PaginatedResponse } from '@ayunet/types';

export interface AuditLogRecord {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityName: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export const auditService = {
  async getLogs(params?: { page?: number; limit?: number; search?: string; action?: string }) {
    const response = await apiClient.get<PaginatedResponse<AuditLogRecord>>('/audit-logs', { params });
    return response.data;
  },
};
