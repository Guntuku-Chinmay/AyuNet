import { apiClient } from '../../../lib/axios-client';

export interface DashboardMetrics {
  totalPatients: number;
  todayAppointments: number;
  doctorsOnDuty: number;
  monthlyRevenue: number;
  labOrdersPending: number;
  occupancyRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'APPOINTMENT' | 'EMR' | 'BILLING' | 'LAB' | 'PHARMACY' | 'AUTH';
  description: string;
  user: string;
  timestamp: string;
}

export const dashboardService = {
  async getMetrics() {
    const response = await apiClient.get<DashboardMetrics>('/reports/dashboard-stats');
    return response.data;
  },

  async getRecentActivity() {
    const response = await apiClient.get<ActivityItem[]>('/reports/recent-activity');
    return response.data;
  },
};
