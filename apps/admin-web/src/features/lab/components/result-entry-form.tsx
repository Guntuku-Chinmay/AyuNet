'use client';

import React, { useState } from 'react';
import { TestTube, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useLabStore } from '../../../stores/use-lab-store';

export function ResultEntryForm() {
  const { worklist, updateStatus } = useLabStore();
  const processingSamples = worklist.filter((w) => w.status === 'PROCESSING');

  const [enteredValues, setEnteredValues] = useState<Record<string, string>>({
    'lab-102': '6.8%',
  });

  const handleValueChange = (id: string, value: string) => {
    setEnteredValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitResult = (id: string) => {
    const val = enteredValues[id];
    updateStatus(id, 'AWAITING_VALIDATION', { resultValue: val, isCritical: val.includes('6.8') });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-indigo-500" />
          <span>Technician Result Entry Worklist</span>
        </CardTitle>
        <CardDescription>Enter test values and submit to Pathologist validation queue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample & Barcode</TableHead>
              <TableHead>Patient Name & UHID</TableHead>
              <TableHead>Requisitioned Test</TableHead>
              <TableHead>Reference Range</TableHead>
              <TableHead>Numeric Result Entry</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processingSamples.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                  No samples currently in processing stage.
                </TableCell>
              </TableRow>
            ) : (
              processingSamples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell>
                    <Badge variant="primary" className="font-mono">{sample.sampleId}</Badge>
                    <p className="font-mono text-[10px] text-slate-400">{sample.barcode}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{sample.patientName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{sample.uhid}</p>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{sample.testName}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{sample.referenceRange || 'N/A'}</TableCell>
                  <TableCell>
                    <Input
                      placeholder="e.g. 6.8%"
                      value={enteredValues[sample.id] || ''}
                      onChange={(e) => handleValueChange(sample.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleSubmitResult(sample.id)} className="bg-indigo-600 hover:bg-indigo-700">
                      <Save className="mr-1.5 h-3.5 w-3.5" /> Submit to Pathologist
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
