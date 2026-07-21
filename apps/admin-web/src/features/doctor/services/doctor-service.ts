import { apiClient } from '../../../lib/axios-client';
import { Patient, MedicalRecord } from '@ayunet/types';

export interface DoctorDashboardKPIs {
  todayConsultations: number;
  waitingPatients: number;
  completedConsultations: number;
  emergencyCases: number;
  pendingLabReviews: number;
  unsignedPrescriptions: number;
}

export interface ClinicalTimelineItem {
  id: string;
  type: 'VISIT' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'LAB_REPORT' | 'IMAGING';
  title: string;
  description: string;
  author: string;
  date: string;
}

export const doctorService = {
  async getDashboardMetrics() {
    const response = await apiClient.get<DoctorDashboardKPIs>('/doctors/metrics');
    return response.data;
  },

  async getPatientClinicalSummary(patientId: string) {
    const response = await apiClient.get<Patient>(`/patients/${patientId}/summary`);
    return response.data;
  },

  async getPatientTimeline(patientId: string) {
    const response = await apiClient.get<ClinicalTimelineItem[]>(`/patients/${patientId}/timeline`);
    return response.data;
  },
};
