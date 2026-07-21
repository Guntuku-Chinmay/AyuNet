'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { SampleCollection } from '../../../features/lab/components/sample-collection';

export default function LabSamplesPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN']}>
      <AdminLayout>
        <SampleCollection />
      </AdminLayout>
    </ProtectedRoute>
  );
}
