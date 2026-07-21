'use client';

import React, { useState } from 'react';
import { PackageCheck, Printer, CheckCircle2, QrCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Dialog } from '../../../components/ui/dialog';
import { usePharmacyStore } from '../../../stores/use-pharmacy-store';

export function MedicationDispensing() {
  const { queue, updateStatus } = usePharmacyStore();
  const verifiedQueue = queue.filter((q) => q.status === 'VERIFIED');
  const [printLabelItem, setPrintLabelItem] = useState<any | null>(null);

  const mockBatches = [
    { batchNumber: 'B-2026-081', expiryDate: '2026-11-30', availableQty: 450, location: 'Shelf A-04 (FEFO Pick)' },
    { batchNumber: 'B-2026-102', expiryDate: '2027-04-15', availableQty: 1200, location: 'Shelf A-05' },
  ];

  const handleCompleteDispensing = (id: string) => {
    updateStatus(id, 'DISPENSED');
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            <span>FEFO Medication Dispensing & Labeling</span>
          </CardTitle>
          <CardDescription>First-Expired, First-Out batch selection and label generation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rx Number</TableHead>
                <TableHead>Patient Name & UHID</TableHead>
                <TableHead>FEFO Recommended Batch</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Stock Location</TableHead>
                <TableHead className="text-right">Dispensing Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifiedQueue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                    No verified prescriptions ready for dispensing.
                  </TableCell>
                </TableRow>
              ) : (
                verifiedQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold">{item.prescriptionNumber}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.patientName}</p>
                      <p className="font-mono text-[10px] text-slate-500">{item.uhid}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" className="font-mono">{mockBatches[0].batchNumber}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-600 font-semibold">{mockBatches[0].expiryDate}</TableCell>
                    <TableCell className="text-xs text-slate-500">{mockBatches[0].location}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setPrintLabelItem(item)}>
                          <Printer className="mr-1 h-3.5 w-3.5" /> Print Label
                        </Button>
                        <Button size="sm" onClick={() => handleCompleteDispensing(item.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Complete Dispense
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        isOpen={!!printLabelItem}
        onClose={() => setPrintLabelItem(null)}
        title="Thermal Medication Label Preview"
        description="Label preview for pharmacy container sticker"
      >
        {printLabelItem && (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-dashed border-slate-300 p-6 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-sm text-teal-600">AyuNet Pharmacy Services</p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{printLabelItem.patientName}</h2>
              <p className="font-mono text-[10px] text-slate-500">{printLabelItem.uhid} | Rx: {printLabelItem.prescriptionNumber}</p>
              <div className="rounded bg-slate-100 p-2 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                Telmisartan 40mg - Take 1 Tablet Oral Daily After Food
              </div>
              <p className="text-[10px] text-slate-400">Batch: B-2026-081 | Exp: 2026-11-30 | Dispensed by: R. Verma (Reg Pharmacist)</p>
            </div>
            <Button className="w-full" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print Thermal Sticker
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
