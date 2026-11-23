'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { TERMS_OF_RESPONSIBILITY, CURRENT_TERMS_VERSION } from './terms-content';
import { useAuth } from '@/lib/auth/auth-context';

interface TermsConsentModalProps {
  isOpen: boolean;
  onAccepted: () => void;
}

export function TermsConsentModal({ isOpen, onAccepted }: TermsConsentModalProps) {
  const { currentUser } = useAuth();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!hasAgreed || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/security/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termsVersion: CURRENT_TERMS_VERSION,
          accepted: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao registrar o aceite no servidor.');
      }

      // Persist in local storage for instant client-side bypass on reload
      if (currentUser?.id) {
        localStorage.setItem(
          `previoffice_terms_accepted_${currentUser.id}`,
          JSON.stringify({
            acceptedAt: new Date().toISOString(),
            version: CURRENT_TERMS_VERSION,
          })
        );
      }

      onAccepted();
    } catch (err: any) {
      console.error('Error submitting terms acceptance:', err);
      // Fallback local persistence if server is briefly offline
      if (currentUser?.id) {
        localStorage.setItem(
          `previoffice_terms_accepted_${currentUser.id}`,
          JSON.stringify({
            acceptedAt: new Date().toISOString(),
            version: CURRENT_TERMS_VERSION,
            fallback: true,
          })
        );
      }
      onAccepted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#070e18]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0B192E] border border-[#C89543]/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0B192E] via-[#142642] to-[#0B192E] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C89543]/20 border border-[#C89543]/40 flex items-center justify-center text-[#C89543] shadow-md shadow-[#C89543]/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C89543] bg-[#C89543]/10 px-2 py-0.5 rounded border border-[#C89543]/20">
                  Conformidade LGPD & OAB v{CURRENT_TERMS_VERSION}
                </span>
              </div>
              <h2 id="terms-modal-title" className="text-base sm:text-lg font-bold text-white mt-0.5">
                Termo de Responsabilidade, Sigilo e Proteção de Dados
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Clauses Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-[#142642]/60 border border-white/10 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#C89543] shrink-0 mt-0.5" />
            <p>
              Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong> e o{' '}
              <strong>Estatuto da Advocacia (Lei 8.906/94)</strong>, o acesso ao PreviOffice exige o compromisso formal
              com a proteção das informações dos segurados atendidos por este escritório.
            </p>
          </div>

          <div className="space-y-3.5">
            {TERMS_OF_RESPONSIBILITY.map((clause, idx) => (
              <div
                key={clause.id}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#C89543] uppercase tracking-wide">
                    {idx + 1}. {clause.title}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    {clause.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  {clause.description}
                </p>
                <div className="space-y-1.5 pl-2 border-l-2 border-[#C89543]/30">
                  {clause.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C89543] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 italic">
                  Base Legal: {clause.legalBasis}
                </div>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gradient-to-t from-[#0B192E] to-[#142642]/60 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 sm:mt-0 w-4 h-4 rounded border-white/30 bg-white/10 text-[#C89543] focus:ring-[#C89543] cursor-pointer"
            />
            <span className="text-xs text-slate-200 group-hover:text-white transition-colors">
              Declaro que li, compreendi e assumo a responsabilidade pelas diretrizes de sigilo, proteção de senhas e LGPD.
            </span>
          </label>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasAgreed || isSubmitting}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              hasAgreed && !isSubmitting
                ? 'bg-[#C89543] hover:bg-[#b08137] text-[#0B192E] shadow-[#C89543]/20 cursor-pointer'
                : 'bg-white/10 text-slate-400 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>{isSubmitting ? 'Registrando Aceite...' : 'Aceitar e Acessar o Sistema'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
