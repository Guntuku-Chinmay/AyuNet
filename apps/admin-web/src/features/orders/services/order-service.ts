import { apiClient } from '../../../lib/axios-client';
import { Prescription } from '@ayunet/types';

export interface PrescribedMedicationItem {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  route: string;
  durationDays: number;
  foodTiming: string;
}

export interface LabOrderRequestItem {
  testCode: string;
  testName: string;
  urgency: 'ROUTINE' | 'STAT';
}

export interface ImagingOrderRequestItem {
  modality: 'X_RAY' | 'CT' | 'MRI' | 'ULTRASOUND' | 'ECG';
  bodyPart: string;
  clinicalHistory: string;
}

export const orderService = {
  async searchMedicines(query: string) {
    const response = await apiClient.get<Array<{ id: string; name: string; strength: string }>>('/medicines/search', {
      params: { q: query },
    });
    return response.data;
  },

  async createPrescription(visitId: string, medications: PrescribedMedicationItem[]) {
    const response = await apiClient.post<Prescription>(`/visits/${visitId}/prescriptions`, { medications });
    return response.data;
  },

  async signPrescription(prescriptionId: string, digitalPin: string) {
    const response = await apiClient.post<Prescription>(`/prescriptions/${prescriptionId}/sign`, { digitalPin });
    return response.data;
  },

  async submitLabOrders(visitId: string, items: LabOrderRequestItem[]) {
    const response = await apiClient.post(`/visits/${visitId}/lab-orders`, { items });
    return response.data;
  },

  async submitImagingOrders(visitId: string, items: ImagingOrderRequestItem[]) {
    const response = await apiClient.post(`/visits/${visitId}/imaging-orders`, { items });
    return response.data;
  },
};
