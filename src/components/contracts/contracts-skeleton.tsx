import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ContractsKpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
      {/* KPI 1 */}
      <div className="bg-[#082A52] p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-[132px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-28 h-3 bg-white/20" />
            <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
          </div>
          <Skeleton className="w-36 h-7 bg-white/30 rounded" />
        </div>
        <Skeleton className="w-40 h-3 bg-white/20 rounded" />
      </div>

      {/* KPI 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between h-[132px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="w-32 h-7 rounded" />
        </div>
        <Skeleton className="w-36 h-3 rounded" />
      </div>

      {/* KPI 3 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between h-[132px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="w-32 h-7 rounded" />
        </div>
        <Skeleton className="w-36 h-3 rounded" />
      </div>

      {/* KPI 4 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between h-[132px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="w-20 h-7 rounded" />
        </div>
        <Skeleton className="w-36 h-3 rounded" />
      </div>
    </div>
  );
}

export function ContractsTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando contratos..."
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200"
    >
      <span className="sr-only">Carregando contratos...</span>
      {/* Filter / Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
          <Skeleton className="w-20 h-8 rounded-md" />
          <Skeleton className="w-24 h-8 rounded-md" />
          <Skeleton className="w-28 h-8 rounded-md" />
          <Skeleton className="w-32 h-8 rounded-md" />
        </div>
        <Skeleton className="w-full lg:w-64 h-9 rounded-lg" />
      </div>

      {/* Table - 7 Colunas correspondendo a ContractsTable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4"><Skeleton className="w-24 h-3" /></th>
              <th className="py-3 px-4"><Skeleton className="w-28 h-3" /></th>
              <th className="py-3 px-4"><Skeleton className="w-24 h-3" /></th>
              <th className="py-3 px-4"><Skeleton className="w-24 h-3" /></th>
              <th className="py-3 px-4"><Skeleton className="w-28 h-3" /></th>
              <th className="py-3 px-4"><Skeleton className="w-24 h-3" /></th>
              <th className="py-3 px-4 text-right"><Skeleton className="w-16 h-3 ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                {/* 1. Nº Contrato */}
                <td className="py-3.5 px-4 space-y-1.5">
                  <Skeleton className="w-24 h-4 rounded-md" />
                  <Skeleton className="w-16 h-2.5 rounded" />
                </td>
                {/* 2. Cliente & CPF */}
                <td className="py-3.5 px-4 space-y-1.5">
                  <Skeleton className="w-36 h-3.5 rounded" />
                  <Skeleton className="w-24 h-2.5 rounded" />
                </td>
                {/* 3. Espécie */}
                <td className="py-3.5 px-4 space-y-1.5">
                  <Skeleton className="w-32 h-3.5 rounded" />
                  <Skeleton className="w-28 h-3 rounded" />
                </td>
                {/* 4. Regime */}
                <td className="py-3.5 px-4 space-y-1">
                  <Skeleton className="w-24 h-5 rounded-full" />
                  <Skeleton className="w-20 h-3 rounded" />
                </td>
                {/* 5. Financeiro & Parcelas */}
                <td className="py-3.5 px-4 space-y-1.5">
                  <Skeleton className="w-24 h-3.5 rounded" />
                  <Skeleton className="w-28 h-1.5 rounded-full" />
                  <Skeleton className="w-20 h-2.5 rounded" />
                </td>
                {/* 6. Status Assinatura */}
                <td className="py-3.5 px-4 space-y-1">
                  <Skeleton className="w-24 h-5 rounded-full" />
                  <Skeleton className="w-28 h-2.5 rounded" />
                </td>
                {/* 7. Ações */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-7 h-7 rounded-lg" />
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
