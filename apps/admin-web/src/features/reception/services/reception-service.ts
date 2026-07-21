import { apiClient } from '../../../lib/axios-client';
import { Patient, Appointment } from '@ayunet/types';

export interface QueueToken {
  id: string;
  tokenNumber: string;
  patientName: string;
  uhid: string;
  doctorName: string;
  departmentName: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  isEmergency?: boolean;
  checkInTime: string;
}

export const receptionService = {
  async getQueueTokens(branchId?: string) {
    const response = await apiClient.get<QueueToken[]>('/queues', { params: { branchId } });
    return response.data;
  },

  async checkInAppointment(appointmentId: string) {
    const response = await apiClient.post<QueueToken>(`/appointments/${appointmentId}/check-in`);
    return response.data;
  },

  async createWalkIn(data: { patientId: string; doctorId: string; branchId: string; departmentId: string; isEmergency?: boolean }) {
    const response = await apiClient.post<QueueToken>('/queues/walk-in', data);
    return response.data;
  },

  async registerEmergencyPatient(data: { name: string; age?: number; gender: string; chiefComplaint: string }) {
    const response = await apiClient.post<{ patient: Patient; token: QueueToken }>('/patients/emergency', data);
    return response.data;
  },
};
