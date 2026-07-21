import { apiClient } from '../../../lib/axios-client';
import { User, PaginatedResponse } from '@ayunet/types';

export const userService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean }) {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: Partial<User>) {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>) {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async toggleUserStatus(id: string, isActive: boolean) {
    const response = await apiClient.patch<User>(`/users/${id}/status`, { isActive });
    return response.data;
  },

  async resetUserPassword(id: string) {
    const response = await apiClient.post<{ message: string }>(`/users/${id}/reset-password`);
    return response.data;
  },

  async forceLogout(id: string) {
    const response = await apiClient.post<{ message: string }>(`/users/${id}/force-logout`);
    return response.data;
  },
};
