'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { PatientLayout } from '../../../layouts/patient-layout';
import { PatientRecordsViewer } from '../../../features/patient/components/patient-records-viewer';

export default function PatientRecordsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PATIENT', 'CAREGIVER']}>
      <PatientLayout>
        <PatientRecordsViewer />
      </PatientLayout>
    </ProtectedRoute>
  );
}
