'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { DoctorLayout } from '../../../layouts/doctor-layout';
import { ClinicalWorkspaceShell } from '../../../features/doctor/components/clinical-workspace-shell';

export default function DoctorWorkspacePage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
      <DoctorLayout>
        <ClinicalWorkspaceShell />
      </DoctorLayout>
    </ProtectedRoute>
  );
}
