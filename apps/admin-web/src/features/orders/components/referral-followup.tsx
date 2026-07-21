'use client';

import React from 'react';
import { Calendar, UserCheck, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { useOrderStore } from '../../../stores/use-order-store';

export function ReferralFollowup() {
  const { followUpDate, setFollowUpDate, isSigned } = useOrderStore();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Specialist Referral Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-teal-600" />
            <span>Specialist Referral Request</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Target Department / Specialty</label>
            <select
              disabled={isSigned}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="">None (No Referral)</option>
              <option value="CARDIO">Cardiology</option>
              <option value="NEURO">Neurology</option>
              <option value="ORTHO">Orthopedics</option>
              <option value="ENDO">Endocrinology</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Reason for Referral</label>
            <textarea
              rows={2}
              disabled={isSigned}
              placeholder="e.g. Specialized cardiac electrophysiology evaluation..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Planner Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>Follow-up Visit & Patient Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <Input
            type="date"
            label="Next Follow-up Visit Date"
            disabled={isSigned}
            value={followUpDate || ''}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Patient Discharge & Dietary Advice</label>
            <textarea
              rows={2}
              disabled={isSigned}
              defaultValue="Low sodium diet (< 2g/day), daily blood pressure log, avoid strenuous exertion."
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
