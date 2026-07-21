import { Permission, UserRole } from '@ayunet/types';
import { useAuthStore } from '../stores/use-auth-store';

export function usePermission() {
  const { hasPermission, hasRole, user, permissions } = useAuthStore();

  return {
    user,
    permissions,
    can: (permission: Permission) => hasPermission(permission),
    isRole: (roles: UserRole | UserRole[]) => hasRole(roles),
    isAdmin: () => hasRole(['SUPER_ADMIN', 'HOSPITAL_ADMIN']),
    isDoctor: () => hasRole('DOCTOR'),
    isPatient: () => hasRole('PATIENT'),
  };
}
