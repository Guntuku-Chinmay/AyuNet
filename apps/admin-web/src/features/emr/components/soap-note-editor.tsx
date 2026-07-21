'use client';

import React, { useState } from 'react';
import { FileEdit, Save, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useEmrStore } from '../../../stores/use-emr-store';

export function SoapNoteEditor() {
  const { draft, updateDraft, lastAutoSaved, isDirty, markSaved } = useEmrStore();
  const [isLocked, setIsLocked] = useState(false);

  const handleSave = () => {
    markSaved();
  };

  const handleFinalize = () => {
    setIsLocked(true);
    markSaved();
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <FileEdit className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-base font-bold">SOAP Clinical Progress Note</CardTitle>
            {isLocked && <Badge variant="error"><Lock className="mr-1 h-3 w-3" /> RECORD LOCKED</Badge>}
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] text-slate-400">
              {isDirty ? 'Unsaved changes...' : `Auto-saved: ${lastAutoSaved}`}
            </span>
            {!isLocked && (
              <Button size="sm" variant="outline" onClick={handleSave}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Draft
              </Button>
            )}
            {!isLocked && (
              <Button size="sm" onClick={handleFinalize} className="bg-emerald-600 hover:bg-emerald-700">
                <Lock className="mr-1.5 h-3.5 w-3.5" /> Sign & Finalize EMR
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 text-xs">
        {/* S - Subjective */}
        <div className="space-y-1">
          <label className="font-bold text-teal-700 dark:text-teal-400">S - SUBJECTIVE (Chief Complaint & HPI)</label>
          <textarea
            rows={3}
            disabled={isLocked}
            value={draft.subjective}
            onChange={(e) => updateDraft({ subjective: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-60"
          />
        </div>

        {/* O - Objective */}
        <div className="space-y-1">
          <label className="font-bold text-teal-700 dark:text-teal-400">O - OBJECTIVE (Physical Examination & Vitals)</label>
          <textarea
            rows={3}
            disabled={isLocked}
            value={draft.objective}
            onChange={(e) => updateDraft({ objective: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-60"
          />
        </div>

        {/* A - Assessment */}
        <div className="space-y-1">
          <label className="font-bold text-teal-700 dark:text-teal-400">A - ASSESSMENT (Differential & Working Diagnosis)</label>
          <textarea
            rows={2}
            disabled={isLocked}
            value={draft.assessment}
            onChange={(e) => updateDraft({ assessment: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-60"
          />
        </div>

        {/* P - Plan */}
        <div className="space-y-1">
          <label className="font-bold text-teal-700 dark:text-teal-400">P - PLAN (Medications, Lab Orders & Instructions)</label>
          <textarea
            rows={3}
            disabled={isLocked}
            value={draft.plan}
            onChange={(e) => updateDraft({ plan: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-60"
          />
        </div>
      </CardContent>
    </Card>
  );
}
