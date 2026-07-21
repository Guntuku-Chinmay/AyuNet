'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, Permission } from '@ayunet/types';
import { useAuthStore } from '../../stores/use-auth-store';
import { useIdleTimer } from '../../hooks/use-idle-timer';
import { Loader2 } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
}

export function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasRole, hasPermission, clearAuth } = useAuthStore();

  useIdleTimer({
    timeoutMs: 15 * 60 * 1000, // 15 minutes idle timeout
    onIdle: () => {
      clearAuth();
      router.push('/login?sessionExpired=idle');
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
      router.push('/403');
      return;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/403');
      return;
    }
  }, [isAuthenticated, allowedRoles, requiredPermission, hasRole, hasPermission, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (allowedRoles && !hasRole(allowedRoles)) return null;
  if (requiredPermission && !hasPermission(requiredPermission)) return null;

  return <>{children}</>;
}
