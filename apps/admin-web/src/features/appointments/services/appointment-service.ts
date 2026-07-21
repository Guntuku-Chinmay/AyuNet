import { apiClient } from '../../../lib/axios-client';
import { Appointment, PaginatedResponse } from '@ayunet/types';

export const appointmentService = {
  async getAppointments(params?: { page?: number; limit?: number; doctorId?: string; status?: string }) {
    const response = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', { params });
    return response.data;
  },

  async createAppointment(data: Partial<Appointment>) {
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  },

  async updateAppointmentStatus(id: string, status: string) {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}/status`, { status });
    return response.data;
  },
};
