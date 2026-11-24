'use client';

import React from 'react';
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { maskBenefitNumber } from '@/lib/utils/masks';

export interface InssAccessSectionProps {
  t: any;
  benefitNumber: string;
  setBenefitNumber: (val: string) => void;
  inssPassword: string;
  setInssPassword: (val: string) => void;
  showInssPassword: boolean;
  toggleShowInssPassword: () => void;
  isRevealingInss: boolean;
  handleCopyInssPassword: () => void;
  isCopiedInss: boolean;
  physicalFileLocation: string;
  setPhysicalFileLocation: (val: string) => void;
}

export function InssAccessSection({
  t,
  benefitNumber,
  setBenefitNumber,
  inssPassword,
  setInssPassword,
  showInssPassword,
  toggleShowInssPassword,
  isRevealingInss,
  handleCopyInssPassword,
  isCopiedInss,
  physicalFileLocation,
  setPhysicalFileLocation,
}: InssAccessSectionProps) {
  return (
    <div id="inss" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Lock className="w-5 h-5 text-[#C89543]" />
        <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec4}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.benefitNumberLabel}</label>
          <input
            type="text"
            maxLength={13}
            value={benefitNumber}
            onChange={(e) => setBenefitNumber(maskBenefitNumber(e.target.value))}
            placeholder="123.456.789-0"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              {t.clientForm.inssPasswordLabel}
            </label>
            {inssPassword && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                AES-256
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showInssPassword ? 'text' : 'password'}
              value={inssPassword}
              onChange={(e) => setInssPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              spellCheck={false}
              className="w-full pl-3.5 pr-20 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono tracking-wider"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                disabled={isRevealingInss}
                onClick={toggleShowInssPassword}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors disabled:opacity-50"
                title={
                  showInssPassword
                    ? t.clientForm.inssPasswordToggleHide
                    : t.clientForm.inssPasswordToggleShow
                }
              >
                {isRevealingInss ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C89543]" />
                ) : showInssPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {inssPassword && (
                <button
                  type="button"
                  onClick={handleCopyInssPassword}
                  className="p-1.5 text-slate-400 hover:text-[#C89543] rounded-md hover:bg-slate-200/60 transition-colors"
                  title={
                    isCopiedInss
                      ? t.clientForm.inssPasswordCopied
                      : 'Copiar senha do Meu INSS'
                  }
                >
                  {isCopiedInss ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-tight">
            {t.clientForm.inssPasswordEncryptedHelp}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.physicalLocationLabel}</label>
          <input
            type="text"
            value={physicalFileLocation}
            onChange={(e) => setPhysicalFileLocation(e.target.value)}
            placeholder={t.clientForm.physicalLocationPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
