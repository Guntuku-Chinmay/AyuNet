'use client';

import React from 'react';
import { ProtectedRoute } from '../components/guards/protected-route';
import { AdminLayout } from '../layouts/admin-layout';
import { DashboardGrid } from '../features/dashboard/components/dashboard-grid';
import { PreferencesModal } from '../features/preferences/components/preferences-modal';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DashboardGrid />
        <PreferencesModal />
      </AdminLayout>
    </ProtectedRoute>
  );
}
