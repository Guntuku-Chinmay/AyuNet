'use client';

import React from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { useUIStore } from '../../../stores/use-ui-store';
import { usePreferenceStore } from '../../../stores/use-preference-store';
import { Button } from '../../../components/ui/button';

export function PreferencesModal() {
  const { activeModalId, closeModal } = useUIStore();
  const { preferences, updatePreferences } = usePreferenceStore();

  const isOpen = activeModalId === 'user-preferences';

  return (
    <Dialog isOpen={isOpen} onClose={closeModal} title="User Preferences" description="Configure your workspace formatting and alert settings">
      <div className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Preferred Language</label>
          <select
            value={preferences.language}
            onChange={(e) => updatePreferences({ language: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="en">English (US/UK)</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Time Format</label>
          <div className="flex space-x-3">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="timeFormat"
                value="12h"
                checked={preferences.timeFormat === '12h'}
                onChange={() => updatePreferences({ timeFormat: '12h' })}
              />
              <span>12-Hour (10:30 AM)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="timeFormat"
                value="24h"
                checked={preferences.timeFormat === '24h'}
                onChange={() => updatePreferences({ timeFormat: '24h' })}
              />
              <span>24-Hour (10:30)</span>
            </label>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Real-Time Email Notifications</span>
            <input
              type="checkbox"
              checked={preferences.emailAlerts}
              onChange={(e) => updatePreferences({ emailAlerts: e.target.checked })}
              className="h-4 w-4 rounded text-teal-600"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>Push Notifications</span>
            <input
              type="checkbox"
              checked={preferences.pushAlerts}
              onChange={(e) => updatePreferences({ pushAlerts: e.target.checked })}
              className="h-4 w-4 rounded text-teal-600"
            />
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={closeModal} size="sm">
            Save Preferences
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
