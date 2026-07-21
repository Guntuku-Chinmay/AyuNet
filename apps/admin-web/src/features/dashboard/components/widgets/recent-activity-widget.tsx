import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';

export function RecentActivityWidget() {
  const activities = [
    { id: 'act-1', time: '10:14 AM', user: 'Dr. Priya Mehta', action: 'Created EMR Visit Summary', category: 'EMR' },
    { id: 'act-2', time: '10:08 AM', user: 'Nurse Anjali', action: 'Recorded Triage Vitals (BP 120/80)', category: 'CLINICAL' },
    { id: 'act-3', time: '09:55 AM', user: 'Receptionist S. Kumar', action: 'Checked-in Patient Rahul Sharma', category: 'CHECK-IN' },
    { id: 'act-4', time: '09:40 AM', user: 'Pharmacist R. Verma', action: 'Dispensed Prescription #RX-99182', category: 'PHARMACY' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Real-Time Activity Feed</CardTitle>
        <CardDescription>Continuous audit trail of hospital interactions across all branches</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User / Practitioner</TableHead>
              <TableHead>Action Event</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id}>
                <TableCell className="font-mono text-xs text-slate-500">{act.time}</TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{act.user}</TableCell>
                <TableCell className="text-xs">{act.action}</TableCell>
                <TableCell>
                  <Badge variant="primary" className="text-[10px]">{act.category}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
