import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando base de clientes..."
      className="animate-in fade-in duration-200"
    >
      <span className="sr-only">Carregando base de clientes...</span>
      {/* Search and Filters Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
        <Skeleton className="w-full sm:w-72 h-9 rounded-lg" />
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <Skeleton className="w-16 h-7 rounded-lg" />
          <Skeleton className="w-24 h-7 rounded-lg" />
          <Skeleton className="w-24 h-7 rounded-lg" />
          <Skeleton className="w-28 h-7 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5"><Skeleton className="w-24 h-3" /></th>
              <th className="px-5 py-3.5"><Skeleton className="w-20 h-3" /></th>
              <th className="px-5 py-3.5"><Skeleton className="w-28 h-3" /></th>
              <th className="px-5 py-3.5"><Skeleton className="w-24 h-3" /></th>
              <th className="px-5 py-3.5"><Skeleton className="w-20 h-3" /></th>
              <th className="px-5 py-3.5 text-right"><Skeleton className="w-16 h-3 ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                {/* Client Info */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-36 h-3.5 rounded" />
                      <Skeleton className="w-24 h-3 rounded" />
                    </div>
                  </div>
                </td>
                {/* Visit Details */}
                <td className="px-5 py-3.5 space-y-1.5">
                  <Skeleton className="w-20 h-4 rounded-full" />
                  <Skeleton className="w-28 h-3 rounded" />
                </td>
                {/* Folder & Pending Docs */}
                <td className="px-5 py-3.5 space-y-1">
                  <Skeleton className="w-32 h-3.5 rounded" />
                  <Skeleton className="w-24 h-3 rounded" />
                </td>
                {/* Registration Progress */}
                <td className="px-5 py-3.5 space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="w-14 h-3 rounded" />
                    <Skeleton className="w-8 h-3 rounded" />
                  </div>
                  <Skeleton className="w-28 h-1.5 rounded-full" />
                </td>
                {/* Attendant */}
                <td className="px-5 py-3.5">
                  <Skeleton className="w-24 h-3.5 rounded" />
                </td>
                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-20 h-7 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
