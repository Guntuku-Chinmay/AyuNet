'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { ResultValidationPanel } from '../../../features/lab/components/result-validation-panel';

export default function LabValidationPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN']}>
      <AdminLayout>
        <ResultValidationPanel />
      </AdminLayout>
    </ProtectedRoute>
  );
}
