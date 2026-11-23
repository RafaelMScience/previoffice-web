import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AttendancesTableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <>
      <tr className="sr-only">
        <td colSpan={7} role="status">
          Carregando atendimentos...
        </td>
      </tr>
      {rows.map((idx) => (
        <tr key={idx} className="hover:bg-slate-50/50 animate-in fade-in duration-200">
          {/* Cliente */}
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="w-32 h-3.5 rounded" />
                <Skeleton className="w-20 h-2.5 rounded" />
              </div>
            </div>
          </td>
          {/* Tipo de Atendimento */}
          <td className="px-5 py-3.5">
            <Skeleton className="w-24 h-5 rounded-full" />
          </td>
          {/* Objetivo / Benefício */}
          <td className="px-5 py-3.5">
            <Skeleton className="w-36 h-3.5 rounded" />
          </td>
          {/* Data / Hora */}
          <td className="px-5 py-3.5">
            <div className="space-y-1">
              <Skeleton className="w-20 h-3 rounded" />
              <Skeleton className="w-12 h-2.5 rounded" />
            </div>
          </td>
          {/* Atendente */}
          <td className="px-5 py-3.5">
            <Skeleton className="w-24 h-3 rounded" />
          </td>
          {/* Pendências */}
          <td className="px-5 py-3.5">
            <Skeleton className="w-16 h-5 rounded-full" />
          </td>
          {/* Ação */}
          <td className="px-5 py-3.5 text-right">
            <Skeleton className="w-24 h-7 rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
