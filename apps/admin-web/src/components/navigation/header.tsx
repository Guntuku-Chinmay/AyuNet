'use client';

import React from 'react';
import { Menu, Sun, Moon, Search } from 'lucide-react';
import { useThemeStore } from '../../stores/use-theme-store';
import { useUIStore } from '../../stores/use-ui-store';
import { Button } from '../ui/button';
import { NotificationCenter } from './notification-center';
import { QuickActions } from './quick-actions';
import { ProfileDropdown } from './profile-dropdown';
import { CommandPalette } from './command-palette';

export function Header() {
  const { theme, setTheme } = useThemeStore();
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold tracking-tight text-teal-600 dark:text-teal-400">AyuNet</span>
        </div>

        {/* Global Search / Command Palette trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search patients, doctors, appointments...</span>
            </div>
            <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <QuickActions />
          <NotificationCenter />
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </Button>
          <ProfileDropdown />
        </div>
      </header>

      <CommandPalette />
    </>
  );
}
