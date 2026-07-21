'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { ResultEntryForm } from '../../../features/lab/components/result-entry-form';

export default function LabWorklistPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN']}>
      <AdminLayout>
        <ResultEntryForm />
      </AdminLayout>
    </ProtectedRoute>
  );
}
