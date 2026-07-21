'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { MessageComposer } from '../../../features/communications/components/message-composer';

export default function MessageComposerPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
      <AdminLayout>
        <MessageComposer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
