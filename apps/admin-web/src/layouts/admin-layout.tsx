'use client';

import React from 'react';
import { LayoutDashboard, Building2, Users, FileText, Settings, Shield } from 'lucide-react';
import { Header } from '../components/navigation/header';
import { RbacNav, NavItem } from '../components/navigation/rbac-nav';
import { useUIStore } from '../stores/use-ui-store';
import { cn } from '../utils/cn';
import { ROUTES } from '../constants/routes';

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: 'Hospitals', href: ROUTES.ADMIN.HOSPITALS, icon: <Building2 className="h-5 w-5" />, permission: 'manage:tenant' },
  { title: 'Users & Access', href: ROUTES.ADMIN.USERS, icon: <Users className="h-5 w-5" />, permission: 'manage:users' },
  { title: 'Reports & Analytics', href: ROUTES.ADMIN.REPORTS, icon: <FileText className="h-5 w-5" />, permission: 'read:reports' },
  { title: 'System Logs', href: ROUTES.ADMIN.SYSTEM_LOGS, icon: <Shield className="h-5 w-5" />, permission: 'manage:system' },
  { title: 'Settings', href: ROUTES.ADMIN.TENANT_SETTINGS, icon: <Settings className="h-5 w-5" /> },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
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
          {isSidebarOpen && <RbacNav items={adminNavItems} />}
        </aside>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
