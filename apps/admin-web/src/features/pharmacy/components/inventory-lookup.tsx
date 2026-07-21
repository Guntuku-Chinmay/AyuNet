'use client';

import React from 'react';
import { Package, ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

export function InventoryLookup() {
  const stockItems = [
    { code: 'MED-101', name: 'Telmisartan 40mg', category: 'Cardiovascular', stockOnHand: 1450, reorderLevel: 500, expiry: '2027-02-28', status: 'IN_STOCK' },
    { code: 'MED-102', name: 'Metformin HCl 500mg', category: 'Antidiabetic', stockOnHand: 320, reorderLevel: 400, expiry: '2026-10-15', status: 'LOW_STOCK' },
    { code: 'MED-103', name: 'Morphine Sulfate 10mg (Controlled)', category: 'Analgesic (Sched II)', stockOnHand: 45, reorderLevel: 50, expiry: '2026-08-30', status: 'NEAR_EXPIRY' },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-teal-600" />
          <span>Real-Time Pharmacy Inventory & Controlled Drug Log</span>
        </CardTitle>
        <CardDescription>Formulary stock balances, reorder warnings, and near-expiry batch monitoring.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication Code</TableHead>
              <TableHead>Generic / Brand Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock On Hand</TableHead>
              <TableHead>Nearest Expiry</TableHead>
              <TableHead>Inventory Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockItems.map((item) => (
              <TableRow key={item.code}>
                <TableCell className="font-mono text-xs font-semibold">{item.code}</TableCell>
                <TableCell className="font-bold text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                <TableCell className="text-xs text-slate-500">{item.category}</TableCell>
                <TableCell className="font-mono text-xs font-semibold">{item.stockOnHand} Units</TableCell>
                <TableCell className="font-mono text-xs text-amber-600">{item.expiry}</TableCell>
                <TableCell>
                  {item.status === 'IN_STOCK' && <Badge variant="success">IN STOCK</Badge>}
                  {item.status === 'LOW_STOCK' && <Badge variant="warning">LOW STOCK</Badge>}
                  {item.status === 'NEAR_EXPIRY' && <Badge variant="error">NEAR EXPIRY (&lt; 30d)</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
