import { apiClient } from '../../../lib/axios-client';
import { Patient, PaginatedResponse } from '@ayunet/types';

export const patientService = {
  async getPatients(params?: { page?: number; limit?: number; search?: string }) {
    const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', { params });
    return response.data;
  },

  async getPatientById(id: string) {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  async createPatient(data: Partial<Patient>) {
    const response = await apiClient.post<Patient>('/patients', data);
    return response.data;
  },

  async updatePatient(id: string, data: Partial<Patient>) {
    const response = await apiClient.patch<Patient>(`/patients/${id}`, data);
    return response.data;
  },
};
