'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { BrandingConfig } from '../../../features/settings/components/branding-config';

export default function SettingsBrandingPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <BrandingConfig />
      </AdminLayout>
    </ProtectedRoute>
  );
}
