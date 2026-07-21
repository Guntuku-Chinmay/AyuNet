'use client';

import React from 'react';
import { X, Calendar, AlertCircle, ShieldAlert, CreditCard, HeartPulse } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { formatFullName } from '../../../utils/formatters';

export interface PatientSummaryData {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  allergies: string[];
  chronicConditions: string[];
  outstandingBalance: number;
  upcomingAppointment?: string;
}

export interface PatientProfileDrawerProps {
  patient: PatientSummaryData | null;
  onClose: () => void;
}

export function PatientProfileDrawer({ patient, onClose }: PatientProfileDrawerProps) {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl dark:bg-slate-900 overflow-y-auto space-y-6 animate-in slide-in-from-right-full">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatFullName(patient.firstName, patient.lastName)}
            </h2>
            <p className="font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold">{patient.uhid}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
            <p className="text-slate-400">Age / Gender</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{patient.age} yrs ({patient.gender[0]})</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
            <p className="text-slate-400">Blood Group</p>
            <p className="font-bold text-teal-600 dark:text-teal-400">{patient.bloodGroup}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
            <p className="text-slate-400">Balance</p>
            <p className="font-bold text-rose-600">₹{patient.outstandingBalance}</p>
          </div>
        </div>

        {/* Clinical Allergies */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
            <AlertCircle className="mr-1.5 h-4 w-4 text-rose-500" /> Recorded Allergies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.length === 0 ? (
              <span className="text-xs text-slate-400">No known allergies.</span>
            ) : (
              patient.allergies.map((alg) => (
                <Badge key={alg} variant="error" className="text-[10px]">
                  {alg}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
            <HeartPulse className="mr-1.5 h-4 w-4 text-amber-500" /> Chronic Conditions
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {patient.chronicConditions.map((c) => (
              <Badge key={c} variant="warning" className="text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        {/* Upcoming Appointment */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>Upcoming Consult</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {patient.upcomingAppointment || 'No active appointment scheduled for today.'}
          </p>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm">Check-in Patient</Button>
        </div>
      </div>
    </div>
  );
}
