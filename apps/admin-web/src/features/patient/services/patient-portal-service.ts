import { apiClient } from '../../../lib/axios-client';
import { Patient } from '@ayunet/types';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'SELF' | 'SPOUSE' | 'CHILD' | 'PARENT';
  uhid: string;
}

export interface CaregiverProxy {
  id: string;
  caregiverName: string;
  email: string;
  relationship: string;
  permissions: string[];
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
}

export const patientPortalService = {
  async getMyProfile() {
    const response = await apiClient.get<Patient>('/patient/me');
    return response.data;
  },

  async getFamilyMembers() {
    const response = await apiClient.get<FamilyMember[]>('/patient/family-members');
    return response.data;
  },

  async getCaregivers() {
    const response = await apiClient.get<CaregiverProxy[]>('/patient/caregivers');
    return response.data;
  },

  async inviteCaregiver(data: { email: string; relationship: string; permissions: string[] }) {
    const response = await apiClient.post<CaregiverProxy>('/patient/caregivers/invite', data);
    return response.data;
  },

  async revokeCaregiver(id: string) {
    const response = await apiClient.delete(`/patient/caregivers/${id}`);
    return response.data;
  },
};
