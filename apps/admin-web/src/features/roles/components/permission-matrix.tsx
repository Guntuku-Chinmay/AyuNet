'use client';

import React, { useState } from 'react';
import { Shield, Save, Check, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { UserRole, Permission } from '@ayunet/types';
import { ROLE_DEFAULT_PERMISSIONS } from '../../../constants/permissions';

export function PermissionMatrix() {
  const [matrix, setMatrix] = useState<Record<UserRole, Permission[]>>(ROLE_DEFAULT_PERMISSIONS);
  const [isSaved, setIsSaved] = useState(false);

  const roles: UserRole[] = [
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'RECEPTIONIST',
    'NURSE',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'PATIENT',
  ];

  const permissions: { key: Permission; label: string; group: string }[] = [
    { key: 'read:patients', label: 'View Patients', group: 'Patient Care' },
    { key: 'write:patients', label: 'Modify Patients', group: 'Patient Care' },
    { key: 'read:appointments', label: 'View Appointments', group: 'Scheduling' },
    { key: 'write:appointments', label: 'Schedule Appointments', group: 'Scheduling' },
    { key: 'read:emr', label: 'View Medical Records', group: 'Clinical EMR' },
    { key: 'write:emr', label: 'Update Medical Records', group: 'Clinical EMR' },
    { key: 'read:prescriptions', label: 'View Prescriptions', group: 'Pharmacy' },
    { key: 'write:prescriptions', label: 'Issue Prescriptions', group: 'Pharmacy' },
    { key: 'read:lab', label: 'View Lab Orders', group: 'Diagnostics' },
    { key: 'write:lab', label: 'Update Lab Results', group: 'Diagnostics' },
    { key: 'read:billing', label: 'View Invoices', group: 'Finance' },
    { key: 'write:billing', label: 'Create Invoices', group: 'Finance' },
    { key: 'access:ai', label: 'Access Clinical AI', group: 'AI & Tools' },
    { key: 'manage:users', label: 'Manage Users', group: 'Administration' },
    { key: 'manage:tenant', label: 'Manage Hospital Settings', group: 'Administration' },
  ];

  const togglePermission = (role: UserRole, perm: Permission) => {
    setMatrix((prev) => {
      const current = prev[role] || [];
      const hasPerm = current.includes(perm);
      const updated = hasPerm ? current.filter((p) => p !== perm) : [...current, perm];
      return { ...prev, [role]: updated };
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-teal-600" />
            <span>Role-Based Visual Permission Matrix</span>
          </CardTitle>
          <CardDescription>Configure fine-grained privilege grants across system roles.</CardDescription>
        </div>
        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          {isSaved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaved ? 'Permissions Saved' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Permission Scope</TableHead>
              {roles.map((r) => (
                <TableHead key={r} className="text-center font-semibold text-xs">
                  {r.replace('_', ' ')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.key}>
                <TableCell>
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{perm.label}</p>
                  <p className="font-mono text-[10px] text-slate-400">{perm.key} ({perm.group})</p>
                </TableCell>
                {roles.map((r) => {
                  const checked = matrix[r]?.includes(perm.key);
                  return (
                    <TableCell key={r} className="text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(r, perm.key)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
