'use client';

import React, { useEffect, useCallback } from 'react';
import { Lock, Shield, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';

interface InactivityLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  onSignOut?: () => void;
  user?: {
    fullName?: string;
    role?: string;
    avatarUrl?: string;
  } | null;
}

export function InactivityLockScreen({
  isLocked,
  onUnlock,
  onSignOut,
  user,
}: InactivityLockScreenProps) {
  // Lock body scroll while screen is locked
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);

  // Pressing Enter key triggers unlock
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isLocked && e.key === 'Enter') {
        onUnlock();
      }
    },
    [isLocked, onUnlock]
  );

  useEffect(() => {
    if (isLocked) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isLocked, handleKeyDown]);

  if (!isLocked) return null;

  const displayName = user?.fullName || 'Operador Autorizado';
  const displayRole = user?.role || 'Equipe PreviOffice';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lockscreen-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#070e18]/92 backdrop-blur-xl animate-in fade-in duration-300 select-none"
    >
      <div className="relative w-full max-w-md bg-[#0B192E] border border-[#C89543]/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center text-slate-100 flex flex-col items-center">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#C89543]/15 blur-3xl pointer-events-none" />

        {/* Shield & Lock Badge */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#142642] to-[#0B192E] border border-[#C89543]/50 flex items-center justify-center text-[#C89543] shadow-lg shadow-[#C89543]/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C89543] text-[#0B192E] flex items-center justify-center shadow-md">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C89543]/10 border border-[#C89543]/25 text-[#C89543] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Proteção por Inatividade (45 min)</span>
        </div>

        {/* Title & LGPD notice */}
        <h2 id="lockscreen-title" className="text-xl font-bold text-white mb-1.5">
          Sessão Temporariamente Bloqueada
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-xs mb-6">
          Para cumprir as diretrizes de segurança da <strong>LGPD (Art. 46)</strong> e proteger dados sigilosos dos
          segurados, a tela foi ocultada.
        </p>

        {/* Operator Profile Card */}
        <div className="w-full p-4 rounded-2xl bg-[#142642]/60 border border-white/10 mb-6 flex items-center gap-3.5 text-left">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C89543] to-[#9A6D2B] text-[#0B192E] font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{displayName}</div>
            <div className="text-xs text-[#C89543] truncate">{displayRole}</div>
          </div>
        </div>

        {/* Zero Data Loss Banner */}
        <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 mb-6 text-left">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Seus formulários e cadastros em aberto continuam salvos com segurança.</span>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={onUnlock}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#C89543] hover:bg-[#b08137] text-[#0B192E] shadow-lg shadow-[#C89543]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continuar Atendimento</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Trocar de Usuário / Sair com Segurança</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
