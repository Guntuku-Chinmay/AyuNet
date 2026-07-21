'use client';

import React from 'react';
import Link from 'next/link';
import { Send, MessageSquare, FileCode, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function CommunicationDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Enterprise Communication & Notification Hub
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Centralized message dispatch across Email, SMS, WhatsApp, and In-App Push channels.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/communications/composer">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Send className="mr-2 h-4 w-4" /> Compose Message
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Dispatched Today" value="1,240" changePercent={18.4} description="Multi-channel notifications" icon={<Send className="h-5 w-5" />} />
            <MetricCard title="Delivery Success Rate" value="99.4%" changePercent={0.2} description="1,232 Delivered" icon={<CheckCircle2 className="h-5 w-5" />} />
            <MetricCard title="Active Inbox Threads" value="14" changePercent={-10} description="Patient & Doctor consults" icon={<MessageSquare className="h-5 w-5" />} />
            <MetricCard title="Scheduled Campaigns" value="3" changePercent={0} description="Vaccination & Wellness alerts" icon={<Clock className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Communication Workstation Shortcuts</CardTitle>
              <CardDescription>Direct navigation to notification tools</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/communications/inbox" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <MessageSquare className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Threaded Message Inbox</h3>
                <p className="text-xs text-slate-500 mt-1">Review active patient & doctor conversation threads.</p>
              </Link>
              <Link href="/communications/composer" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Send className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Message Composer</h3>
                <p className="text-xs text-slate-500 mt-1">Compose & dispatch targeted WhatsApp, SMS, or Email alerts.</p>
              </Link>
              <Link href="/communications/templates" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <FileCode className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notification Templates</h3>
                <p className="text-xs text-slate-500 mt-1">Manage reusable message templates & variable placeholders.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
