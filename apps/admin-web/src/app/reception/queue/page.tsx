'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { QueueBoard } from '../../../features/reception/components/queue-board';

export default function ReceptionQueuePage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'NURSE']} requiredPermission="read:appointments">
      <AdminLayout>
        <QueueBoard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
