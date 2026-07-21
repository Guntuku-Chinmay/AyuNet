'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { IntegrationCenter } from '../../../features/settings/components/integration-center';

export default function SettingsIntegrationsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <IntegrationCenter />
      </AdminLayout>
    </ProtectedRoute>
  );
}
