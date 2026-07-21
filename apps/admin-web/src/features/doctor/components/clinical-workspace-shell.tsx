'use client';

import React from 'react';
import { Stethoscope, CheckCircle2, AlertTriangle, Activity, User, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { PatientSummaryPanel } from './patient-summary-panel';
import { ClinicalTimeline } from './clinical-timeline';
import { DoctorQuickActions } from './doctor-quick-actions';
import { useDoctorWorkspaceStore } from '../../../stores/use-doctor-workspace-store';

export function ClinicalWorkspaceShell() {
  const { activeTab, setActiveTab } = useDoctorWorkspaceStore();

  return (
    <div className="space-y-6">
      {/* Consultation Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/20 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-3">
          <Badge variant="primary" className="font-mono text-sm px-3 py-1 animate-pulse">
            ACTIVE SESSION: A-012
          </Badge>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Consultation with Rahul Sharma
            </h2>
            <p className="text-xs text-slate-500 font-mono">UHID-2026-9918 | Doctor: Dr. Priya Mehta (Cardiology)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Clock className="mr-1.5 h-3.5 w-3.5" /> Session Duration: 08:42
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Complete Consultation
          </Button>
        </div>
      </div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Patient Summary */}
        <div className="lg:col-span-3">
          <PatientSummaryPanel />
        </div>

        {/* Center Column: Clinical Consultation Workspace */}
        <div className="space-y-6 lg:col-span-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <span>Clinical Evaluation & Vitals</span>
                </CardTitle>
                <div className="flex space-x-1">
                  {(['OVERVIEW', 'SOAP_NOTE', 'PRESCRIPTION', 'LAB_ORDER'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors ${
                        activeTab === tab
                          ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'border-slate-300 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Triage Vitals Banner */}
              <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Blood Pressure</p>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">128/84 mmHg</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Heart Rate</p>
                  <p className="font-mono text-sm font-bold text-teal-600">74 bpm</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">SpO2</p>
                  <p className="font-mono text-sm font-bold text-emerald-600">99%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Body Temp</p>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">98.6 °F</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Chief Complaint & Triage Notes</label>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900/50 leading-relaxed text-slate-700 dark:text-slate-300">
                  Patient reports persistent mild chest tightness over past 3 days following exertion. No radiation to left arm or jaw. No nausea. Currently taking Telmisartan 40mg daily.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Panel: Historical Timeline */}
          <ClinicalTimeline />
        </div>

        {/* Right Column: Quick Actions & Clinical AI */}
        <div className="lg:col-span-3">
          <DoctorQuickActions />
        </div>
      </div>
    </div>
  );
}
