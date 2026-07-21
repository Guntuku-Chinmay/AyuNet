'use client';

import React from 'react';
import { ShieldCheck, History, Lock, FileCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

export function SecurityAuditConfig() {
  const auditLogs = [
    { timestamp: '2026-07-21 09:15', user: 'Dr. Suresh Admin', item: 'Primary Brand Color', prevValue: '#0F766E', newValue: '#0D9488', status: 'APPLIED' },
    { timestamp: '2026-07-20 14:30', user: 'System Security Robot', item: 'MFA Enforcement Policy', prevValue: 'OPTIONAL', newValue: 'MANDATORY_ALL_STAFF', status: 'APPLIED' },
  ];

  return (
    <div className="space-y-6">
      {/* Security Enforcement Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-teal-600" />
            <span>Enterprise Security & Multi-Factor Authentication Policies</span>
          </CardTitle>
          <CardDescription>Configure mandatory MFA, session idle timeouts, and IP access restrictions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Mandatory Multi-Factor Authentication (MFA)</p>
              <p className="text-slate-500">Require TOTP authenticator app or SMS OTP for all clinical & admin staff.</p>
            </div>
            <Badge variant="success">ENFORCED (ALL ROLES)</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Session Inactivity Lockout</p>
              <p className="text-slate-500">Automatically lock workstation after 15 minutes of idle time.</p>
            </div>
            <span className="font-mono font-bold text-teal-700 dark:text-teal-300">15 Mins</span>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Audit Diff Viewer */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-indigo-500" />
            <span>Configuration Audit Log & Change Diff Viewer</span>
          </CardTitle>
          <CardDescription>Track all historical system configuration modifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Administrator</TableHead>
                <TableHead>Config Item</TableHead>
                <TableHead>Previous Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.timestamp}>
                  <TableCell className="font-mono text-xs text-slate-500">{log.timestamp}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{log.user}</TableCell>
                  <TableCell className="text-xs">{log.item}</TableCell>
                  <TableCell className="font-mono text-xs text-rose-500">{log.prevValue}</TableCell>
                  <TableCell className="font-mono text-xs text-emerald-600 font-bold">{log.newValue}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success">{log.status}</Badge>
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
