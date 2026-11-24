'use client';

import React from 'react';
import { ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

interface AdminGateViewProps {
  masterKey: string;
  setMasterKey: (key: string) => void;
  onVerifyGate: (e: React.FormEvent) => void;
  verifyingGate: boolean;
  gateError: string | null;
}

export function AdminGateView({
  masterKey,
  setMasterKey,
  onVerifyGate,
  verifyingGate,
  gateError,
}: AdminGateViewProps) {
  const { t } = useI18n();

  return (
    <div className="bg-slate-800 text-slate-100 rounded-2xl border border-slate-700 shadow-2xl p-8 sm:p-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Autenticação Administrativa
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Informe a credencial autorizada para configurar o escritório.
        </p>
      </div>

      {gateError && (
        <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{gateError}</span>
        </div>
      )}

      <form onSubmit={onVerifyGate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Credencial de Acesso
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              required
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-slate-600 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={verifyingGate}
          className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {verifyingGate ? t.adminProvisioning.btnVerifying : t.adminProvisioning.btnUnlock}
        </button>
      </form>
    </div>
  );
}
