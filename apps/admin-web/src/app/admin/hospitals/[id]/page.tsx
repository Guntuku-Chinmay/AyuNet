'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '../../../../layouts/admin-layout';
import { HospitalDetail } from '../../../../features/hospitals/components/hospital-detail';

export default function HospitalDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'hosp-001';

  return (
    <AdminLayout>
      <HospitalDetail id={id} />
    </AdminLayout>
  );
}
