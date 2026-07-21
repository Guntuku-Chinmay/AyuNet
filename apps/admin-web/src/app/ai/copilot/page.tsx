'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { AiChatWindow } from '../../../features/ai/components/ai-chat-window';

export default function AiCopilotPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
      <AdminLayout>
        <AiChatWindow />
      </AdminLayout>
    </ProtectedRoute>
  );
}
