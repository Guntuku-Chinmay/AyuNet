'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { AiHistoryManager } from '../../../features/ai/components/ai-history-manager';

export default function AiHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
      <AdminLayout>
        <AiHistoryManager />
      </AdminLayout>
    </ProtectedRoute>
  );
}
