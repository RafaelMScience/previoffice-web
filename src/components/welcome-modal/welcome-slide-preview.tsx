import React from 'react';
import {
  UserCheck,
  Scale,
  Printer,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { WelcomeSlide } from '@/types/welcome';

interface FieldItem {
  label: string;
  value: string;
}

interface PendingItem {
  item: string;
  done: boolean;
}

interface ModelItem {
  name: string;
  detail: string;
}

interface AuditLogItem {
  action: string;
  user: string;
  time: string;
}

export function WelcomeSlidePreview({ slide }: { slide: WelcomeSlide }) {
  const { type, badge, previewData } = slide.mockup;

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="bg-gradient-to-br from-slate-900 to-[#0B192E] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#C89543]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#C89543]/20 border border-[#C89543]/40 text-[#F3E5AB]">
            <Sparkles className="w-3 h-3 text-[#C89543]" />
            {badge}
          </span>
          <span className="text-[11px] text-white/50 font-mono">
            PreviOffice Preview
          </span>
        </div>

        {/* Dynamic Mockup Body by Type */}
        {type === 'reception_intake' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#C89543]" />
              <span>{previewData.title}</span>
            </div>
            <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/10">
              {(previewData.fields as FieldItem[] || []).map((f, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white/60">{f.label}:</span>
                  <span className="font-semibold text-white truncate max-w-[200px] text-right">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-lg">
              ✓ {previewData.statusTag}
            </div>
          </div>
        )}

        {type === 'client_record' && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C89543] to-[#996b27] flex items-center justify-center font-bold text-white text-sm shadow-md">
                MF
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {previewData.name}
                </h4>
                <div className="text-[11px] text-white/60 font-mono">
                  CPF: {previewData.cpf} • {previewData.visits}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Benefício:</span>
                <span className="font-bold text-[#F3E5AB]">{previewData.benefit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Atendente:</span>
                <span className="font-medium text-white">{previewData.attendant}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/10">
                <span className="text-white/60 flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-[#C89543]" />
                  Arquivo Físico:
                </span>
                <span className="font-mono text-[11px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-bold">
                  {previewData.archiveLocation}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-white/60 mb-1">
                <span>Completude do Prontuário</span>
                <span className="font-bold text-emerald-400">{previewData.progress}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#C89543] to-emerald-400 h-full rounded-full"
                  style={{ width: `${previewData.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {type === 'return_attendance' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="text-white/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C89543]" />
                {previewData.lastVisit}
              </span>
              <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {previewData.type}
              </span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/80 leading-relaxed italic">
              "{previewData.notes}"
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                Documentos Apresentados
              </div>
              {(previewData.pendingList as PendingItem[] || []).map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${p.done ? 'text-emerald-400' : 'text-white/30'}`}
                  />
                  <span className={p.done ? 'text-white font-medium' : 'text-white/50 line-through'}>
                    {p.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'contracts_fee' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C89543]" />
              <span>Modelos de Remuneração Advocatícia</span>
            </div>

            <div className="space-y-2">
              {(previewData.models as ModelItem[] || []).map((m, i) => (
                <div key={i} className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-xs">
                  <div className="font-bold text-[#F3E5AB]">{m.name}</div>
                  <div className="text-white/60 text-[11px] mt-0.5">{m.detail}</div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 font-mono">
              💡 {previewData.sampleCalculation}
            </div>
          </div>
        )}

        {type === 'pdf_dossier' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#C89543]" />
              <span className="truncate">{previewData.documentTitle}</span>
            </div>

            <div className="p-3 bg-white text-slate-800 rounded-xl shadow-inner space-y-2 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 pb-1">
                Estrutura do Dossiê para Impressão
              </div>
              {(previewData.sections as string[] || []).map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89543]" />
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-white/50 text-center font-mono">
              {previewData.footerNote}
            </div>
          </div>
        )}

        {type === 'vade_mecum' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C89543]" />
              <span>{previewData.norm}</span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/90 leading-relaxed font-serif">
              {previewData.article}
            </div>

            <div className="p-2.5 bg-[#C89543]/15 border border-[#C89543]/30 rounded-lg text-[11px] text-[#F3E5AB]">
              ⚖️ {previewData.crossRef}
            </div>
          </div>
        )}

        {type === 'office_audit' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10">
              <span className="font-bold text-white">{previewData.firmName}</span>
              <span className="font-mono text-[#F3E5AB] font-semibold">{previewData.oab}</span>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                Trilha Forense LGPD (Tempo Real)
              </div>
              {(previewData.auditLogs as AuditLogItem[] || []).map((log, idx) => (
                <div key={idx} className="p-2 bg-white/5 rounded-lg border border-white/10 text-[11px] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block">{log.action}</span>
                    <span className="text-white/50 text-[10px]">{log.user}</span>
                  </div>
                  <span className="font-mono text-emerald-400 text-[10px] font-bold">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generic extensible fallback for future slide types (e.g., financial_returns) */}
        {type !== 'reception_intake' &&
          type !== 'client_record' &&
          type !== 'return_attendance' &&
          type !== 'contracts_fee' &&
          type !== 'pdf_dossier' &&
          type !== 'vade_mecum' &&
          type !== 'office_audit' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C89543]" />
                <span>{previewData.title || slide.title}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/80 space-y-2">
                {Object.entries(previewData).map(([key, value], idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-white/60 capitalize">{key}:</span>
                    <span className="font-semibold text-white truncate max-w-[200px] text-right">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
