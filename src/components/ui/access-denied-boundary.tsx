'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface AccessDeniedBoundaryProps {
  moduleName: string;
  requiredPermissionLabel: string;
}

export function AccessDeniedBoundary({
  moduleName,
  requiredPermissionLabel,
}: AccessDeniedBoundaryProps) {
  const { currentUser, canAccess } = useAuth();
  const safeHomeRoute = canAccess('receptionDesk') ? '/' : '/vade-mecum';

  return (
    <div className="p-8 max-w-2xl mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acesso Restrito ao Módulo</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {moduleName}
          </h2>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Seu perfil atual de colaborador não possui a permissão de{' '}
            <strong className="text-slate-700 font-semibold">{requiredPermissionLabel}</strong>{' '}
            liberada. Para ter acesso a esta tela ou função, solicite a ativação ao Advogado Administrador da banca.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500">Colaborador Conectado:</span>
            <span className="font-bold text-slate-900">{currentUser.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Classificação / Cargo:</span>
            <span className="font-medium text-slate-700">
              {currentUser.memberType === 'LAWYER'
                ? 'Advogado'
                : currentUser.memberType === 'ASSISTANT'
                ? 'Assistente de Atendimento'
                : 'Estagiário de Direito'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Permissão Requerida:</span>
            <span className="font-semibold text-rose-600">{requiredPermissionLabel}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href={safeHomeRoute}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
