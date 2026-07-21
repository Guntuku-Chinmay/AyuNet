'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useLabStore } from '../../../stores/use-lab-store';

export function ResultValidationPanel() {
  const { worklist, updateStatus } = useLabStore();
  const validationSamples = worklist.filter((w) => w.status === 'AWAITING_VALIDATION');
  const criticalSamples = worklist.filter((w) => w.isCritical);

  const handleValidate = (id: string) => {
    updateStatus(id, 'VALIDATED');
  };

  return (
    <div className="space-y-6">
      {/* STAT Critical Alert Banner */}
      {criticalSamples.length > 0 && (
        <div className="rounded-xl border border-red-400 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40 space-y-2 animate-pulse">
          <div className="flex items-center space-x-2 font-bold text-red-800 dark:text-red-300">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>STAT CRITICAL VALUE ALERT: Mandatory Attending Physician Escalation Required</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Sample <span className="font-mono font-bold text-red-700 dark:text-red-300">SMP-8819</span> (Rahul Sharma): <span className="font-bold text-red-600">Serum Potassium 6.8 mmol/L</span> exceeds upper critical limit (5.0 mmol/L).
          </p>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <span>Pathologist Result Validation & Publication Queue</span>
          </CardTitle>
          <CardDescription>Review technician entered values and apply pathologist digital signature.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample ID</TableHead>
                <TableHead>Patient Name & UHID</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Result Value</TableHead>
                <TableHead>Reference Range</TableHead>
                <TableHead className="text-right">Validation Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationSamples.map((sample) => (
                <TableRow key={sample.id} className={sample.isCritical ? 'bg-red-50/40 dark:bg-red-950/20' : ''}>
                  <TableCell className="font-mono text-xs font-semibold">{sample.sampleId}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{sample.patientName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{sample.uhid}</p>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{sample.testName}</TableCell>
                  <TableCell>
                    <span className={`font-mono font-bold ${sample.isCritical ? 'text-rose-600 text-sm' : 'text-slate-900 dark:text-slate-100'}`}>
                      {sample.resultValue}
                    </span>
                    {sample.isCritical && <Badge variant="error" className="ml-2 text-[10px]">CRITICAL HIGH</Badge>}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{sample.referenceRange}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleValidate(sample.id)} className="bg-teal-600 hover:bg-teal-700">
                      <Lock className="mr-1.5 h-3.5 w-3.5" /> Validate & Publish Report
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
