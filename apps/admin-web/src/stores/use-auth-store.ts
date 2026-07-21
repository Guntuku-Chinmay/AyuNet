import { create } from 'zustand';
import { User, UserRole, Permission } from '@ayunet/types';
import { storage } from '../utils/storage';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants/permissions';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  setAuth: (user: User, accessToken: string, refreshToken: string, tenantId?: string) => void;
  clearAuth: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storage.getItem<User | null>('ayunet_user', null),
  accessToken: storage.getItem<string | null>('ayunet_access_token', null),
  refreshToken: storage.getItem<string | null>('ayunet_refresh_token', null),
  tenantId: storage.getItem<string | null>('ayunet_tenant_id', null),
  isAuthenticated: !!storage.getItem<string | null>('ayunet_access_token', null),
  permissions: storage.getItem<User | null>('ayunet_user', null)?.role
    ? ROLE_DEFAULT_PERMISSIONS[storage.getItem<User>('ayunet_user', {} as User).role] || []
    : [],

  setAuth: (user, accessToken, refreshToken, tenantId) => {
    const permissions = ROLE_DEFAULT_PERMISSIONS[user.role] || [];

    storage.setItem('ayunet_user', user);
    storage.setItem('ayunet_access_token', accessToken);
    storage.setItem('ayunet_refresh_token', refreshToken);
    if (tenantId) storage.setItem('ayunet_tenant_id', tenantId);

    set({
      user,
      accessToken,
      refreshToken,
      tenantId: tenantId || null,
      isAuthenticated: true,
      permissions,
    });
  },

  clearAuth: () => {
    storage.removeItem('ayunet_user');
    storage.removeItem('ayunet_access_token');
    storage.removeItem('ayunet_refresh_token');
    storage.removeItem('ayunet_tenant_id');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      isAuthenticated: false,
      permissions: [],
    });
  },

  hasPermission: (permission) => {
    const { permissions, user } = get();
    if (user?.role === 'SUPER_ADMIN') return true;
    return permissions.includes(permission);
  },

  hasRole: (roles) => {
    const { user } = get();
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  },
}));
