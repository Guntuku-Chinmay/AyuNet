'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Plus, CheckCircle2, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { ROUTES } from '../../../constants/routes';

export function HospitalDetail({ id }: { id: string }) {
  const hospital = {
    id,
    name: 'Apollo Super Specialty Hospital',
    licenseNumber: 'LIC-IND-884920',
    taxId: 'GST-9920148',
    primaryContactEmail: 'contact@apollo-central.org',
    primaryContactPhone: '+91 98765 43210',
    website: 'https://apollo-healthcare.org',
    isActive: true,
    branches: [
      {
        id: 'branch-001',
        name: 'Apollo Central Campus',
        code: 'AP-CTL',
        address: '12 Health Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        phone: '+91 22 8877 6655',
        departmentsCount: 14,
        isActive: true,
      },
      {
        id: 'branch-002',
        name: 'Apollo West Medical Center',
        code: 'AP-WST',
        address: '45 Care Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        phone: '+91 22 4433 2211',
        departmentsCount: 9,
        isActive: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={ROUTES.ADMIN.HOSPITALS}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{hospital.name}</h1>
            <Badge variant="success">Active Network</Badge>
          </div>
          <p className="text-sm text-slate-500 font-mono">License: {hospital.licenseNumber} | GST: {hospital.taxId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Organization Info</CardTitle>
            <CardDescription>Primary administrative contact & license credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-teal-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">{hospital.primaryContactEmail}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-teal-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">{hospital.primaryContactPhone}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">Website</p>
              <a href={hospital.website} target="_blank" rel="noreferrer" className="text-teal-600 underline font-medium text-xs">
                {hospital.website}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Registered Hospital Branches</CardTitle>
              <CardDescription>Regional hospital campuses and clinical facilities</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospital.branches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-teal-600" />
                        <span>{b.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{b.city}, {b.state}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{b.departmentsCount} Depts</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Operational
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
