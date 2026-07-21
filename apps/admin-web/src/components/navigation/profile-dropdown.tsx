'use client';

import React, { useState } from 'react';
import { User as UserIcon, Settings, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../stores/use-auth-store';
import { useUIStore } from '../../stores/use-ui-store';
import { Badge } from '../ui/badge';
import { formatFullName } from '../../utils/formatters';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const { openModal } = useUIStore();

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold text-xs">
          {user.userProfile?.firstName?.[0] || 'U'}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in-0 slide-in-from-top-2">
          <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {formatFullName(user.userProfile?.firstName, user.userProfile?.lastName)}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <div className="mt-2 flex items-center space-x-2">
              <Badge variant="primary" className="text-[10px]">
                {user.role}
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">Tenant: {user.tenantId || 'default'}</span>
            </div>
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                openModal('user-preferences');
              }}
              className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>User Preferences</span>
            </button>
            <div className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>HIPAA Compliant Session</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                clearAuth();
              }}
              className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
