'use client';

import React from 'react';
import { Pill, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { usePharmacyStore } from '../../../stores/use-pharmacy-store';

export function PrescriptionVerification() {
  const { queue, updateStatus } = usePharmacyStore();
  const pendingQueue = queue.filter((q) => q.status === 'PENDING_VERIFICATION');

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-teal-600" />
          <span>Pharmacist Prescription Verification Queue</span>
        </CardTitle>
        <CardDescription>Review e-prescriptions, clinical safety warnings, and controlled medication protocols.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rx Number</TableHead>
              <TableHead>Patient Name & UHID</TableHead>
              <TableHead>Prescribing Practitioner</TableHead>
              <TableHead>Items Count</TableHead>
              <TableHead>Controlled Status</TableHead>
              <TableHead className="text-right">Pharmacist Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingQueue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                  No pending prescriptions awaiting verification.
                </TableCell>
              </TableRow>
            ) : (
              pendingQueue.map((item) => (
                <TableRow key={item.id} className={item.isControlled ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
                  <TableCell className="font-mono text-xs font-semibold">{item.prescriptionNumber}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.patientName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{item.uhid}</p>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{item.doctorName}</TableCell>
                  <TableCell className="font-mono text-xs">{item.medicationCount} Medications</TableCell>
                  <TableCell>
                    {item.isControlled ? (
                      <Badge variant="error" className="text-[10px]">
                        <ShieldAlert className="mr-1 h-3 w-3" /> SCHEDULE II CONTROLLED
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">STANDARD RX</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'REJECTED')}>
                        <XCircle className="mr-1 h-3.5 w-3.5 text-rose-500" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => updateStatus(item.id, 'VERIFIED')} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve & Verify
                      </Button>
                    </div>
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
