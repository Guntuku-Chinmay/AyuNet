'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { CommunicationInbox } from '../../../features/communications/components/communication-inbox';

export default function CommunicationInboxPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
      <AdminLayout>
        <CommunicationInbox />
      </AdminLayout>
    </ProtectedRoute>
  );
}
