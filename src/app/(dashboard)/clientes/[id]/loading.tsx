import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando ficha do cliente..."
      className="space-y-6 pb-12 animate-in fade-in duration-200"
    >
      <span className="sr-only">Carregando ficha do cliente...</span>

      {/* Client Detail Header Skeleton (matching ClientDetailHeader white card) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Skeleton className="w-16 h-6 rounded-lg" />
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>

        {/* Client Profile Summary Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-48 h-6 rounded" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="w-28 h-3.5 rounded" />
                <Skeleton className="w-32 h-3.5 rounded" />
                <Skeleton className="w-24 h-3.5 rounded" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <Skeleton className="w-24 h-9 rounded-xl" />
            <Skeleton className="w-32 h-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Skeleton (matching ClientDetailsView segmented container) */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex items-center gap-1.5 overflow-x-auto">
        <Skeleton className="w-32 h-8 rounded-lg" />
        <Skeleton className="w-36 h-8 rounded-lg" />
        <Skeleton className="w-32 h-8 rounded-lg" />
        <Skeleton className="w-28 h-8 rounded-lg" />
        <Skeleton className="w-28 h-8 rounded-lg" />
      </div>

      {/* Main Content Area (matching default AttendanceTimeline full-width view) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="w-44 h-5 rounded" />
          <Skeleton className="w-32 h-8 rounded-xl" />
        </div>
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="flex gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-36 h-4 rounded" />
                  <Skeleton className="w-24 h-3 rounded" />
                </div>
                <Skeleton className="w-full h-3.5 rounded" />
                <Skeleton className="w-2/3 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
