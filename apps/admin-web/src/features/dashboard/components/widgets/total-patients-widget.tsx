import React from 'react';
import { Users } from 'lucide-react';
import { MetricCard } from '../../../../components/common/metric-card';

export function TotalPatientsWidget() {
  return (
    <MetricCard
      title="Total Active Patients"
      value="14,250"
      changePercent={12.4}
      description="Across 12 hospital branches"
      icon={<Users className="h-5 w-5" />}
    />
  );
}
