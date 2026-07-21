'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { FileUploader } from '../../../features/documents/components/file-uploader';

export default function DocumentUploadPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'RECEPTIONIST']}>
      <AdminLayout>
        <FileUploader />
      </AdminLayout>
    </ProtectedRoute>
  );
}
