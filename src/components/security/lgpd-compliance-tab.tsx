'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  FolderLock,
  FileCheck2,
  Search,
  Calendar,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { LgpdConsentRecord } from '@/types/security';

interface LgpdComplianceTabProps {
  records: LgpdConsentRecord[];
}

export function LgpdComplianceTab({ records }: LgpdComplianceTabProps) {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState('');

  const filteredRecords = records.filter(
    (r) =>
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.cpf.includes(search) ||
      r.physicalDocumentLocation.toLowerCase().includes(search.toLowerCase())
  );

  const formatSignedDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getConsentBadge = (type: LgpdConsentRecord['consentType']) => {
    if (type === 'PREVIDENCIARIO_REPRESENTATION') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20">
          <FileCheck2 className="w-3 h-3 text-[#C89543]" />
          <span>Representação Previdenciária OAB & INSS</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
        <FolderLock className="w-3 h-3 text-purple-600" />
        <span>Tratamento de Dados Médicos/CNIS (LGPD Art. 11)</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Informative Guidance Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#082A52]/10 text-[#082A52] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C89543]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.security.lgpdTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.security.lgpdSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Base Legal: Art. 7, V e IX da Lei 13.709/2018</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, CPF ou gaveta do armário físico..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-800 transition-all font-medium"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong>{filteredRecords.length}</strong> termo(s) assinado(s)
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">{t.security.colClient}</th>
                <th className="py-3 px-4">{t.security.colTermType}</th>
                <th className="py-3 px-4">{t.security.colSignedAt}</th>
                <th className="py-3 px-4">{t.security.colPhysicalLocation}</th>
                <th className="py-3 px-4 text-right">{t.security.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <FolderLock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Nenhum termo LGPD encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.clientName}</div>
                      <div className="text-[11px] font-mono text-slate-500">CPF: {r.cpf}</div>
                    </td>

                    {/* Term type */}
                    <td className="py-3.5 px-4">{getConsentBadge(r.consentType)}</td>

                    {/* Signed at */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatSignedDate(r.signedAt)}</span>
                      </div>
                    </td>

                    {/* Physical custody */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        <Archive className="w-3.5 h-3.5 text-amber-700" />
                        <span>{r.physicalDocumentLocation}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {r.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>VIGENTE</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          REVOGADO
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Legal notice */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Artigo 11, II da LGPD:</strong> O tratamento de dados pessoais sensíveis (incluindo laudos médicos, dados de saúde e registros do CNIS) é legalmente admitido sem consentimento adicional para o exercício regular de direitos em processo judicial ou administrativo pela banca previdenciária constituída.
        </div>
      </div>
    </div>
  );
}
