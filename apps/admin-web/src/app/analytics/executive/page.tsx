'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, DollarSign, Users, Building, FileSpreadsheet } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { ExecutiveCharts } from '../../../features/analytics/components/executive-charts';
import { Button } from '../../../components/ui/button';

export default function ExecutiveAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Executive BI & Financial Analytics Command Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time organizational revenue metrics, patient volume trends, and departmental growth indicators.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/analytics/reports">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Custom Report Builder
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total YTD Revenue" value="₹45.2M" changePercent={14.8} description="Cross-hospital billing" icon={<DollarSign className="h-5 w-5" />} />
            <MetricCard title="Patient Volume" value="12,840" changePercent={8.4} description="OPD & IPD admissions" icon={<Users className="h-5 w-5" />} />
            <MetricCard title="Doctor Utilization Rate" value="92.4%" changePercent={2.1} description="Schedule efficiency" icon={<TrendingUp className="h-5 w-5" />} />
            <MetricCard title="Bed Occupancy Rate" value="88.0%" changePercent={4.0} description="Inpatient bed capacity" icon={<Building className="h-5 w-5" />} />
          </div>

          <ExecutiveCharts />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
