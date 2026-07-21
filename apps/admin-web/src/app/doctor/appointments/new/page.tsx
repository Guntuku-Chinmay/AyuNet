'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/guards/protected-route';
import { AdminLayout } from '../../../../layouts/admin-layout';
import { BookingWizard } from '../../../../features/appointments/components/booking-wizard';

export default function NewAppointmentPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']}>
      <AdminLayout>
        <BookingWizard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
