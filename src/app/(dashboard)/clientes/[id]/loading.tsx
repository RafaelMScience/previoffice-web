import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDetailLoading() {
  return (
    <div className="py-2 space-y-6 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-48 h-6 rounded-lg" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-24 h-4 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-32 h-10 rounded-xl" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Skeleton className="w-28 h-9 rounded-lg" />
        <Skeleton className="w-28 h-9 rounded-lg" />
        <Skeleton className="w-28 h-9 rounded-lg" />
        <Skeleton className="w-28 h-9 rounded-lg" />
      </div>

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="w-36 h-5 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-full h-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
