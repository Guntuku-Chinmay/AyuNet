import React from 'react';
import { Calendar } from 'lucide-react';
import { MetricCard } from '../../../../components/common/metric-card';

export function TodayAppointmentsWidget() {
  return (
    <MetricCard
      title="Today's Appointments"
      value="342"
      changePercent={8.1}
      description="89% completion rate"
      icon={<Calendar className="h-5 w-5" />}
    />
  );
}
