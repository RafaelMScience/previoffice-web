'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileQuestion,
  ServerCrash,
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import {
  getErrorConfig,
  type ErrorStatusCode,
  type ErrorIconType,
} from '@/lib/utils/error-config';

export type { ErrorStatusCode };

export interface ErrorViewProps {
  statusCode?: ErrorStatusCode;
  title?: string;
  description?: string;
  reset?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  referenceCode?: string;
}

function resolveIcon(type: ErrorIconType) {
  switch (type) {
    case 'file-question':
      return FileQuestion;
    case 'server-crash':
      return ServerCrash;
    case 'alert':
    default:
      return AlertTriangle;
  }
}

export function ErrorView({
  statusCode = 404,
  title,
  description,
  reset,
  showHomeButton = true,
  showBackButton = true,
  showRetryButton,
  referenceCode,
}: ErrorViewProps) {
  const router = useRouter();
  const config = getErrorConfig(statusCode);
  const IconComponent = resolveIcon(config.iconType);

  const resolvedTitle = title || config.defaultTitle;
  const resolvedDescription = description || config.defaultDescription;
  const canRetry = showRetryButton ?? (statusCode === 500 || Boolean(reset));

  const handleRetry = () => {
    if (reset) {
      reset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-between items-center px-4 py-12 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Institucional */}
      <div className="flex items-center gap-2.5 mb-6 text-[#082A52]">
        <div className="w-9 h-9 rounded-xl bg-[#082A52] flex items-center justify-center text-white shadow-xs">
          <Scale className="w-5 h-5 text-[#C89543]" />
        </div>
        <div className="text-left">
          <span className="font-extrabold text-sm tracking-tight text-[#082A52] block leading-tight">
            PreviOffice
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Gestão Jurídica Previdenciária
          </span>
        </div>
      </div>

      {/* Card Central de Erro */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-10 text-center space-y-6">
        {/* Ícone */}
        <div
          className={`w-20 h-20 rounded-3xl ${config.iconBg} flex items-center justify-center mx-auto border border-slate-200/80 shadow-inner`}
        >
          <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        {/* Badge e Títulos */}
        <div className="space-y-2.5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${config.badgeStyle}`}
          >
            <span>{config.badge}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {resolvedTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {resolvedDescription}
          </p>
        </div>

        {/* Código de Referência Seguro (sem vazamento de detalhes) */}
        {referenceCode && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500 inline-block">
            Protocolo de Rastreio: <strong className="text-slate-700">{referenceCode}</strong>
          </div>
        )}

        {/* Botões de Ação de Recuperação */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {canRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C89543] text-white hover:bg-[#b58336] active:scale-98 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-xs"
            >
              <Home className="w-3.5 h-3.5 text-[#C89543]" />
              <span>Voltar ao Início</span>
            </Link>
          )}

          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          )}
        </div>
      </div>

      {/* Rodapé de Segurança e Sigilo */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#C89543]" />
        <span>Ambiente Criptografado • Isolamento Multitenant OAB / LGPD</span>
      </div>
    </div>
  );
}
