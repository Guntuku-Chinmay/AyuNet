import { apiClient } from '../../../lib/axios-client';
import { PaginatedResponse } from '@ayunet/types';

export interface HospitalBranch {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
  departmentsCount?: number;
}

export interface HospitalDepartment {
  id: string;
  branchId: string;
  name: string;
  code: string;
  description?: string;
  headDoctorId?: string;
  isActive: boolean;
}

export interface HospitalOrganization {
  id: string;
  name: string;
  licenseNumber: string;
  taxId: string;
  website?: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  isActive: boolean;
  createdAt: string;
  branches?: HospitalBranch[];
}

export const hospitalService = {
  async getHospitals(params?: { page?: number; limit?: number; search?: string }) {
    const response = await apiClient.get<PaginatedResponse<HospitalOrganization>>('/hospitals', { params });
    return response.data;
  },

  async getHospitalById(id: string) {
    const response = await apiClient.get<HospitalOrganization>(`/hospitals/${id}`);
    return response.data;
  },

  async createHospital(data: Partial<HospitalOrganization>) {
    const response = await apiClient.post<HospitalOrganization>('/hospitals', data);
    return response.data;
  },

  async updateHospital(id: string, data: Partial<HospitalOrganization>) {
    const response = await apiClient.patch<HospitalOrganization>(`/hospitals/${id}`, data);
    return response.data;
  },

  async getHospitalBranches(hospitalId: string) {
    const response = await apiClient.get<HospitalBranch[]>(`/hospitals/${hospitalId}/branches`);
    return response.data;
  },

  async createBranch(hospitalId: string, data: Partial<HospitalBranch>) {
    const response = await apiClient.post<HospitalBranch>(`/hospitals/${hospitalId}/branches`, data);
    return response.data;
  },

  async getBranchDepartments(branchId: string) {
    const response = await apiClient.get<HospitalDepartment[]>(`/branches/${branchId}/departments`);
    return response.data;
  },

  async createDepartment(branchId: string, data: Partial<HospitalDepartment>) {
    const response = await apiClient.post<HospitalDepartment>(`/branches/${branchId}/departments`, data);
    return response.data;
  },
};
