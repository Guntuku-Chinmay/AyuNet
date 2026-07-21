'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { PromptLibrary } from '../../../features/ai/components/prompt-library';

export default function AiPromptsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']}>
      <AdminLayout>
        <PromptLibrary />
      </AdminLayout>
    </ProtectedRoute>
  );
}
