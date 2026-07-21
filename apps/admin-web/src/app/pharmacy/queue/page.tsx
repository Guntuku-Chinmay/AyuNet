'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { PrescriptionVerification } from '../../../features/pharmacy/components/prescription-verification';

export default function PharmacyQueuePage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST']}>
      <AdminLayout>
        <PrescriptionVerification />
      </AdminLayout>
    </ProtectedRoute>
  );
}
