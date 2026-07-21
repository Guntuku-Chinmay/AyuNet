'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MedicationDispensing } from '../../../features/pharmacy/components/medication-dispensing';

export default function PharmacyDispensingPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST']}>
      <AdminLayout>
        <MedicationDispensing />
      </AdminLayout>
    </ProtectedRoute>
  );
}
