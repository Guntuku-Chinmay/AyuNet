'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { OperationalMetrics } from '../../../features/analytics/components/operational-metrics';

export default function OperationalAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <OperationalMetrics />
      </AdminLayout>
    </ProtectedRoute>
  );
}
