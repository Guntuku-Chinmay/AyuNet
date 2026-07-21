'use client';

import React from 'react';
import { Network, Key, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useSettingsStore } from '../../../stores/use-settings-store';

export function IntegrationCenter() {
  const { integrations } = useSettingsStore();

  const apiKeys = [
    { name: 'Primary FHIR R4 Production Secret', key: 'ayunet_live_sk_99182839102839', created: '2026-01-10', status: 'ACTIVE' },
    { name: 'Twilio SMS Dispatch Webhook', key: 'ayunet_live_sk_44182910394812', created: '2026-02-15', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6">
      {/* Integrations Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-teal-600" />
            <span>FHIR, HL7, & Third-Party Integration Gateway</span>
          </CardTitle>
          <CardDescription>Health interoperability bridges, SMS/WhatsApp gateways, and payment processors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connector Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Health Ping</TableHead>
                <TableHead className="text-right">Connection Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="primary" className="font-mono text-[10px]">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{item.lastPing}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> CONNECTED
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-indigo-500" />
            <span>Production API Keys & Webhook Signing Secrets</span>
          </CardTitle>
          <CardDescription>Masked integration credentials for external healthcare systems.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Identifier</TableHead>
                <TableHead>Masked Credential Secret</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((k) => (
                <TableRow key={k.name}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{k.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    ayunet_live_sk_••••••••••••{k.key.slice(-4)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{k.created}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success">ACTIVE</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
