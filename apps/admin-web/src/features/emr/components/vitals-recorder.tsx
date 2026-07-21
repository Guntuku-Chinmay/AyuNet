'use client';

import React from 'react';
import { Activity, Heart, Thermometer, Wind, Weight, Ruler } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { useEmrStore } from '../../../stores/use-emr-store';

export function VitalsRecorder() {
  const { draft, updateDraft } = useEmrStore();
  const vitals = draft.vitals || {};

  const handleVitalChange = (key: string, value: any) => {
    updateDraft({
      vitals: {
        ...vitals,
        [key]: Number(value),
      },
    });
  };

  const calculateBmi = () => {
    if (vitals.weightKg && vitals.heightCm) {
      const heightMeters = vitals.heightCm / 100;
      const bmi = vitals.weightKg / (heightMeters * heightMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBmi();

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="py-2.5">
        <CardTitle className="text-xs font-bold flex items-center space-x-2">
          <Activity className="h-4 w-4 text-teal-600" />
          <span>Patient Triage Vital Signs & Physical Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 text-xs">
        <Input
          label="BP Systolic (mmHg)"
          type="number"
          value={vitals.bpSystolic || ''}
          onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
        />
        <Input
          label="BP Diastolic (mmHg)"
          type="number"
          value={vitals.bpDiastolic || ''}
          onChange={(e) => handleVitalChange('bpDiastolic', e.target.value)}
        />
        <Input
          label="Heart Rate (bpm)"
          type="number"
          value={vitals.heartRate || ''}
          onChange={(e) => handleVitalChange('heartRate', e.target.value)}
        />
        <Input
          label="SpO2 (%)"
          type="number"
          value={vitals.spO2 || ''}
          onChange={(e) => handleVitalChange('spO2', e.target.value)}
        />
        <Input
          label="Weight (kg)"
          type="number"
          value={vitals.weightKg || ''}
          onChange={(e) => handleVitalChange('weightKg', e.target.value)}
        />
        <Input
          label="Height (cm)"
          type="number"
          value={vitals.heightCm || ''}
          onChange={(e) => handleVitalChange('heightCm', e.target.value)}
        />
        {bmi && (
          <div className="col-span-2 sm:col-span-4 lg:col-span-6 flex items-center justify-between rounded-lg bg-teal-50 p-2 text-teal-950 dark:bg-teal-950/40 dark:text-teal-200">
            <span className="font-semibold">Calculated Body Mass Index (BMI):</span>
            <span className="font-mono font-bold text-sm">{bmi} kg/m² (Normal Weight)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
