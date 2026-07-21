'use client';

import React from 'react';
import { Clock, Activity, AlertCircle, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

export function OperationalMetrics() {
  const deptOps = [
    { department: 'Cardiology OPD', avgWaitMins: 14, queueLength: 8, status: 'NORMAL' },
    { department: 'Orthopedics OPD', avgWaitMins: 22, queueLength: 14, status: 'MODERATE' },
    { department: 'Emergency & Triage', avgWaitMins: 4, queueLength: 3, status: 'STAT_PRIORITY' },
    { department: 'Pathology Lab Intake', avgWaitMins: 11, queueLength: 6, status: 'NORMAL' },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-teal-600" />
          <span>Operational Queue Length & Wait Time Analytics</span>
        </CardTitle>
        <CardDescription>Real-time department queue throughput and patient wait time metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinical Department</TableHead>
              <TableHead>Average Patient Wait</TableHead>
              <TableHead>Active Queue Length</TableHead>
              <TableHead>Load Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deptOps.map((op) => (
              <TableRow key={op.department}>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{op.department}</TableCell>
                <TableCell className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">{op.avgWaitMins} Mins</TableCell>
                <TableCell className="font-mono text-xs">{op.queueLength} Patients</TableCell>
                <TableCell>
                  {op.status === 'NORMAL' && <Badge variant="success">OPTIMAL</Badge>}
                  {op.status === 'MODERATE' && <Badge variant="warning">BUSY</Badge>}
                  {op.status === 'STAT_PRIORITY' && <Badge variant="error">STAT PRIORITY</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
