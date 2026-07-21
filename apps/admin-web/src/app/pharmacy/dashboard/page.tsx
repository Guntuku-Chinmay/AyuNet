'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, PackageCheck, Package, ShieldAlert, Clock } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function PharmacyDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Pharmacy Information System (PIS) Command Portal
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                E-prescription verification, FEFO batch dispensing, inventory tracking, and controlled drug safety logs.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/pharmacy/queue">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Pill className="mr-2 h-4 w-4" /> Pharmacist Review Queue
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Pending Prescriptions" value="28" changePercent={4.2} description="Awaiting pharmacist review" icon={<Pill className="h-5 w-5" />} />
            <MetricCard title="Ready for Dispensing" value="12" changePercent={-1.5} description="Verified & batch allocated" icon={<PackageCheck className="h-5 w-5" />} />
            <MetricCard title="Low Stock Alerts" value="4" changePercent={0} description="Items below reorder level" icon={<Package className="h-5 w-5" />} />
            <MetricCard title="Controlled Drug Queue" value="2" changePercent={100} description="Schedule II Prescriptions" icon={<ShieldAlert className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Workstation Shortcuts</CardTitle>
              <CardDescription>Direct navigation to daily pharmacy dispensing tools</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/pharmacy/queue" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Pill className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Prescription Verification</h3>
                <p className="text-xs text-slate-500 mt-1">Review e-prescriptions & verify drug interactions.</p>
              </Link>
              <Link href="/pharmacy/dispensing" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <PackageCheck className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">FEFO Batch Dispensing</h3>
                <p className="text-xs text-slate-500 mt-1">Pick earliest expiring batches & print thermal container labels.</p>
              </Link>
              <Link href="/pharmacy/inventory" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Package className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Inventory Stock & Expiry</h3>
                <p className="text-xs text-slate-500 mt-1">Track formulary stock levels & near-expiry warnings.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
