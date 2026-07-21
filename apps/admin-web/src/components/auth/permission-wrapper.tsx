'use client';

import React from 'react';
import { Permission, UserRole } from '@ayunet/types';
import { useAuthStore } from '../../stores/use-auth-store';

export interface PermissionWrapperProps {
  permission?: Permission;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionWrapper({ permission, roles, fallback = null, children }: PermissionWrapperProps) {
  const { hasPermission, hasRole } = useAuthStore();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (roles && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
