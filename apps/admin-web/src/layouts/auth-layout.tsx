import React from 'react';
import { Card } from '../components/ui/card';

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AyuNet</h1>
          <p className="text-sm text-teal-200">Enterprise Cloud Healthcare Platform</p>
        </div>
        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}
