'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { SearchAnalyticsCard } from '../../../features/search/components/search-analytics-card';

export default function SearchAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
      <AdminLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Search Analytics & Index Metrics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitor clinical search query volume, indexing performance, failed search patterns, and saved custom filters.
            </p>
          </div>
          <SearchAnalyticsCard />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
