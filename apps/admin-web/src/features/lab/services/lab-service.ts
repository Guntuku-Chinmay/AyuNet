import { apiClient } from '../../../lib/axios-client';

export interface LabWorklistItem {
  id: string;
  sampleId: string;
  barcode: string;
  patientName: string;
  uhid: string;
  testName: string;
  specimenType: string;
  status: 'COLLECTED' | 'PROCESSING' | 'AWAITING_VALIDATION' | 'VALIDATED';
  collectedAt: string;
  resultValue?: string;
  referenceRange?: string;
  isCritical?: boolean;
}

export const labService = {
  async getWorklist() {
    const response = await apiClient.get<LabWorklistItem[]>('/lab/worklist');
    return response.data;
  },

  async collectSpecimen(sampleId: string, barcode: string) {
    const response = await apiClient.post<LabWorklistItem>(`/lab/samples/${sampleId}/collect`, { barcode });
    return response.data;
  },

  async enterResult(sampleId: string, data: { resultValue: string; isCritical?: boolean }) {
    const response = await apiClient.post<LabWorklistItem>(`/lab/samples/${sampleId}/results`, data);
    return response.data;
  },

  async validateResult(resultId: string, notes?: string) {
    const response = await apiClient.post<LabWorklistItem>(`/lab/results/${resultId}/validate`, { notes });
    return response.data;
  },
};
