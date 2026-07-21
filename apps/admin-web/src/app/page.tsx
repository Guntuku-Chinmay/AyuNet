'use client';

import React from 'react';
import { AdminLayout } from '../layouts/admin-layout';
import { MetricCard } from '../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Users, Calendar, Activity, CreditCard, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Enterprise Executive Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time multi-tenant hospital performance, clinical activity, and system health metrics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success" className="px-3 py-1 text-xs">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> HIPAA Certified
            </Badge>
            <Button variant="default">New Patient Admission</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Active Patients"
            value="14,250"
            changePercent={12.4}
            description="Across 12 hospital branches"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Appointments"
            value="342"
            changePercent={8.1}
            description="89% completion rate"
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="Clinical Lab Orders"
            value="1,280"
            changePercent={-2.3}
            description="Pending verification: 45"
            icon={<Activity className="h-5 w-5" />}
          />
          <MetricCard
            title="Monthly Revenue"
            value="₹45,20,000"
            changePercent={15.8}
            description="Invoices settled"
            icon={<CreditCard className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Patient Admissions & Triage Queue</CardTitle>
            <CardDescription>Live real-time feed of patient check-ins across emergency and OPD branches.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Assigned Doctor</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Triage Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Rahul Sharma</TableCell>
                  <TableCell className="font-mono text-xs">MRN-99824</TableCell>
                  <TableCell>Dr. Priya Mehta</TableCell>
                  <TableCell>Apollo Central</TableCell>
                  <TableCell>
                    <Badge variant="primary">CONFIRMED</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="error">STAT</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Ananya Patel</TableCell>
                  <TableCell className="font-mono text-xs">MRN-99825</TableCell>
                  <TableCell>Dr. Rajesh Kumar</TableCell>
                  <TableCell>Apollo West</TableCell>
                  <TableCell>
                    <Badge variant="success">COMPLETED</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">ROUTINE</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
