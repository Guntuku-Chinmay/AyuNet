'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, Shield, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useEmrStore } from '../../../stores/use-emr-store';

export function DiagnosisPicker() {
  const { draft, updateDraft } = useEmrStore();
  const [search, setSearch] = useState('');

  const mockIcd10Results = [
    { code: 'I10', name: 'Essential (primary) hypertension', category: 'Circulatory System' },
    { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', category: 'Endocrine System' },
    { code: 'R07.9', name: 'Chest pain, unspecified', category: 'Symptoms & Signs' },
    { code: 'J45.909', name: 'Unspecified asthma, uncomplicated', category: 'Respiratory System' },
  ];

  const filtered = mockIcd10Results.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addDiagnosis = (item: { code: string; name: string }) => {
    const current = draft.diagnoses || [];
    if (!current.some((d) => d.code === item.code)) {
      updateDraft({
        diagnoses: [...current, { code: item.code, name: item.name, isPrimary: current.length === 0 }],
      });
    }
  };

  const removeDiagnosis = (code: string) => {
    const current = draft.diagnoses || [];
    updateDraft({
      diagnoses: current.filter((d) => d.code !== code),
    });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="py-2.5">
        <CardTitle className="text-xs font-bold flex items-center space-x-2">
          <Shield className="h-4 w-4 text-teal-600" />
          <span>ICD-10 Clinical Diagnosis Coding</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search ICD-10 code or condition (e.g. I10, Hypertension)..."
            className="pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Selected Diagnoses List */}
        <div className="space-y-1.5">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Selected Diagnoses:</p>
          {(draft.diagnoses || []).map((diag) => (
            <div
              key={diag.code}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-2 dark:border-slate-800"
            >
              <div className="flex items-center space-x-2">
                <Badge variant={diag.isPrimary ? 'primary' : 'outline'} className="font-mono text-[10px]">
                  {diag.code}
                </Badge>
                <span className="font-medium text-slate-900 dark:text-slate-100">{diag.name}</span>
                {diag.isPrimary && <Badge variant="success" className="text-[10px]">PRIMARY</Badge>}
              </div>
              <button onClick={() => removeDiagnosis(diag.code)} className="text-rose-500 hover:text-rose-700">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* ICD Search Results Dropdown */}
        {search && (
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 max-h-40 overflow-y-auto space-y-1">
            {filtered.map((item) => (
              <div
                key={item.code}
                onClick={() => addDiagnosis(item)}
                className="flex items-center justify-between rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <div>
                  <span className="font-mono font-bold text-teal-600 mr-2">{item.code}</span>
                  <span>{item.name}</span>
                </div>
                <Plus className="h-3.5 w-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
