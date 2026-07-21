'use client';

import React from 'react';
import { LayoutDashboard, Calendar, FileText, Pill, CreditCard, Bot } from 'lucide-react';
import { Header } from '../components/navigation/header';
import { RbacNav, NavItem } from '../components/navigation/rbac-nav';
import { useUIStore } from '../stores/use-ui-store';
import { cn } from '../utils/cn';
import { ROUTES } from '../constants/routes';

const patientNavItems: NavItem[] = [
  { title: 'Overview', href: ROUTES.PATIENT.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: 'My Appointments', href: ROUTES.PATIENT.APPOINTMENTS, icon: <Calendar className="h-5 w-5" /> },
  { title: 'Medical Records', href: ROUTES.PATIENT.MEDICAL_RECORDS, icon: <FileText className="h-5 w-5" /> },
  { title: 'Prescriptions', href: ROUTES.PATIENT.PRESCRIPTIONS, icon: <Pill className="h-5 w-5" /> },
  { title: 'Invoices & Payments', href: ROUTES.PATIENT.INVOICES, icon: <CreditCard className="h-5 w-5" /> },
  { title: 'Health Assistant AI', href: ROUTES.PATIENT.AI_BOT, icon: <Bot className="h-5 w-5" /> },
];

export function PatientLayout({ children }: { children: React.ReactNode }) {
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
          {isSidebarOpen && <RbacNav items={patientNavItems} />}
        </aside>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
