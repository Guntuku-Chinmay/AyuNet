import { apiClient } from '../../../lib/axios-client';
import { User } from '@ayunet/types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tenantId?: string;
}

export const authService = {
  async login(credentials: { email: string; passwordHash: string }) {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
