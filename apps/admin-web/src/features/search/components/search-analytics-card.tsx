'use client';

import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Star, History, Bookmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function SearchAnalyticsCard() {
  const popularQueries = [
    { query: 'Serum Potassium', count: 142, status: 'HIGH_VOLUME' },
    { query: 'Rahul Sharma UHID-2026', count: 98, status: 'STABLE' },
    { query: 'Cardiology Bed Occupancy', count: 64, status: 'STABLE' },
  ];

  const failedSearches = [
    { query: 'Unknown ICD-11 Draft Codes', count: 12, reason: 'No matching taxonomy index' },
    { query: 'Archived Lab Scans 2018', count: 8, reason: 'Requires cold archive retrieval hook' },
  ];

  const savedSearches = [
    { id: '1', title: 'Critical Potassium Results Today', query: 'type:LAB status:CRITICAL K+>5.0' },
    { id: '2', title: 'Active Cardiology OPD Consults', query: 'type:APPOINTMENT dept:Cardiology date:today' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Popular Queries & Analytics */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xs">
            <BarChart3 className="h-5 w-5 text-teal-600 animate-pulse" />
            <span>Search Analytics & Popular Queries</span>
          </CardTitle>
          <CardDescription>Metrics on highest volume clinical search queries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {popularQueries.map((item) => (
            <div key={item.query} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{item.query}</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-500">{item.count} hits</span>
                <Badge variant={item.status === 'HIGH_VOLUME' ? 'error' : 'primary'} className="text-[10px]">
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Failed/Zero-result Searches */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xs">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <span>Failed & Zero-Result Searches</span>
          </CardTitle>
          <CardDescription>Search strings that returned no results, flagged for index improvements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {failedSearches.map((item) => (
            <div key={item.query} className="flex flex-col rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-slate-900 dark:text-slate-100">{item.query}</span>
                <span className="text-slate-500 font-mono">{item.count} failures</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{item.reason}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Saved Searches */}
      <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xs">
            <Bookmark className="h-5 w-5 text-indigo-500" />
            <span>Saved Search Queries & Advanced Filters</span>
          </CardTitle>
          <CardDescription>Shortcut filters configured for recurring clinic monitoring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {savedSearches.map((saved) => (
            <div key={saved.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{saved.title}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{saved.query}</p>
              </div>
              <Badge variant="outline" className="text-[9px]">SAVED QUERY</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
