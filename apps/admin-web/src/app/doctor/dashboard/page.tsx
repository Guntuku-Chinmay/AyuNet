'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, Clock, Users, ShieldAlert, TestTube, Pill, Play, CheckCircle2 } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { DoctorLayout } from '../../../layouts/doctor-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

export default function DoctorDashboardPage() {
  const queue = [
    { token: 'A-012', name: 'Rahul Sharma', uhid: 'UHID-2026-9918', type: 'OPD Follow-up', status: 'WAITING' },
    { token: 'A-013', name: 'Ananya Patel', uhid: 'UHID-2026-9919', type: 'New Consult', status: 'WAITING' },
    { token: 'EM-004', name: 'Trauma Patient', uhid: 'UHID-EMG-0042', type: 'STAT Emergency', status: 'EMERGENCY' },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
      <DoctorLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Doctor Clinical Command Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Welcome back, Dr. Priya Mehta (Cardiology Department).
              </p>
            </div>
            <Link href="/doctor/workspace">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Stethoscope className="mr-2 h-4 w-4" /> Enter Clinical Workspace
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Today's Consultations" value="14" changePercent={8.5} description="10 Completed | 4 Waiting" icon={<Stethoscope className="h-5 w-5" />} />
            <MetricCard title="Waiting Queue" value="4" changePercent={-20} description="Est. wait time: 10 mins" icon={<Clock className="h-5 w-5" />} />
            <MetricCard title="Pending Lab Reviews" value="3" changePercent={0} description="Pathology & Radiology" icon={<TestTube className="h-5 w-5" />} />
            <MetricCard title="Unsigned Prescriptions" value="2" changePercent={-50} description="Awaiting signature" icon={<Pill className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live OPD Queue Roster</CardTitle>
              <CardDescription>Patients waiting outside consultation room #204</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token No.</TableHead>
                    <TableHead>Patient Name & UHID</TableHead>
                    <TableHead>Visit Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((q) => (
                    <TableRow key={q.token} className={q.status === 'EMERGENCY' ? 'bg-red-50/40 dark:bg-red-950/20' : ''}>
                      <TableCell>
                        <Badge variant={q.status === 'EMERGENCY' ? 'error' : 'primary'} className="font-mono">
                          {q.token}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{q.name}</p>
                        <p className="font-mono text-[10px] text-slate-500">{q.uhid}</p>
                      </TableCell>
                      <TableCell className="text-xs">{q.type}</TableCell>
                      <TableCell>
                        {q.status === 'EMERGENCY' ? <Badge variant="error">STAT Emergency</Badge> : <Badge variant="outline">Waiting</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/doctor/workspace">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            <Play className="mr-1.5 h-3.5 w-3.5" /> Call Patient
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    </ProtectedRoute>
  );
}
