'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '../stores/use-theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, primaryColor, accentColor } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    root.style.setProperty('--primary-brand', primaryColor);
    root.style.setProperty('--accent-brand', accentColor);
  }, [theme, primaryColor, accentColor]);

  return <>{children}</>;
}
