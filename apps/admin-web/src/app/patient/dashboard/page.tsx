'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Pill, FileText, CreditCard, Users, HeartPulse } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { PatientLayout } from '../../../layouts/patient-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { usePatientPortalStore } from '../../../stores/use-patient-portal-store';

export default function PatientDashboardPage() {
  const { activeMember } = usePatientPortalStore();

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PATIENT', 'CAREGIVER']}>
      <PatientLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Patient & Family Health Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Welcome back, <span className="font-bold text-teal-600 dark:text-teal-400">{activeMember.name}</span> ({activeMember.uhid}).
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/patient/records">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <FileText className="mr-2 h-4 w-4" /> View My Health Records
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Upcoming Appointments" value="1" changePercent={0} description="Cardiology OPD - Today" icon={<Calendar className="h-5 w-5" />} />
            <MetricCard title="Active Medications" value="2" changePercent={0} description="Telmisartan & Metformin" icon={<Pill className="h-5 w-5" />} />
            <MetricCard title="Lab Reports Ready" value="3" changePercent={100} description="Pathology Results" icon={<FileText className="h-5 w-5" />} />
            <MetricCard title="Outstanding Balance" value="₹0" changePercent={0} description="Invoices settled" icon={<CreditCard className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Patient Self-Service Shortcuts</CardTitle>
              <CardDescription>Direct navigation to medical records, appointments, and caregiver proxy controls</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/patient/records" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <FileText className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Personal Health Records</h3>
                <p className="text-xs text-slate-500 mt-1">Access past visits, lab reports, and prescriptions.</p>
              </Link>
              <Link href="/patient/caregivers" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Users className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Family & Caregiver Access</h3>
                <p className="text-xs text-slate-500 mt-1">Switch family profiles & delegate proxy access.</p>
              </Link>
              <Link href="/doctor/appointments/new" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Calendar className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Book Doctor Appointment</h3>
                <p className="text-xs text-slate-500 mt-1">Schedule OPD visits & telehealth video consultations.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PatientLayout>
    </ProtectedRoute>
  );
}
