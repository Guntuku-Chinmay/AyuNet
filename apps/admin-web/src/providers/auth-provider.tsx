'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/use-auth-store';
import { socketClient } from '../lib/socket-client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketClient.connect();
    } else {
      socketClient.disconnect();
    }

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
