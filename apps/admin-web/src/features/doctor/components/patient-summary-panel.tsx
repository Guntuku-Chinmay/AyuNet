'use client';

import React from 'react';
import { User, AlertCircle, HeartPulse, ShieldCheck, Phone, CreditCard } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function PatientSummaryPanel() {
  const patient = {
    name: 'Rahul Sharma',
    uhid: 'UHID-2026-9918',
    age: 42,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765-43210',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    chronicConditions: ['Hypertension (Stage 2)', 'Type 2 Diabetes'],
    insurance: 'HDFC Ergo Health (Verified)',
    emergencyContact: 'Priya Sharma (Spouse) - +91 98765-43211',
  };

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            {patient.name[0]}
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">{patient.name}</CardTitle>
            <p className="font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold">{patient.uhid}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 text-xs">
        <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <div>Age / Gender: <span className="font-bold text-slate-900 dark:text-slate-100">{patient.age} / {patient.gender}</span></div>
          <div>Blood Group: <span className="font-bold text-teal-600">{patient.bloodGroup}</span></div>
        </div>

        {/* Recorded Allergies */}
        <div className="space-y-1.5 border-t border-slate-200 pt-3 dark:border-slate-800">
          <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-rose-500" /> Recorded Allergies
          </label>
          <div className="flex flex-wrap gap-1">
            {patient.allergies.map((alg) => (
              <Badge key={alg} variant="error" className="text-[10px]">
                {alg}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="space-y-1.5 border-t border-slate-200 pt-3 dark:border-slate-800">
          <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <HeartPulse className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Active Diagnoses
          </label>
          <div className="flex flex-wrap gap-1">
            {patient.chronicConditions.map((c) => (
              <Badge key={c} variant="warning" className="text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        {/* Insurance & Emergency */}
        <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800 text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>{patient.insurance}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{patient.emergencyContact}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
