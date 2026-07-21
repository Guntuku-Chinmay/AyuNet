'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Palette, Network, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function SettingsDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Enterprise Settings & Configuration Platform
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Centralized tenant configuration for white-label branding, FHIR/HL7 gateways, and security policies.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/settings/branding">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Palette className="mr-2 h-4 w-4" /> Branding & Theme Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Config Compliance Health" value="100%" changePercent={0} description="All policies validated" icon={<ShieldCheck className="h-5 w-5" />} />
            <MetricCard title="Active Integrations" value="5/5" changePercent={0} description="FHIR, HL7, Twilio, WhatsApp" icon={<Network className="h-5 w-5" />} />
            <MetricCard title="Subscription Tier" value="ENTERPRISE" changePercent={0} description="Multi-tenant unlimited" icon={<CreditCard className="h-5 w-5" />} />
            <MetricCard title="Security Enforcement" value="MFA MANDATORY" changePercent={0} description="TOTP & SMS OTP enforced" icon={<Lock className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Modules</CardTitle>
              <CardDescription>Direct navigation to system configuration areas</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/settings/branding" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Palette className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Branding & Theme Engine</h3>
                <p className="text-xs text-slate-500 mt-1">Configure white-label logos, colors, and email headers.</p>
              </Link>
              <Link href="/settings/integrations" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Network className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Integration Gateway</h3>
                <p className="text-xs text-slate-500 mt-1">Manage FHIR R4, HL7 routers, and API secrets.</p>
              </Link>
              <Link href="/settings/security" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Lock className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Security & Audit History</h3>
                <p className="text-xs text-slate-500 mt-1">Configure MFA policies & review configuration change diffs.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
