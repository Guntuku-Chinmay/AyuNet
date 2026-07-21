'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { PatientLayout } from '../../../layouts/patient-layout';
import { CaregiverManager } from '../../../features/patient/components/caregiver-manager';
import { ConsentManager } from '../../../features/patient/components/consent-manager';

export default function PatientCaregiversPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PATIENT', 'CAREGIVER']}>
      <PatientLayout>
        <div className="space-y-6">
          <CaregiverManager />
          <ConsentManager />
        </div>
      </PatientLayout>
    </ProtectedRoute>
  );
}
