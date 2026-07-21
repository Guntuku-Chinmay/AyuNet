'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { AuditLogViewer } from '../../../features/audit/components/audit-log-viewer';

export default function AuditLogsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']} requiredPermission="manage:system">
      <AdminLayout>
        <AuditLogViewer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
