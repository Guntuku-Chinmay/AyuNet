import { apiClient } from '../../../lib/axios-client';
import { Permission, UserRole } from '@ayunet/types';

export interface RolePermissionMapping {
  role: UserRole;
  description: string;
  permissions: Permission[];
}

export const roleService = {
  async getRoles() {
    const response = await apiClient.get<RolePermissionMapping[]>('/roles');
    return response.data;
  },

  async updateRolePermissions(role: UserRole, permissions: Permission[]) {
    const response = await apiClient.put<RolePermissionMapping>(`/roles/${role}/permissions`, { permissions });
    return response.data;
  },
};
