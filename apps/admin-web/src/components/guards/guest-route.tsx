'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/use-auth-store';
import { ROLE_DEFAULT_ROUTES } from '../../constants/permissions';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const defaultRoute = ROLE_DEFAULT_ROUTES[user.role] || '/';
      router.push(defaultRoute);
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) return null;

  return <>{children}</>;
}
