'use client';

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Check, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useEmrStore } from '../../../stores/use-emr-store';

export function AiAssistantPanel() {
  const { updateDraft } = useEmrStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);

  const handleGenerateAiSoap = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedDraft(
        `SUBJECTIVE: 42-year-old male with persistent chest tightness for 3 days.\nOBJECTIVE: BP 128/84 mmHg, HR 74 bpm. Normal S1/S2.\nASSESSMENT: Stage 2 Hypertension, Exertional Angina Rule-Out.\nPLAN: 12-lead ECG, Troponin I, Telmisartan 40mg daily.`
      );
      setIsGenerating(false);
    }, 1200);
  };

  const handleAcceptAiDraft = () => {
    if (generatedDraft) {
      updateDraft({
        subjective: '42-year-old male presenting with exertional chest tightness for 3 days.',
        assessment: 'Stage 2 Essential Hypertension, Exertional Angina Rule-Out.',
      });
      setGeneratedDraft(null);
    }
  };

  return (
    <Card className="border-teal-300 bg-teal-50/40 dark:border-teal-900 dark:bg-teal-950/20">
      <CardHeader className="py-2.5">
        <CardTitle className="text-xs font-bold flex items-center justify-between text-teal-900 dark:text-teal-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span>AI Clinical Documentation Drafter</span>
          </div>
          <Badge variant="warning" className="text-[9px]">CLINICIAN REVIEW REQUIRED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Generate structured SOAP notes automatically from triage notes and clinical speech input.
        </p>

        <Button
          size="sm"
          onClick={handleGenerateAiSoap}
          isLoading={isGenerating}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Auto-Generate Draft SOAP Note
        </Button>

        {generatedDraft && (
          <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40 animate-in fade-in-0">
            <div className="flex items-center space-x-1 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>AI Output (Requires Licensed Clinician Sign-Off)</span>
            </div>
            <pre className="font-mono text-[10px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {generatedDraft}
            </pre>
            <Button size="sm" onClick={handleAcceptAiDraft} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Check className="mr-1.5 h-3.5 w-3.5" /> Accept & Populate EMR SOAP Note
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
