'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { PatientRegistrationForm } from '../../../features/reception/components/patient-registration-form';

export default function PatientRegistrationPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'NURSE']} requiredPermission="write:patients">
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <PatientRegistrationForm />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
