'use client';

import React from 'react';
import { Search, Sparkles, User, FileText, Calendar, ShieldCheck, ArrowRight, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useGlobalSearchStore } from '../../../stores/use-global-search-store';

export function SmartSearchResults() {
  const { results, query } = useGlobalSearchStore();

  const mockAiAnswer = {
    summary: `Based on your search for Rahul Sharma, the patient is a 45-year-old male currently admitted to the Cardiology unit under Dr. Priya Mehta. His serum potassium level was flagged as critical at 6.8 mmol/L at 10:15 AM today.`,
    citations: ['Institutional Hyperkalemia Management Protocol 2026', 'AyuNet EMR Clinical Chart #9918'],
    suggestedActions: [
      { text: 'Order Repeat STAT Electrolytes', route: '/doctor/orders/new' },
      { text: 'Launch AI Consultation Assistant', route: '/ai/copilot' },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Grouped Search Results */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Search Results for &ldquo;<span className="text-teal-600 font-mono">{query || 'Rahul Sharma'}</span>&rdquo;
          </h3>
          <Badge variant="outline" className="text-xs">
            {results.length} Records Found
          </Badge>
        </div>

        <div className="space-y-3">
          {results.map((item) => (
            <Card
              key={item.id}
              className="border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors"
            >
              <CardContent className="p-4 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {item.type === 'PATIENT' ? (
                      <User className="h-4 w-4 text-teal-600" />
                    ) : item.type === 'APPOINTMENT' ? (
                      <Calendar className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                    <Badge variant={item.type === 'LAB_REPORT' ? 'error' : 'primary'} className="text-[10px] font-mono scale-95">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-slate-500 font-mono leading-relaxed">{item.subtitle}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">
                    RBAC: AUTHORIZED
                  </Badge>
                  <p className="text-[10px] text-slate-400">Updated today</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Column: AI Search Assistant */}
      <div className="lg:col-span-4 space-y-4">
        <Card className="border-teal-300 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/20 space-y-3">
          <div className="flex items-center space-x-2 border-b border-teal-200 pb-2 dark:border-teal-900">
            <Sparkles className="h-5 w-5 text-teal-600 shrink-0" />
            <h3 className="text-sm font-bold text-teal-900 dark:text-teal-200">AI Search Summarizer</h3>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {mockAiAnswer.summary}
          </p>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-teal-800 dark:text-teal-400 flex items-center">
              <BookOpen className="mr-1 h-3.5 w-3.5" /> Medical References:
            </p>
            {mockAiAnswer.citations.map((cite) => (
              <p key={cite} className="text-[10px] text-slate-500 font-mono pl-4">
                • {cite}
              </p>
            ))}
          </div>

          <div className="pt-2 border-t border-teal-200 dark:border-teal-900 space-y-2">
            <p className="text-[10px] font-bold text-teal-800 dark:text-teal-400">Suggested Next Steps:</p>
            <div className="flex flex-col gap-2">
              {mockAiAnswer.suggestedActions.map((act) => (
                <button
                  key={act.text}
                  onClick={() => alert(`Navigating to ${act.route}...`)}
                  className="w-full flex items-center justify-between text-left rounded-lg bg-white p-2 border border-teal-200 hover:bg-teal-50 transition-colors text-[11px] font-semibold text-teal-800 dark:bg-slate-900 dark:border-teal-950 dark:text-teal-300"
                >
                  <span>{act.text}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
