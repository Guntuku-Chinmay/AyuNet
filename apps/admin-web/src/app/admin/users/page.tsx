'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { UserList } from '../../../features/users/components/user-list';

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']} requiredPermission="manage:users">
      <AdminLayout>
        <UserList />
      </AdminLayout>
    </ProtectedRoute>
  );
}
