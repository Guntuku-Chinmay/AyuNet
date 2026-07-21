'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Building2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useDebounce } from '../../../hooks/use-debounce';
import { ROUTES } from '../../../constants/routes';

export function HospitalList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const mockHospitals = [
    {
      id: 'hosp-001',
      name: 'Apollo Super Specialty Hospital',
      licenseNumber: 'LIC-IND-884920',
      taxId: 'GST-9920148',
      primaryContactEmail: 'contact@apollo-central.org',
      primaryContactPhone: '+91 98765 43210',
      branchesCount: 8,
      isActive: true,
    },
    {
      id: 'hosp-002',
      name: 'Max Healthcare Institute',
      licenseNumber: 'LIC-IND-773019',
      taxId: 'GST-4410982',
      primaryContactEmail: 'admin@maxhealthcare.in',
      primaryContactPhone: '+91 91234 56789',
      branchesCount: 5,
      isActive: true,
    },
    {
      id: 'hosp-003',
      name: 'Fortis Multi-Specialty Clinic',
      licenseNumber: 'LIC-IND-552011',
      taxId: 'GST-1102938',
      primaryContactEmail: 'info@fortishospitals.com',
      primaryContactPhone: '+91 99887 76655',
      branchesCount: 3,
      isActive: false,
    },
  ];

  const filteredHospitals = mockHospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      h.licenseNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hospital Organizations & Branches
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage healthcare network entities, licenses, and regional hospital branches.
          </p>
        </div>
        <Button className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Provision New Hospital
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search hospital name or license..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs font-medium text-slate-500">Showing {filteredHospitals.length} Organizations</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Organization</TableHead>
                <TableHead>License No.</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Branches</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospitals.map((hosp) => (
                <TableRow key={hosp.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{hosp.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">GST: {hosp.taxId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{hosp.licenseNumber}</TableCell>
                  <TableCell>
                    <p className="text-xs font-medium">{hosp.primaryContactEmail}</p>
                    <p className="text-xs text-slate-500">{hosp.primaryContactPhone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      <MapPin className="mr-1 h-3 w-3 text-teal-600" /> {hosp.branchesCount} Branches
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {hosp.isActive ? (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="error">
                        <XCircle className="mr-1 h-3 w-3" /> Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`${ROUTES.ADMIN.HOSPITALS}/${hosp.id}`}>
                      <Button variant="outline" size="sm">
                        View Branches
                      </Button>
                    </Link>
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
