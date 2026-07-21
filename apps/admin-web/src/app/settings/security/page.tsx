'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { SecurityAuditConfig } from '../../../features/settings/components/security-audit-config';

export default function SettingsSecurityPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <SecurityAuditConfig />
      </AdminLayout>
    </ProtectedRoute>
  );
}
