'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users, FileText, Settings, LayoutDashboard, Plus, X } from 'lucide-react';
import { useUIStore } from '../../stores/use-ui-store';
import { usePermission } from '../../hooks/use-permission';
import { ROUTES } from '../../constants/routes';

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { can } = usePermission();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const items = [
    { title: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: <LayoutDashboard className="h-4 w-4" />, group: 'Navigation' },
    { title: 'Patients Directory', href: ROUTES.DOCTOR.PATIENTS, icon: <Users className="h-4 w-4" />, group: 'Navigation', permission: 'read:patients' },
    { title: 'Appointments Calendar', href: ROUTES.DOCTOR.APPOINTMENTS, icon: <Calendar className="h-4 w-4" />, group: 'Navigation', permission: 'read:appointments' },
    { title: 'Medical Records (EMR)', href: ROUTES.DOCTOR.EMR, icon: <FileText className="h-4 w-4" />, group: 'Navigation', permission: 'read:emr' },
    { title: 'System Settings', href: ROUTES.ADMIN.TENANT_SETTINGS, icon: <Settings className="h-4 w-4" />, group: 'Navigation', permission: 'manage:tenant' },
    { title: 'Register New Patient', href: '/reception/patient-registration', icon: <Plus className="h-4 w-4 text-teal-500" />, group: 'Actions', permission: 'write:patients' },
    { title: 'Book New Appointment', href: ROUTES.DOCTOR.APPOINTMENTS, icon: <Plus className="h-4 w-4 text-teal-500" />, group: 'Actions', permission: 'write:appointments' },
  ];

  const filteredItems = items
    .filter((item) => !item.permission || can(item.permission as any))
    .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    setCommandPaletteOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center border-b border-slate-800 px-4">
          <Search className="mr-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. Patients, Book Appointment)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            autoFocus
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="rounded p-1 text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="p-4 text-center text-sm text-slate-500">No commands found matching &quot;{query}&quot;</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleSelect(item.href)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.group}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
