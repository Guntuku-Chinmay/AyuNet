'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Printer, CheckCircle2, KeyRound } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { useOrderStore } from '../../../stores/use-order-store';

export function OrderSummarySignature() {
  const { medications, labOrders, imagingOrders, followUpDate, isSigned, markSigned } = useOrderStore();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const handleAuthenticateSignature = () => {
    if (pin.length >= 4) {
      setIsSigning(true);
      setTimeout(() => {
        setIsSigning(false);
        setIsPinModalOpen(false);
        markSigned();
      }, 1000);
    }
  };

  return (
    <Card className={isSigned ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800'}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Consolidated Order Summary & Digital Signature</span>
          </CardTitle>
          {isSigned ? (
            <Badge variant="success" className="font-mono text-xs px-3 py-1">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> SIGNED & TRANSMITTED
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px]">DRAFT REQUISITION</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center font-semibold">
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
            <p className="text-slate-400">Prescriptions</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{medications.length} Medications</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
            <p className="text-slate-400">Lab Orders</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{labOrders.length} Tests</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
            <p className="text-slate-400">Imaging Requisitions</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{imagingOrders.length} Studies</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
            <p className="text-slate-400">Next Follow-up</p>
            <p className="text-base font-bold text-teal-600">{followUpDate || 'Not set'}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end space-x-2">
          {isSigned ? (
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Official Signed Prescription
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsPinModalOpen(true)} className="bg-teal-600 hover:bg-teal-700">
              <Lock className="mr-1.5 h-3.5 w-3.5" /> Authenticate Digital Signature & Dispatch
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Doctor Digital Signature PIN Authentication"
        description="Enter your 4-digit security PIN to apply digital signature and lock order"
      >
        <div className="space-y-4 text-xs">
          <Input
            type="password"
            maxLength={4}
            placeholder="Enter 4-digit PIN..."
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsPinModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isSigning} onClick={handleAuthenticateSignature} className="bg-emerald-600 hover:bg-emerald-700">
              Sign & Lock Order
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
