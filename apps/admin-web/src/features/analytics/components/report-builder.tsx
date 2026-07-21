'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';
import { reportBuilderSchema, ReportBuilderInputs } from '../schemas/analytics-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export function ReportBuilder() {
  const [exportedFile, setExportedFile] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportBuilderInputs>({
    resolver: zodResolver(reportBuilderSchema),
    defaultValues: {
      dataset: 'REVENUE',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-21',
      format: 'CSV',
    },
  });

  const onSubmit = async (data: ReportBuilderInputs) => {
    setExportedFile(`AyuNet_Report_${data.dataset}_${data.dateFrom}_to_${data.dateTo}.${data.format.toLowerCase()}`);
  };

  return (
    <Card className="max-w-3xl mx-auto border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-teal-600" />
          <span>Custom BI Report Builder & Export Center</span>
        </CardTitle>
        <CardDescription>Select datasets, date ranges, and export clean CSV, Excel, or PDF reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Target Dataset *</label>
            <select
              {...register('dataset')}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="REVENUE">Hospital Financial Revenue & Invoicing</option>
              <option value="APPOINTMENTS">OPD Appointments & Doctor Utilization</option>
              <option value="LAB_TESTS">Diagnostic Pathology & Turnaround Times</option>
              <option value="PHARMACY_DISPENSING">Pharmacy Dispensing & Inventory FEFO</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Start Date *" type="date" error={errors.dateFrom?.message} {...register('dateFrom')} />
            <Input label="End Date *" type="date" error={errors.dateTo?.message} {...register('dateTo')} />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Export File Format *</label>
            <select
              {...register('format')}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="CSV">CSV - Comma Separated Values</option>
              <option value="EXCEL">EXCEL - Microsoft Excel Spreadsheet (.xlsx)</option>
              <option value="PDF">PDF - Encrypted Document (.pdf)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
              <Download className="mr-1.5 h-4 w-4" /> Generate & Export Report
            </Button>
          </div>
        </form>

        {exportedFile && (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-xs dark:border-emerald-900 dark:bg-emerald-950/40 space-y-2 animate-in fade-in-0">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Report Generated Successfully!</span>
            </div>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">File: {exportedFile}</p>
            <Button size="sm" variant="outline" onClick={() => alert(`Downloading ${exportedFile}...`)}>
              <Download className="mr-1 h-3.5 w-3.5" /> Download File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
