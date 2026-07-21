'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { PermissionMatrix } from '../../../features/roles/components/permission-matrix';

export default function RolesPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']} requiredPermission="manage:system">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Role & Permission Matrix Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Define access controls, clone roles, and enforce security policies across all organizational portals.
            </p>
          </div>
          <PermissionMatrix />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
