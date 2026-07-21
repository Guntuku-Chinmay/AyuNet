import { apiClient } from '../../../lib/axios-client';
import { Appointment, PaginatedResponse } from '@ayunet/types';

export interface DoctorTimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export const appointmentService = {
  async getAppointments(params?: { page?: number; limit?: number; doctorId?: string; status?: string; date?: string }) {
    const response = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', { params });
    return response.data;
  },

  async getDoctorSlots(doctorId: string, date: string) {
    const response = await apiClient.get<DoctorTimeSlot[]>(`/doctors/${doctorId}/slots`, { params: { date } });
    return response.data;
  },

  async bookAppointment(data: Partial<Appointment>) {
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  },

  async rescheduleAppointment(id: string, data: { appointmentDate: string; startTime: string; endTime: string }) {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  async cancelAppointment(id: string, reason: string) {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },
};
