'use client';

import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle, TestTube, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useLabStore } from '../../../stores/use-lab-store';

export function SampleCollection() {
  const { worklist, updateStatus } = useLabStore();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItem, setScannedItem] = useState<any | null>(null);

  const handleScan = () => {
    const found = worklist.find((w) => w.barcode.toLowerCase() === barcodeInput.toLowerCase() || w.sampleId.toLowerCase() === barcodeInput.toLowerCase());
    if (found) {
      setScannedItem(found);
    } else {
      setScannedItem(null);
    }
  };

  const handleConfirmCollection = (id: string) => {
    updateStatus(id, 'PROCESSING');
    setScannedItem(null);
    setBarcodeInput('');
  };

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-teal-600" />
          <span>Specimen Collection & Barcode Verification</span>
        </CardTitle>
        <CardDescription>Scan sample barcode or search order ID to verify patient specimen intake.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="flex space-x-2">
          <Input
            placeholder="Scan barcode or enter Sample ID (e.g. BC-99182, SMP-8819)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
          />
          <Button onClick={handleScan} className="bg-teal-600 hover:bg-teal-700">
            <Search className="mr-1.5 h-4 w-4" /> Scan Barcode
          </Button>
        </div>

        {scannedItem && (
          <div className="rounded-xl border border-teal-300 bg-teal-50/50 p-4 space-y-3 dark:border-teal-900 dark:bg-teal-950/20 animate-in fade-in-0">
            <div className="flex items-center justify-between border-b border-teal-200 pb-2 dark:border-teal-900">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{scannedItem.patientName}</p>
                <p className="font-mono text-xs text-teal-700 dark:text-teal-300">{scannedItem.uhid}</p>
              </div>
              <Badge variant="primary" className="font-mono">{scannedItem.barcode}</Badge>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Requisitioned Test:</p>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{scannedItem.testName}</p>
              <p className="text-slate-500 font-mono">Specimen Type: {scannedItem.specimenType}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => handleConfirmCollection(scannedItem.id)} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm Specimen Intake
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
