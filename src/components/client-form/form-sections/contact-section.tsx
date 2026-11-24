'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';
import { maskPhone } from '@/lib/utils/masks';

export interface ContactSectionProps {
  t: Translations;
  mobilePhone: string;
  setMobilePhone: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
}

export function ContactSection({
  t,
  mobilePhone,
  setMobilePhone,
  phone,
  setPhone,
  email,
  setEmail,
}: ContactSectionProps) {
  return (
    <div id="contact" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Phone className="w-5 h-5 text-[#C89543]" />
        <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec3}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.clientForm.mobilePhoneLabel}
          </label>
          <input
            type="text"
            required
            maxLength={15}
            value={mobilePhone}
            onChange={(e) => setMobilePhone(maskPhone(e.target.value))}
            placeholder="(83) 98888-0000"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.clientForm.secondaryPhoneLabel}
          </label>
          <input
            type="text"
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="(83) 99999-1111"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@email.com"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
