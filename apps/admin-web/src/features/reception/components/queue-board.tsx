'use client';

import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, Printer, Play, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Dialog } from '../../../components/ui/dialog';
import { useQueueStore } from '../../../stores/use-queue-store';
import { QueueToken } from '../services/reception-service';

export function QueueBoard() {
  const { tokens, updateTokenStatus } = useQueueStore();
  const [printToken, setPrintToken] = useState<QueueToken | null>(null);

  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const activeTokens = tokens.filter((t) => t.status === 'IN_CONSULTATION');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Real-Time Token Queue Board
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor OPD patient flow, call waiting tokens, and dispatch emergency triage priority.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-teal-300 dark:border-teal-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">In Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{activeTokens.length}</span>
              <Badge variant="primary">Active Sessions</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Waiting Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{waitingTokens.length}</span>
              <Badge variant="outline">Est. Wait: 15 mins</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-300 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Emergency STAT Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                {tokens.filter((t) => t.isEmergency && t.status === 'WAITING').length}
              </span>
              <Badge variant="error">High Priority</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Token Roster</CardTitle>
          <CardDescription>Real-time queue sequence by assigned practitioner and department.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token No.</TableHead>
                <TableHead>Patient Name & UHID</TableHead>
                <TableHead>Practitioner</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Queue Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((tok) => (
                <TableRow key={tok.id} className={tok.isEmergency ? 'bg-red-50/40 dark:bg-red-950/20' : ''}>
                  <TableCell>
                    <Badge variant={tok.isEmergency ? 'error' : 'primary'} className="font-mono text-sm px-3 py-1">
                      {tok.tokenNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{tok.patientName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{tok.uhid}</p>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">{tok.doctorName}</TableCell>
                  <TableCell className="text-xs text-slate-500">{tok.departmentName}</TableCell>
                  <TableCell>
                    {tok.status === 'IN_CONSULTATION' && (
                      <Badge variant="primary" className="animate-pulse">
                        <Clock className="mr-1 h-3 w-3" /> In Session
                      </Badge>
                    )}
                    {tok.status === 'WAITING' && (
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3 text-slate-400" /> Waiting ({tok.checkInTime})
                      </Badge>
                    )}
                    {tok.status === 'COMPLETED' && (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {tok.status === 'WAITING' && (
                        <Button size="sm" variant="default" onClick={() => updateTokenStatus(tok.id, 'IN_CONSULTATION')}>
                          <Play className="mr-1 h-3.5 w-3.5" /> Call Token
                        </Button>
                      )}
                      {tok.status === 'IN_CONSULTATION' && (
                        <Button size="sm" variant="outline" onClick={() => updateTokenStatus(tok.id, 'COMPLETED')}>
                          <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> Complete
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setPrintToken(tok)}>
                        <Printer className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        isOpen={!!printToken}
        onClose={() => setPrintToken(null)}
        title="Print Patient Queue Slip"
        description="Slip preview for thermal printer receipt"
      >
        {printToken && (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-dashed border-slate-300 p-6 dark:border-slate-800 space-y-2">
              <p className="font-bold text-lg text-teal-600">AyuNet Healthcare</p>
              <h1 className="text-4xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{printToken.tokenNumber}</h1>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{printToken.patientName}</p>
              <p className="text-xs font-mono text-slate-500">{printToken.uhid}</p>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-200 dark:border-slate-800">
                Doctor: {printToken.doctorName} ({printToken.departmentName})
              </p>
              <p className="text-[10px] text-slate-400">Printed: {new Date().toLocaleTimeString()}</p>
            </div>
            <Button className="w-full" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Send to Thermal Printer
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
