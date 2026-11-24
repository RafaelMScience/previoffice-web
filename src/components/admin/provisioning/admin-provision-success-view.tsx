'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldAlert,
  MessageCircle,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

interface AdminProvisionSuccessViewProps {
  provisionSuccess: {
    officeName: string;
    officeCnpj?: string;
    societyOab?: string;
    lawyerName: string;
    lawyerCpf?: string;
    lawyerOab?: string;
    lawyerEmail: string;
    temporaryPassword?: string;
  };
  lawyerPassword: string;
  whatsAppUrl: string;
  onCopyCredentials: () => void;
  copiedShareText: boolean;
}

export function AdminProvisionSuccessView({
  provisionSuccess,
  lawyerPassword,
  whatsAppUrl,
  onCopyCredentials,
  copiedShareText,
}: AdminProvisionSuccessViewProps) {
  const { t } = useI18n();

  return (
    <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 shadow-2xl p-8 sm:p-10 w-full max-w-lg text-center animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-extrabold text-white">
        {t.adminProvisioning.successTitle}
      </h2>
      <p className="text-xs text-slate-300 mt-2">
        {t.adminProvisioning.successMessage}
      </p>

      <div className="mt-6 bg-slate-900/80 p-5 rounded-xl border border-slate-700 text-left text-xs space-y-2.5 font-mono">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500">Razão Social / Escritório:</span>
          <span className="text-white font-bold">{provisionSuccess.officeName}</span>
        </div>
        {provisionSuccess.officeCnpj && (
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">CNPJ da Sociedade:</span>
            <span className="text-white font-bold">{provisionSuccess.officeCnpj}</span>
          </div>
        )}
        {provisionSuccess.societyOab && (
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">OAB da Sociedade:</span>
            <span className="text-[#C89543] font-bold">{provisionSuccess.societyOab}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500">Advogado Titular:</span>
          <span className="text-white font-bold">{provisionSuccess.lawyerName}</span>
        </div>
        {provisionSuccess.lawyerCpf && (
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">CPF do Advogado:</span>
            <span className="text-emerald-300 font-bold">{provisionSuccess.lawyerCpf}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500">OAB do Advogado:</span>
          <span className="text-[#C89543] font-bold">{provisionSuccess.lawyerOab}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500">Login:</span>
          <span className="text-blue-400">{provisionSuccess.lawyerEmail}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Senha Provisória:</span>
          <span className="text-emerald-400 font-bold font-mono tracking-wider">
            {provisionSuccess.temporaryPassword || lawyerPassword}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-left text-xs text-amber-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">
            Troca de Senha Obrigatória no 1º Acesso
          </span>
          <span>
            Ao realizar o primeiro login com a senha provisória acima, o advogado será automaticamente redirecionado para cadastrar sua nova senha pessoal definitiva.
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Enviar via WhatsApp (R$ 0,00)</span>
        </a>

        <button
          type="button"
          onClick={onCopyCredentials}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copiedShareText ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copiedShareText ? 'Mensagem Copiada!' : t.adminProvisioning.copyAccessData}</span>
        </button>

        <Link
          href="/login"
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#C89543] text-[#0B192E] font-bold text-xs uppercase tracking-wider hover:bg-[#d5a557] flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>Ir para a Página de Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
