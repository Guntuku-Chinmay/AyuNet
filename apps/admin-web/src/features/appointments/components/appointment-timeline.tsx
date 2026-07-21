import React from 'react';
import { CheckCircle2, Clock, Calendar, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface TimelineStep {
  title: string;
  timestamp?: string;
  completed: boolean;
  active?: boolean;
}

export function AppointmentTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex items-center justify-between w-full py-4 px-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step.title}>
          <div className="flex flex-col items-center text-center space-y-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                step.completed
                  ? 'bg-emerald-600 text-white shadow-md'
                  : step.active
                  ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-950 animate-pulse'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {step.completed ? <Check className="h-4 w-4" /> : idx + 1}
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{step.title}</p>
            {step.timestamp && <p className="text-[10px] text-slate-400 font-mono">{step.timestamp}</p>}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1 mx-2 transition-all',
                step.completed ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
