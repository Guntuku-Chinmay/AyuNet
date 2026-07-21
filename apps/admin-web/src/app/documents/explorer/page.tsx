'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { DocumentExplorer } from '../../../features/documents/components/document-explorer';

export default function DocumentExplorerPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'RECEPTIONIST']}>
      <AdminLayout>
        <DocumentExplorer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
