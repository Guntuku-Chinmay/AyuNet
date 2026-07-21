'use client';

import React from 'react';
import { LayoutDashboard, Calendar, Users, FileSpreadsheet, Pill, Bot } from 'lucide-react';
import { Header } from '../components/navigation/header';
import { RbacNav, NavItem } from '../components/navigation/rbac-nav';
import { useUIStore } from '../stores/use-ui-store';
import { cn } from '../utils/cn';
import { ROUTES } from '../constants/routes';

const doctorNavItems: NavItem[] = [
  { title: 'Dashboard', href: ROUTES.DOCTOR.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: 'Appointments', href: ROUTES.DOCTOR.APPOINTMENTS, icon: <Calendar className="h-5 w-5" />, permission: 'read:appointments' },
  { title: 'Patients', href: ROUTES.DOCTOR.PATIENTS, icon: <Users className="h-5 w-5" />, permission: 'read:patients' },
  { title: 'EMR Records', href: ROUTES.DOCTOR.EMR, icon: <FileSpreadsheet className="h-5 w-5" />, permission: 'read:emr' },
  { title: 'Prescriptions', href: ROUTES.DOCTOR.PRESCRIPTIONS, icon: <Pill className="h-5 w-5" />, permission: 'read:prescriptions' },
  { title: 'AI Assistant', href: ROUTES.DOCTOR.AI_ASSISTANT, icon: <Bot className="h-5 w-5" />, permission: 'access:ai' },
];

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <aside
          className={cn(
            'fixed bottom-0 top-16 z-30 w-64 border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 md:static',
            !isSidebarOpen && '-translate-x-full md:w-0 md:translate-x-0 md:border-none'
          )}
        >
          {isSidebarOpen && <RbacNav items={doctorNavItems} />}
        </aside>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
