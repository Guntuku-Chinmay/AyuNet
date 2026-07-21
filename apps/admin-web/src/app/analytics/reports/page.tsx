'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { ReportBuilder } from '../../../features/analytics/components/report-builder';

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <ReportBuilder />
      </AdminLayout>
    </ProtectedRoute>
  );
}
