'use client';

import React from 'react';
import { Menu, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/use-auth-store';
import { useThemeStore } from '../../stores/use-theme-store';
import { useUIStore } from '../../stores/use-ui-store';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatFullName } from '../../utils/formatters';

export function Header() {
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { toggleSidebar } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-lg font-bold tracking-tight text-teal-600 dark:text-teal-400">AyuNet</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </Button>

        {user && (
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 dark:border-slate-800">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatFullName(user.userProfile?.firstName, user.userProfile?.lastName)}
              </p>
              <Badge variant="primary" className="text-[10px]">
                {user.role}
              </Badge>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              <UserIcon className="h-5 w-5" />
            </div>
            <Button variant="ghost" size="icon" onClick={clearAuth} title="Logout">
              <LogOut className="h-5 w-5 text-rose-500" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
