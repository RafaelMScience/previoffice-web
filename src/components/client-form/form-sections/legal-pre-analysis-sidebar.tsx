'use client';

import React from 'react';
import {
  User,
  MapPin,
  Phone,
  Lock,
  Award,
  Calculator,
} from 'lucide-react';

export interface LegalPreAnalysisSidebarProps {
  t: any;
  age: number | null;
  isLoasElderlyAge: boolean;
  ruralRetirementCheck: { isEligibleAge: boolean } | null;
  gender: string;
}

export function LegalPreAnalysisSidebar({
  t,
  age,
  isLoasElderlyAge,
  ruralRetirementCheck,
  gender,
}: LegalPreAnalysisSidebarProps) {
  return (
    <aside className="w-56 hidden xl:block flex-shrink-0 sticky top-20 self-start">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t.clientForm.secNav}
        </div>
        <nav className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          <a
            href="#personal"
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.clientForm.sec1}</span>
          </a>
          <a
            href="#address"
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.clientForm.sec2}</span>
          </a>
          <a
            href="#contact"
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.clientForm.sec3}</span>
          </a>
          <a
            href="#inss"
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.clientForm.sec4}</span>
          </a>
          <a
            href="#benefit"
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t.clientForm.sec5}</span>
          </a>
        </nav>

        {/* Quick Legal Pre-Analysis Box */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold text-[#0B192E] flex items-center gap-1.5 mb-2">
            <Calculator className="w-3.5 h-3.5 text-[#C89543]" />
            <span>{t.clientForm.rulesEngineTitle}</span>
          </div>
          {age !== null ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t.clientForm.computedAgeLabel}</span>
                <span className="font-bold text-slate-900">{age} {t.clientForm.yearsOld}</span>
              </div>
              {isLoasElderlyAge && (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[11px] font-medium border border-emerald-200">
                  {t.clientForm.loasEligibleNotice}
                </div>
              )}
              {ruralRetirementCheck && ruralRetirementCheck.isEligibleAge && (
                <div className="bg-amber-50 text-amber-800 p-2 rounded text-[11px] font-medium border border-amber-200">
                  {t.clientForm.ruralEligibleNotice} ({gender === 'F' ? '55' : '60'} {t.clientForm.yearsOld}).
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              {t.clientForm.fillBirthDateHint}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
