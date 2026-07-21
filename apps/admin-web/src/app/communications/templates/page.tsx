'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { TemplateManager } from '../../../features/communications/components/template-manager';

export default function TemplatesPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <TemplateManager />
      </AdminLayout>
    </ProtectedRoute>
  );
}
