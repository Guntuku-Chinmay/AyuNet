import React from 'react';
import { CreditCard } from 'lucide-react';
import { MetricCard } from '../../../../components/common/metric-card';

export function RevenueWidget() {
  return (
    <MetricCard
      title="Monthly Revenue"
      value="₹45,20,000"
      changePercent={15.8}
      description="Invoices settled"
      icon={<CreditCard className="h-5 w-5" />}
    />
  );
}
