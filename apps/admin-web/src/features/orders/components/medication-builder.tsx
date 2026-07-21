'use client';

import React, { useState } from 'react';
import { Pill, Plus, Trash2, AlertTriangle, ShieldCheck, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useOrderStore } from '../../../stores/use-order-store';

export function MedicationBuilder() {
  const { medications, addMedication, removeMedication, isSigned } = useOrderStore();
  const [search, setSearch] = useState('');
  const [strength, setStrength] = useState('500 mg');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState(7);
  const [foodTiming, setFoodTiming] = useState('After Food');
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);

  const mockFormulary = [
    { name: 'Amoxicillin + Clavulanate (Augmentin)', strength: '625 mg' },
    { name: 'Atorvastatin (Lipivas)', strength: '10 mg' },
    { name: 'Amlodipine (Stamlo)', strength: '5 mg' },
    { name: 'Pantoprazole (Pan-40)', strength: '40 mg' },
    { name: 'Paracetamol (Dolo 650)', strength: '650 mg' },
  ];

  const handleAdd = (name: string, str: string) => {
    addMedication({
      id: `med-${Date.now()}`,
      name,
      strength: str,
      dosage: '1 Tablet',
      frequency,
      route: 'Oral',
      durationDays: duration,
      foodTiming,
    });
    setSearch('');
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <Pill className="h-4 w-4 text-emerald-600" />
          <span>Electronic Prescription Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* Safety Warning Banner */}
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/40 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-rose-800 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <span>CLINICAL SAFETY WARNING: Drug-Drug & Allergy Interaction</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300">
            Patient has a recorded <span className="font-semibold text-rose-600">Penicillin Allergy</span>. Ensure prescribed antibiotics do not contain beta-lactam rings.
          </p>
          <label className="flex items-center space-x-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={acknowledgedWarning}
              onChange={(e) => setAcknowledgedWarning(e.target.checked)}
              className="h-4 w-4 rounded border-rose-400 text-rose-600 focus:ring-rose-500"
            />
            <span className="font-semibold text-rose-900 dark:text-rose-200">
              I acknowledge and override interaction warning for clinical reason
            </span>
          </label>
        </div>

        {/* Formulary Search Input */}
        {!isSigned && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search hospital formulary by generic/brand name (e.g. Augmentin, Dolo)..."
                className="pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {search && (
              <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 max-h-36 overflow-y-auto space-y-1">
                {mockFormulary
                  .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
                  .map((med) => (
                    <div
                      key={med.name}
                      onClick={() => handleAdd(med.name, med.strength)}
                      className="flex items-center justify-between rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 mr-2">{med.name}</span>
                        <span className="font-mono text-slate-400">({med.strength})</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Prescribed Medications List Table */}
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Configured Rx Items ({medications.length}):</p>
          {medications.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{m.name}</span>
                  <Badge variant="primary" className="font-mono text-[10px]">
                    {m.strength}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  {m.frequency} | {m.route} | {m.durationDays} Days | {m.foodTiming}
                </p>
              </div>

              {!isSigned && (
                <button onClick={() => removeMedication(m.id)} className="text-rose-500 hover:text-rose-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
