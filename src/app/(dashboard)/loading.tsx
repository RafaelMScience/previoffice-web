import React from 'react';
import { DashboardTableSkeleton } from '@/components/dashboard/dashboard-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="w-16 h-8 rounded" />
            <Skeleton className="w-32 h-3 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <DashboardTableSkeleton />
      </div>
    </div>
  );
}
