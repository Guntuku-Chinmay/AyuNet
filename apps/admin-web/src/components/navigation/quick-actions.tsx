'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, UserPlus, CalendarPlus, FilePlus, UploadCloud } from 'lucide-react';
import { usePermission } from '../../hooks/use-permission';
import { Button } from '../ui/button';
import { ROUTES } from '../../constants/routes';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const { can } = usePermission();

  const actions = [
    { label: 'Register Patient', href: '/reception/patient-registration', icon: <UserPlus className="h-4 w-4 text-teal-600" />, permission: 'write:patients' },
    { label: 'Book Appointment', href: ROUTES.DOCTOR.APPOINTMENTS, icon: <CalendarPlus className="h-4 w-4 text-indigo-600" />, permission: 'write:appointments' },
    { label: 'Create Invoice', href: '/billing/invoices/new', icon: <FilePlus className="h-4 w-4 text-emerald-600" />, permission: 'write:billing' },
    { label: 'Upload Lab Report', href: '/lab/reports/upload', icon: <UploadCloud className="h-4 w-4 text-amber-600" />, permission: 'write:lab' },
  ];

  const filteredActions = actions.filter((action) => !action.permission || can(action.permission as any));

  if (filteredActions.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-teal-600 hover:bg-teal-700 text-white font-medium"
      >
        <Plus className="mr-1.5 h-4 w-4" /> Quick Action
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in-0 slide-in-from-top-2">
          {filteredActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
