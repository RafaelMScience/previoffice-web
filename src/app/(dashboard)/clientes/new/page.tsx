'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Clock,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { FastIntakeModal, type FastIntakeData } from '@/components/reception/fast-intake-modal';
import { ClientFullForm } from '@/components/client-form/client-full-form';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function NewClientIntakePage() {
  const router = useRouter();
  const { t } = useI18n();

  const [mode, setMode] = useState<'FAST' | 'FULL'>('FAST');
  const [isFastModalOpen, setIsFastModalOpen] = useState(true);

  const handleFastSuccess = (data: FastIntakeData) => {
    // Redirect back to dashboard queue with success feedback
    router.push('/');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Breadcrumb & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#C89543]" />
              <span>Novo Cliente / Atendimento</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha entre o check-in ágil de 15 segundos ou a qualificação completa de 32 campos.
            </p>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode('FAST');
              setIsFastModalOpen(true);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'FAST'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#C89543]" />
            <span>Entrada Rápida (15s)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('FULL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'FULL'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#C89543]" />
            <span>Ficha Completa (32 Campos)</span>
          </button>
        </div>
      </div>

      {/* Render Mode */}
      {mode === 'FULL' ? (
        <ClientFullForm />
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C89543] flex items-center justify-center mx-auto mb-4 border border-[#C89543]/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Check-in Ágil de Balcão Ativado</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            O modal de entrada rápida foi aberto. Caso tenha fechado, clique no botão abaixo para reabrir.
          </p>
          <button
            type="button"
            onClick={() => setIsFastModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[#0B192E] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#142642] transition-all shadow-xs"
          >
            Abrir Modal de Entrada Rápida
          </button>

          <FastIntakeModal
            isOpen={isFastModalOpen}
            onClose={() => setIsFastModalOpen(false)}
            onSubmitSuccess={handleFastSuccess}
          />
        </div>
      )}
    </div>
  );
}
