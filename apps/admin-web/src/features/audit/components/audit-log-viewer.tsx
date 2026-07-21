'use client';

import React, { useState } from 'react';
import { Search, Shield, Eye, Download, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Dialog } from '../../../components/ui/dialog';
import { useDebounce } from '../../../hooks/use-debounce';
import { AuditLogRecord } from '../services/audit-service';

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AuditLogRecord | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const mockAuditLogs: AuditLogRecord[] = [
    {
      id: 'log-101',
      userId: 'usr-001',
      userEmail: 'admin@apollo-central.org',
      action: 'TENANT_FEATURE_FLAG_TOGGLE',
      entityName: 'FeatureFlag',
      entityId: 'AI_CLINICAL_BOT',
      beforeState: { enabled: false },
      afterState: { enabled: true },
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
      createdAt: '2026-07-21 20:15:02',
    },
    {
      id: 'log-102',
      userId: 'usr-002',
      userEmail: 'dr.priya@apollo-central.org',
      action: 'PATIENT_EMR_VISIT_FINALIZED',
      entityName: 'MedicalRecord',
      entityId: 'emr-88291',
      beforeState: { isFinalized: false },
      afterState: { isFinalized: true },
      ipAddress: '192.168.1.88',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      createdAt: '2026-07-21 20:08:14',
    },
    {
      id: 'log-103',
      userId: 'usr-001',
      userEmail: 'admin@apollo-central.org',
      action: 'USER_ROLE_PERMISSIONS_UPDATE',
      entityName: 'RolePermissionMapping',
      entityId: 'RECEPTIONIST',
      beforeState: { permissions: ['read:patients'] },
      afterState: { permissions: ['read:patients', 'write:patients'] },
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
      createdAt: '2026-07-21 19:45:30',
    },
  ];

  const filteredLogs = mockAuditLogs.filter(
    (l) =>
      l.userEmail.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      l.entityName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Audit Log Stream
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Immutable HIPAA-compliant audit stream capturing user mutations, access changes, and clinical events.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export CSV Audit Log
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search user, action, or entity..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs font-medium text-slate-500">Showing {filteredLogs.length} Events</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Action Event</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">State Diff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{log.createdAt}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{log.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant="primary" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entityName} ({log.entityId})
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{log.ipAddress}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(log)}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> Inspect Diff
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Audit State Mutation Details"
        description={`Event ID: ${selectedRecord?.id} | Action: ${selectedRecord?.action}`}
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs font-mono">
            <div className="rounded-lg bg-slate-950 p-3 text-slate-200">
              <p className="text-slate-400 font-sans mb-1 font-semibold">State Before Mutation:</p>
              <pre>{JSON.stringify(selectedRecord.beforeState, null, 2)}</pre>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 text-emerald-300">
              <p className="text-slate-400 font-sans mb-1 font-semibold">State After Mutation:</p>
              <pre>{JSON.stringify(selectedRecord.afterState, null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
