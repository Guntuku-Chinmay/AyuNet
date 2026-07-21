'use client';

import React, { useState } from 'react';
import { Activity, FileText, Pill, TestTube, FileScan, Download, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { usePatientPortalStore } from '../../../stores/use-patient-portal-store';

export function PatientRecordsViewer() {
  const { activeMember } = usePatientPortalStore();
  const [tab, setTab] = useState<'TIMELINE' | 'PRESCRIPTIONS' | 'LABS' | 'IMAGING'>('TIMELINE');

  const mockTimeline = [
    { id: '1', date: '2026-07-21', title: 'OPD Consultation - Cardiology', doctor: 'Dr. Priya Mehta', type: 'VISIT' },
    { id: '2', date: '2026-06-16', title: 'Prescription Issued #RX-88192', doctor: 'Dr. Priya Mehta', type: 'PRESCRIPTION' },
    { id: '3', date: '2026-06-16', title: 'Serum Electrolytes & Lipid Profile', doctor: 'Apollo Pathology Lab', type: 'LAB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Personal Health Records (PHR)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Viewing records for <span className="font-bold text-teal-600 dark:text-teal-400">{activeMember.name}</span> ({activeMember.uhid}).
          </p>
        </div>
        <div className="flex space-x-1">
          {(['TIMELINE', 'PRESCRIPTIONS', 'LABS', 'IMAGING'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                tab === t
                  ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  : 'border-slate-300 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <Activity className="h-4 w-4 text-teal-600" />
            <span>Health Records & Documentation Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clinical Event / Record</TableHead>
                <TableHead>Provider / Department</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimeline.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{item.date}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">{item.doctor}</TableCell>
                  <TableCell>
                    {item.type === 'VISIT' && <Badge variant="primary">VISIT</Badge>}
                    {item.type === 'PRESCRIPTION' && <Badge variant="success">PRESCRIPTION</Badge>}
                    {item.type === 'LAB' && <Badge variant="outline">PATHOLOGY</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => alert('Downloading encrypted medical PDF...')}>
                      <Download className="mr-1 h-3.5 w-3.5" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
