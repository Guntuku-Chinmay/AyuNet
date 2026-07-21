'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus, Calendar, ShieldAlert, Clock, Activity } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ROUTES } from '../../../constants/routes';

export default function ReceptionDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'NURSE']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Front-Desk Reception Command Portal
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                High-speed patient check-in, token allocation, emergency intake, and queue management.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/reception/patient-registration">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <UserPlus className="mr-2 h-4 w-4" /> Fast-Track Registration
                </Button>
              </Link>
              <Link href="/reception/queue">
                <Button variant="outline">
                  <Clock className="mr-2 h-4 w-4" /> Live Queue Board
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Today's Total Check-ins" value="184" changePercent={14.2} description="OPD & Emergency intake" icon={<Calendar className="h-5 w-5" />} />
            <MetricCard title="Waiting Queue" value="28" changePercent={-5.1} description="Average wait time: 12 mins" icon={<Clock className="h-5 w-5" />} />
            <MetricCard title="Doctors On Duty" value="18" changePercent={0} description="Available for consultation" icon={<Activity className="h-5 w-5" />} />
            <MetricCard title="Emergency Admissions" value="4" changePercent={100} description="STAT Triage Patients" icon={<ShieldAlert className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reception Action Shortcuts</CardTitle>
              <CardDescription>Rapid access to daily front-desk workflows</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/reception/patient-registration" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <UserPlus className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Patient Registration</h3>
                <p className="text-xs text-slate-500 mt-1">Register new walk-in patients & auto-generate UHID slips.</p>
              </Link>
              <Link href="/reception/queue" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Clock className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Token & Queue Board</h3>
                <p className="text-xs text-slate-500 mt-1">Call waiting tokens, update status, and print thermal slips.</p>
              </Link>
              <Link href={ROUTES.DOCTOR.APPOINTMENTS} className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Calendar className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Appointment Check-in</h3>
                <p className="text-xs text-slate-500 mt-1">Check-in scheduled patients and notify practitioners.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
