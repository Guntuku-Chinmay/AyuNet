'use client';

import React from 'react';
import { History, Settings, Cpu, Search, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useAiStore } from '../../../stores/use-ai-store';

export function AiHistoryManager() {
  const { selectedModel, setSelectedModel } = useAiStore();

  const history = [
    { id: '1', title: 'Cardiology Visit SOAP Note - Rahul Sharma', date: '2026-07-21 10:30 AM', category: 'CLINICAL' },
    { id: '2', title: 'Serum Potassium 6.8 mmol/L Result Explanation', date: '2026-07-20 04:15 PM', category: 'LAB_EXPLANATION' },
  ];

  return (
    <div className="space-y-6">
      {/* Provider & Model Configuration Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <span>LLM Provider & Model Settings</span>
          </CardTitle>
          <CardDescription>Configure provider-agnostic healthcare LLM models.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Active Healthcare Model *</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="Gemini 1.5 Pro Healthcare">Gemini 1.5 Pro Healthcare (Recommended)</option>
              <option value="Med-PaLM 2 Clinical">Med-PaLM 2 Clinical Specialized</option>
              <option value="Claude 3.5 Sonnet Medical">Claude 3.5 Sonnet Medical Edition</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* AI Conversation History Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-teal-600" />
            <span>AI Copilot Conversation History</span>
          </CardTitle>
          <CardDescription>Search and bookmark previous AI assistant interactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{h.title}</p>
                <p className="font-mono text-[10px] text-slate-400">{h.date}</p>
              </div>
              <Badge variant="primary" className="text-[10px]">{h.category}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
