'use client';

import React from 'react';
import { ShieldCheck, FileCheck, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function ConsentManager() {
  const consents = [
    { title: 'HIPAA Health Information Exchange Consent', grantedAt: '2026-01-15', status: 'ACTIVE' },
    { title: 'Telehealth Video Consultation Terms', grantedAt: '2026-02-10', status: 'ACTIVE' },
    { title: 'Caregiver Proxy Access Grant - Spouse', grantedAt: '2026-03-01', status: 'ACTIVE' },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>HIPAA Treatment Consents & Data Authorization Log</span>
        </CardTitle>
        <CardDescription>Manage active patient privacy consents and data sharing permissions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {consents.map((c) => (
          <div
            key={c.title}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{c.title}</p>
              <p className="text-[10px] text-slate-400 font-mono">Granted On: {c.grantedAt}</p>
            </div>
            <Badge variant="success">ACTIVE CONSENT</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
