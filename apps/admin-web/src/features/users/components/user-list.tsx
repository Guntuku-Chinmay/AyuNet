'use client';

import React, { useState } from 'react';
import { Search, Plus, UserCheck, UserX, KeyRound, LogOut, MoreHorizontal } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { UserFormModal } from './user-form-modal';
import { useDebounce } from '../../../hooks/use-debounce';
import { formatFullName } from '../../../utils/formatters';

export function UserList() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const mockUsers = [
    {
      id: 'usr-001',
      email: 'admin@apollo-central.org',
      role: 'HOSPITAL_ADMIN',
      isActive: true,
      userProfile: { firstName: 'Rajesh', lastName: 'Kumar' },
      branchName: 'Apollo Central',
    },
    {
      id: 'usr-002',
      email: 'dr.priya@apollo-central.org',
      role: 'DOCTOR',
      isActive: true,
      userProfile: { firstName: 'Priya', lastName: 'Mehta' },
      branchName: 'Apollo Central',
    },
    {
      id: 'usr-003',
      email: 'reception.west@apollo.org',
      role: 'RECEPTIONIST',
      isActive: true,
      userProfile: { firstName: 'Suresh', lastName: 'Patil' },
      branchName: 'Apollo West',
    },
    {
      id: 'usr-004',
      email: 'lab.tech@apollo.org',
      role: 'LAB_TECHNICIAN',
      isActive: false,
      userProfile: { firstName: 'Vikram', lastName: 'Singh' },
      branchName: 'Apollo West',
    },
  ];

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.userProfile.firstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.userProfile.lastName.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provision user accounts, assign roles, reset credentials, and force active session logouts.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Provision New User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="ALL">All Roles</option>
                <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="NURSE">Nurse</option>
                <option value="LAB_TECHNICIAN">Lab Technician</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Profile</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold text-xs text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        {u.userProfile.firstName[0]}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatFullName(u.userProfile.firstName, u.userProfile.lastName)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="primary" className="text-[10px]">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{u.branchName}</TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge variant="success">
                        <UserCheck className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="error">
                        <UserX className="mr-1 h-3 w-3" /> Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" title="Reset Password">
                        <KeyRound className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Force Logout">
                        <LogOut className="h-4 w-4 text-rose-500" />
                      </Button>
                      <Button variant="ghost" size="icon" title="More Options">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => {
          // Process submission
        }}
      />
    </div>
  );
}
