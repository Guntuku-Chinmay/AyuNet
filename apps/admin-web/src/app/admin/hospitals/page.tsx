'use client';

import React from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';
import { HospitalList } from '../../../features/hospitals/components/hospital-list';

export default function HospitalsPage() {
  return (
    <AdminLayout>
      <HospitalList />
    </AdminLayout>
  );
}
