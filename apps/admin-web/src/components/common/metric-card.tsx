import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, changePercent, description, icon, className }: MetricCardProps) {
  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {icon && <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950 dark:text-teal-400">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</h3>
          {changePercent !== undefined && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-semibold',
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {isPositive ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
              {Math.abs(changePercent)}%
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </CardContent>
    </Card>
  );
}
