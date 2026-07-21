import React from 'react';
import { Stethoscope } from 'lucide-react';
import { MetricCard } from '../../../../components/common/metric-card';

export function DoctorsOnDutyWidget() {
  return (
    <MetricCard
      title="Doctors On Duty"
      value="48"
      changePercent={4.2}
      description="14 OPD & 34 Emergency"
      icon={<Stethoscope className="h-5 w-5" />}
    />
  );
}
