'use client';

import React from 'react';
import Link from 'next/link';
import { TestTube, QrCode, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function LabDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Laboratory Information System (LIS) Command Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Specimen intake, barcode verification, technician worklists, and pathologist validation queues.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/lab/samples">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <QrCode className="mr-2 h-4 w-4" /> Specimen Intake Scanner
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Pending Test Orders" value="42" changePercent={5.2} description="Requisitioned from OPD/EMR" icon={<TestTube className="h-5 w-5" />} />
            <MetricCard title="In Processing" value="18" changePercent={-2.1} description="Analyzers currently running" icon={<Clock className="h-5 w-5" />} />
            <MetricCard title="Awaiting Pathologist" value="6" changePercent={12.0} description="Ready for validation sign-off" icon={<ShieldCheck className="h-5 w-5" />} />
            <MetricCard title="Critical STAT Alerts" value="1" changePercent={100} description="Potassium 6.8 mmol/L" icon={<AlertTriangle className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>LIS Workstation Navigation</CardTitle>
              <CardDescription>Rapid access to laboratory processing modules</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/lab/samples" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <QrCode className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Sample Collection Scanner</h3>
                <p className="text-xs text-slate-500 mt-1">Scan specimen barcodes & verify patient intake.</p>
              </Link>
              <Link href="/lab/worklist" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <TestTube className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Technician Result Entry</h3>
                <p className="text-xs text-slate-500 mt-1">Enter numeric test results & review reference ranges.</p>
              </Link>
              <Link href="/lab/validation" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <ShieldCheck className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Pathologist Validation</h3>
                <p className="text-xs text-slate-500 mt-1">Review critical alerts & publish official lab reports.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
