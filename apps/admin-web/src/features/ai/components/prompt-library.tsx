'use client';

import React from 'react';
import { Sparkles, FileText, Bookmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function PromptLibrary() {
  const prompts = [
    { title: 'Clinical SOAP Note Draft Generator', category: 'CLINICAL', desc: 'Synthesizes subjective complaints, vitals, ICD-10 diagnosis, and medication orders into structured SOAP note.' },
    { title: 'Patient Discharge Summary Template', category: 'CLINICAL', desc: 'Generates comprehensive hospital discharge summary including hospital course and follow-up plan.' },
    { title: 'Executive BI Revenue Summary Draft', category: 'ADMINISTRATIVE', desc: 'Summarizes monthly hospital billing, department revenue distribution, and bed occupancy trends.' },
    { title: 'Patient Medication Guide (Layman Terms)', category: 'PATIENT_EDUCATION', desc: 'Translates prescription instructions and side effects into patient-friendly language.' },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <span>AyuNet Enterprise AI Prompt Library</span>
        </CardTitle>
        <CardDescription>Pre-validated clinical templates and administrative prompt shortcuts.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {prompts.map((p) => (
          <div key={p.title} className="rounded-xl border border-slate-200 p-4 hover:border-teal-500 transition-colors dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100">{p.title}</span>
              <Badge variant="primary" className="text-[10px]">{p.category}</Badge>
            </div>
            <p className="text-slate-500 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
