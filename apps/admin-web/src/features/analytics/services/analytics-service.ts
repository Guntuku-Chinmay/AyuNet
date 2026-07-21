import { apiClient } from '../../../lib/axios-client';

export interface RevenueTrendItem {
  month: string;
  opdRevenue: number;
  ipdRevenue: number;
  labRevenue: number;
}

export interface DepartmentShareItem {
  name: string;
  value: number;
  color: string;
}

export interface ExecutiveMetrics {
  totalRevenue: string;
  patientVolume: number;
  doctorUtilizationRate: number;
  bedOccupancyRate: number;
  avgLabTatMins: number;
}

export const analyticsService = {
  async getExecutiveMetrics() {
    const response = await apiClient.get<ExecutiveMetrics>('/analytics/executive/metrics');
    return response.data;
  },

  async getRevenueTrends() {
    const response = await apiClient.get<RevenueTrendItem[]>('/analytics/executive/revenue-trends');
    return response.data;
  },

  async getDepartmentShare() {
    const response = await apiClient.get<DepartmentShareItem[]>('/analytics/executive/department-share');
    return response.data;
  },
};
