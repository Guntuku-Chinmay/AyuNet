import { apiClient } from '../../../lib/axios-client';
import { MedicalRecord } from '@ayunet/types';

export interface Icd10Code {
  code: string;
  description: string;
  category: string;
}

export interface SoapNoteDraft {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    spO2?: number;
    weightKg?: number;
    heightCm?: number;
  };
  diagnoses?: { code: string; name: string; isPrimary: boolean }[];
}

export const emrService = {
  async getMedicalRecord(visitId: string) {
    const response = await apiClient.get<MedicalRecord>(`/medical-records/${visitId}`);
    return response.data;
  },

  async saveDraft(visitId: string, draft: Partial<SoapNoteDraft>) {
    const response = await apiClient.put<MedicalRecord>(`/medical-records/${visitId}/draft`, draft);
    return response.data;
  },

  async finalizeRecord(visitId: string, record: SoapNoteDraft) {
    const response = await apiClient.post<MedicalRecord>(`/medical-records/${visitId}/finalize`, record);
    return response.data;
  },

  async searchIcd10(query: string) {
    const response = await apiClient.get<Icd10Code[]>('/icd10/search', { params: { q: query } });
    return response.data;
  },

  async generateAiDraft(chiefComplaint: string, vitalsText: string) {
    const response = await apiClient.post<{ draft: SoapNoteDraft }>('/ai/draft-soap', { chiefComplaint, vitalsText });
    return response.data;
  },
};
