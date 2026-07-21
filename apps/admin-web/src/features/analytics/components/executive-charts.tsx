'use client';

import React from 'react';
import { TrendingUp, DollarSign, Users, Building, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';

export function ExecutiveCharts() {
  const revenueData = [
    { month: 'Jan', revenue: 3.8 },
    { month: 'Feb', revenue: 4.2 },
    { month: 'Mar', revenue: 4.5 },
    { month: 'Apr', revenue: 4.1 },
    { month: 'May', revenue: 5.0 },
    { month: 'Jun', revenue: 5.6 },
  ];

  const departmentShare = [
    { name: 'Cardiology OPD', share: 35, amount: '₹15.8M', color: 'bg-teal-500' },
    { name: 'Orthopedics & Surgery', share: 28, amount: '₹12.6M', color: 'bg-indigo-500' },
    { name: 'Diagnostic Pathology', share: 22, amount: '₹9.9M', color: 'bg-emerald-500' },
    { name: 'Pharmacy Dispensing', share: 15, amount: '₹6.7M', color: 'bg-amber-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Monthly Revenue Bar Chart */}
      <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <span>Monthly Revenue Growth (in ₹ Millions)</span>
          </CardTitle>
          <CardDescription>Comparative monthly operational revenue performance.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex h-56 items-end space-x-6 border-b border-slate-200 pb-4 dark:border-slate-800">
            {revenueData.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center group">
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{item.revenue}M
                </span>
                <div
                  className="w-full bg-teal-600 rounded-t-lg transition-all duration-300 hover:bg-teal-500 group-hover:scale-105"
                  style={{ height: `${(item.revenue / 6.0) * 180}px` }}
                />
                <span className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Revenue Share Card */}
      <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-indigo-500" />
            <span>Department Revenue Breakdown</span>
          </CardTitle>
          <CardDescription>Share of revenue across primary clinical departments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {departmentShare.map((dept) => (
            <div key={dept.name} className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-900 dark:text-slate-100">{dept.name}</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{dept.amount} ({dept.share}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full ${dept.color}`} style={{ width: `${dept.share}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
