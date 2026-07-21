'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { InventoryLookup } from '../../../features/pharmacy/components/inventory-lookup';

export default function PharmacyInventoryPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST']}>
      <AdminLayout>
        <InventoryLookup />
      </AdminLayout>
    </ProtectedRoute>
  );
}
