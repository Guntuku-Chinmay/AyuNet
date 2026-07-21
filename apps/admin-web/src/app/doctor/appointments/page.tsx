'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { DoctorLayout } from '../../../layouts/doctor-layout';
import { AppointmentCalendar } from '../../../features/appointments/components/appointment-calendar';

export default function AppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']}>
      <DoctorLayout>
        <AppointmentCalendar />
      </DoctorLayout>
    </ProtectedRoute>
  );
}
