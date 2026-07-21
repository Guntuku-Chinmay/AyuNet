'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { VersionSharingManager } from '../../../features/documents/components/version-sharing-manager';

export default function DocumentVersionsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
      <AdminLayout>
        <VersionSharingManager />
      </AdminLayout>
    </ProtectedRoute>
  );
}
