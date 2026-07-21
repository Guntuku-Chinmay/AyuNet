'use client';

import React from 'react';
import Link from 'next/link';
import { Folder, UploadCloud, FileText, HardDrive, ShieldCheck, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MetricCard } from '../../../components/common/metric-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function DocumentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'RECEPTIONIST']}>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Enterprise Document Management System (DMS) Hub
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Secure metadata-driven file repository across EMR records, DICOM radiology studies, and pathology reports.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/documents/upload">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Storage Quota Used" value="420 GB" changePercent={5.4} description="42% of 1000 GB Capacity" icon={<HardDrive className="h-5 w-5" />} />
            <MetricCard title="Total Files Stored" value="12,840" changePercent={12.0} description="PDFs, DICOM, Lab Reports" icon={<FileText className="h-5 w-5" />} />
            <MetricCard title="AI-Indexed Records" value="8,420" changePercent={15.2} description="Searchable OCR text" icon={<Sparkles className="h-5 w-5" />} />
            <MetricCard title="Retention Compliance" value="100%" changePercent={0} description="HIPAA 7-Year retention policy" icon={<ShieldCheck className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>DMS Workstation Shortcuts</CardTitle>
              <CardDescription>Direct navigation to document management tools</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/documents/explorer" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <Folder className="h-6 w-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Global Document Explorer</h3>
                <p className="text-xs text-slate-500 mt-1">Browse files in Grid or List view & launch presigned previewers.</p>
              </Link>
              <Link href="/documents/upload" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <UploadCloud className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Resumable File Upload Center</h3>
                <p className="text-xs text-slate-500 mt-1">Upload clinical files with confidentiality tags.</p>
              </Link>
              <Link href="/documents/versions" className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800">
                <FileText className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Version History & Sharing</h3>
                <p className="text-xs text-slate-500 mt-1">Review document revision timelines & generate time-limited share links.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
