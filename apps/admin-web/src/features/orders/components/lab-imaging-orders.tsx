'use client';

import React, { useState } from 'react';
import { TestTube, FileScan, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useOrderStore } from '../../../stores/use-order-store';

export function LabImagingOrders() {
  const { labOrders, imagingOrders, addLabOrder, removeLabOrder, addImagingOrder, isSigned } = useOrderStore();

  const handleAddLab = (code: string, name: string) => {
    if (!labOrders.some((l) => l.testCode === code)) {
      addLabOrder({ testCode: code, testName: name, urgency: 'ROUTINE' });
    }
  };

  const handleAddImaging = (modality: any, bodyPart: string) => {
    addImagingOrder({ modality, bodyPart, clinicalHistory: 'Diagnostic evaluation' });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Laboratory Orders Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <TestTube className="h-4 w-4 text-indigo-500" />
            <span>Pathology & Laboratory Requisitions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {!isSigned && (
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => handleAddLab('L-103', 'Complete Blood Count (CBC)')}>
                + CBC
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddLab('L-104', 'HbA1c Glycated Hemoglobin')}>
                + HbA1c
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddLab('L-105', 'Liver Function Test (LFT)')}>
                + LFT
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            {labOrders.map((lab) => (
              <div
                key={lab.testCode}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2 dark:border-slate-800"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="primary" className="font-mono text-[10px]">
                    {lab.testCode}
                  </Badge>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{lab.testName}</span>
                </div>
                {!isSigned && (
                  <button onClick={() => removeLabOrder(lab.testCode)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radiology Imaging Orders Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <FileScan className="h-4 w-4 text-amber-500" />
            <span>Radiology & Imaging Requisitions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {!isSigned && (
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => handleAddImaging('X_RAY', 'Chest PA View')}>
                + X-Ray Chest
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddImaging('CT', 'CT Brain Non-Contrast')}>
                + CT Brain
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddImaging('ULTRASOUND', 'USG Abdomen & Pelvis')}>
                + USG Abdomen
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            {imagingOrders.map((img, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2 dark:border-slate-800"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="warning" className="font-mono text-[10px]">
                    {img.modality}
                  </Badge>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{img.bodyPart}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
