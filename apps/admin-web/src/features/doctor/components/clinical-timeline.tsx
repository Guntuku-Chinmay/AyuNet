'use client';

import React from 'react';
import { Activity, FileText, Pill, Stethoscope, TestTube } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ClinicalTimelineItem } from '../services/doctor-service';

export function ClinicalTimeline() {
  const items: ClinicalTimelineItem[] = [
    {
      id: 'tl-1',
      type: 'VISIT',
      title: 'OPD Cardiology Consultation',
      description: 'Patient presented with mild dyspnea on exertion. BP 138/88 mmHg.',
      author: 'Dr. Priya Mehta',
      date: '2026-06-15',
    },
    {
      id: 'tl-2',
      type: 'LAB_REPORT',
      title: 'Lipid Profile & HbA1c Test',
      description: 'Total Cholesterol: 210 mg/dL | HbA1c: 6.8% (Controlled)',
      author: 'Apollo Pathology Lab',
      date: '2026-06-16',
    },
    {
      id: 'tl-3',
      type: 'PRESCRIPTION',
      title: 'Prescription Issued #RX-88192',
      description: 'Telmisartan 40mg (1-0-0) x 30 days, Metformin 500mg (1-0-1) x 30 days',
      author: 'Dr. Priya Mehta',
      date: '2026-06-16',
    },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <Activity className="h-4 w-4 text-teal-600" />
          <span>Patient Historical Clinical Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start space-x-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="mt-0.5 shrink-0">
              {item.type === 'VISIT' && <Stethoscope className="h-4 w-4 text-teal-600" />}
              {item.type === 'LAB_REPORT' && <TestTube className="h-4 w-4 text-indigo-500" />}
              {item.type === 'PRESCRIPTION' && <Pill className="h-4 w-4 text-emerald-600" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-slate-100">{item.title}</span>
                <span className="font-mono text-[10px] text-slate-400">{item.date}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
              <p className="text-[10px] text-slate-400">Practitioner: {item.author}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
