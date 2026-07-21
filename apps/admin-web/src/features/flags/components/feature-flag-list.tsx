'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { FeatureFlag } from '../services/flag-service';

export function FeatureFlagList() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    { key: 'AI_CLINICAL_BOT', name: 'Clinical AI Medical Assistant', description: 'Enable LLM-assisted medical note generation and patient chatbot', enabled: true, isBeta: false },
    { key: 'TELEHEALTH_PORTAL', name: 'Video Telehealth Consultations', description: 'Enable WebRTC video consultation rooms for remote appointments', enabled: true, isBeta: false },
    { key: 'HL7_FHIR_SYNC', name: 'HL7 FHIR R4 Interoperability', description: 'Automatic real-time FHIR Patient & DiagnosticReport sync', enabled: true, isBeta: true },
    { key: 'WHATSAPP_NOTIFICATIONS', name: 'WhatsApp Appointment Reminders', description: 'Dispatch automated WhatsApp status updates to patient phones', enabled: false, isBeta: true },
    { key: 'ADVANCED_ANALYTICS', name: 'BI Predictive Revenue Analytics', description: 'Enable machine-learning revenue projection & occupancy forecasts', enabled: true, isBeta: false },
  ]);

  const toggleFlag = (key: string) => {
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <span>Tenant Feature Flag & Beta Module Controls</span>
        </CardTitle>
        <CardDescription>Enable or disable feature modules dynamically per hospital tenant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{flag.name}</span>
                {flag.isBeta && (
                  <Badge variant="warning" className="text-[10px]">
                    <Sparkles className="mr-1 h-3 w-3" /> Beta Feature
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500">{flag.description}</p>
              <p className="font-mono text-[10px] text-slate-400">Flag Key: {flag.key}</p>
            </div>

            <button onClick={() => toggleFlag(flag.key)} className="text-teal-600 focus:outline-none">
              {flag.enabled ? (
                <ToggleRight className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-400" />
              )}
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
