'use client';

import React from 'react';
import { FileCode, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useCommunicationStore } from '../../../stores/use-communication-store';

export function TemplateManager() {
  const { templates } = useCommunicationStore();

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileCode className="h-5 w-5 text-teal-600" />
          <span>Multi-Channel Notification Template Directory</span>
        </CardTitle>
        <CardDescription>Configure reusable message templates with dynamic variable placeholders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Code</TableHead>
              <TableHead>Template Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Body Structure & Placeholders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((tpl) => (
              <TableRow key={tpl.id}>
                <TableCell className="font-mono text-xs font-semibold">{tpl.code}</TableCell>
                <TableCell className="font-bold text-slate-900 dark:text-slate-100">{tpl.name}</TableCell>
                <TableCell>
                  <Badge variant="primary" className="font-mono text-[10px]">
                    {tpl.channel}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">{tpl.bodyTemplate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
