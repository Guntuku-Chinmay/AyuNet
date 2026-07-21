import { apiClient } from '../../../lib/axios-client';
import { User, Permission } from '@ayunet/types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tenantId?: string;
  requiresOtp?: boolean;
  requiresPasswordChange?: boolean;
}

export const authService = {
  async login(credentials: { email: string; password: string; tenantId?: string }) {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: { token: string; password: string }) {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  async verifyOtp(code: string) {
    const response = await apiClient.post<LoginResponse>('/auth/verify-otp', { code });
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  async getPermissions() {
    const response = await apiClient.get<Permission[]>('/auth/permissions');
    return response.data;
  },
};
