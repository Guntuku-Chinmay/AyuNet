'use client';

import React, { useState } from 'react';
import { History, Share2, Link as LinkIcon, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useDocumentStore } from '../../../stores/use-document-store';

export function VersionSharingManager() {
  const { selectedDocument } = useDocumentStore();
  const [shareLink, setShareLink] = useState<string | null>(null);

  const versions = [
    { version: 'v1.2', uploadedBy: 'Dr. Priya Mehta', date: '2026-07-21 10:45 AM', notes: 'Added attending cardiologist electronic signature' },
    { version: 'v1.0', uploadedBy: 'Dr. Priya Mehta', date: '2026-07-21 09:30 AM', notes: 'Initial discharge summary draft' },
  ];

  const handleGenerateShare = () => {
    setShareLink(`https://ayunet.health/share/doc-101?token=secure_e8192&expires=24h`);
  };

  return (
    <div className="space-y-6">
      {/* Version Control Timeline Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-teal-600" />
            <span>Document Version Control & Revision History</span>
          </CardTitle>
          <CardDescription>
            Revisions for <span className="font-bold text-slate-900 dark:text-slate-100">{selectedDocument?.name || 'Selected Document'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Revision Change Notes</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="font-mono text-xs font-bold">{v.version}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{v.uploadedBy}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{v.date}</TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">{v.notes}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">
                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> Revert
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time-Limited Share Link Generator */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-indigo-500" />
            <span>Time-Limited Secure Sharing Gateway</span>
          </CardTitle>
          <CardDescription>Generate HIPAA-compliant time-limited download links for patients or external practitioners.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <Button onClick={handleGenerateShare} className="bg-teal-600 hover:bg-teal-700">
            <LinkIcon className="mr-1.5 h-4 w-4" /> Generate 24-Hour Presigned Share Link
          </Button>

          {shareLink && (
            <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40 space-y-2 font-mono">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">{shareLink}</p>
              <Badge variant="success">EXPIRES IN 24 HOURS</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
