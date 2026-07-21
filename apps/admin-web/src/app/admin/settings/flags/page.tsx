'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/guards/protected-route';
import { AdminLayout } from '../../../../layouts/admin-layout';
import { FeatureFlagList } from '../../../../features/flags/components/feature-flag-list';

export default function FeatureFlagsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']} requiredPermission="manage:tenant">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Tenant Feature Flags
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Control feature deployments and experimental module access across your organization.
            </p>
          </div>
          <FeatureFlagList />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
