'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useDashboardStore } from '../../../stores/use-dashboard-store';
import { Button } from '../../../components/ui/button';
import { TotalPatientsWidget } from './widgets/total-patients-widget';
import { TodayAppointmentsWidget } from './widgets/today-appointments-widget';
import { DoctorsOnDutyWidget } from './widgets/doctors-on-duty-widget';
import { RevenueWidget } from './widgets/revenue-widget';
import { RecentActivityWidget } from './widgets/recent-activity-widget';

export function DashboardGrid() {
  const { widgets, toggleWidget, resetLayout } = useDashboardStore();
  const [showConfig, setShowConfig] = React.useState(false);

  const isVisible = (id: string) => widgets.find((w) => w.id === id)?.visible ?? true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Executive Command Center
          </h2>
          <p className="text-xs text-slate-500">Configurable real-time metric widgets & clinical telemetry</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Customize Layout
          </Button>
          {showConfig && (
            <Button variant="ghost" size="sm" onClick={resetLayout} title="Reset to default">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {showConfig && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-0">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Toggle Widget Visibility:</p>
          <div className="flex flex-wrap gap-2">
            {widgets.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  w.visible
                    ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950'
                }`}
              >
                {w.visible ? '✓ ' : '+ '} {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isVisible('total-patients') && <TotalPatientsWidget />}
        {isVisible('today-appointments') && <TodayAppointmentsWidget />}
        {isVisible('doctors-on-duty') && <DoctorsOnDutyWidget />}
        {isVisible('revenue') && <RevenueWidget />}
      </div>

      {/* Activity & Operational Feed */}
      {isVisible('recent-activity') && <RecentActivityWidget />}
    </div>
  );
}
