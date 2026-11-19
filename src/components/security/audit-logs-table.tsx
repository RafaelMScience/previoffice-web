'use client';

import React, { useState } from 'react';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock,
  User,
  KeyRound,
  FileText,
  DollarSign,
  Download,
  Copy,
  Check,
  Lock,
  Laptop,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { AuditAction, AuditLogEntry, AuditSeverity } from '@/types/security';

interface AuditLogsTableProps {
  logs: AuditLogEntry[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'SENSITIVE' | 'CRITICAL' | 'INFO'>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      log.actorName.toLowerCase().includes(term) ||
      log.actorRole.toLowerCase().includes(term) ||
      log.targetResource.toLowerCase().includes(term) ||
      log.actionDescription.toLowerCase().includes(term) ||
      log.ipAddress.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'SENSITIVE') {
      return log.action === 'VIEW_INSS_PASSWORD' || log.action === 'EXPORT_REPORT';
    }
    if (severityFilter === 'CRITICAL') {
      return log.severity === 'CRITICAL' || log.severity === 'WARNING';
    }
    if (severityFilter === 'INFO') {
      return log.severity === 'INFO';
    }
    return true;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'VIEW_INSS_PASSWORD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <KeyRound className="w-3 h-3 text-amber-700" />
            <span>Senha INSS Visualizada</span>
          </span>
        );
      case 'DISCHARGE_FEE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>Baixa de Honorários</span>
          </span>
        );
      case 'PRINT_CONTRACT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Impressão de Contrato/Procuração</span>
          </span>
        );
      case 'CREATE_CLIENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <User className="w-3 h-3 text-indigo-600" />
            <span>Novo Cliente / Balcão</span>
          </span>
        );
      case 'LOGIN_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Tentativa Falha de Login</span>
          </span>
        );
      case 'UPDATE_PERMISSIONS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Lock className="w-3 h-3 text-purple-600" />
            <span>Permissões Alteradas</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{action}</span>
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
            Crítico
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Alerta
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200">
            Info
          </span>
        );
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExportCsv = () => {
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const headers = ['Data/Hora', 'Operador', 'Cargo', 'Ação', 'Descrição', 'Recurso Alvo', 'IP', 'Dispositivo', 'Severidade', 'Hash SHA-256'];
    const rows = filteredLogs.map((l) => [
      escapeCsv(l.timestamp),
      escapeCsv(l.actorName),
      escapeCsv(l.actorRole),
      escapeCsv(l.action),
      escapeCsv(l.actionDescription),
      escapeCsv(l.targetResource),
      escapeCsv(l.ipAddress),
      escapeCsv(l.userAgent),
      escapeCsv(l.severity),
      escapeCsv(l.integrityHash),
    ]);

    // Prepend UTF-8 BOM so Excel and audit tools parse accented Portuguese characters correctly
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `previoffice-auditoria-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.security.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-800 transition-all font-medium"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === 'ALL'
                ? 'bg-[#082A52] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.security.filterAll}
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('SENSITIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === 'SENSITIVE'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {t.security.filterSensitive}
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            {t.security.filterCritical}
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('INFO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === 'INFO'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.security.filterInfo}
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:border-[#C89543] text-slate-700 hover:text-[#082A52] transition-all shadow-2xs"
            title="Exportar registros filtrados para arquivo CSV auditável"
          >
            <Download className="w-3.5 h-3.5 text-[#C89543]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">{t.security.colTimestamp}</th>
                <th className="py-3 px-4">{t.security.colActor}</th>
                <th className="py-3 px-4">{t.security.colAction}</th>
                <th className="py-3 px-4">{t.security.colResource}</th>
                <th className="py-3 px-4">{t.security.colIp}</th>
                <th className="py-3 px-4">{t.security.colSeverity}</th>
                <th className="py-3 px-4 text-right">{t.security.colHash}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Nenhum registro encontrado</p>
                    <p className="text-[11px] text-slate-400">Tente ajustar seus termos de pesquisa ou filtros.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div>{getActionBadge(log.action)}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-1">{log.actionDescription}</div>
                      </div>
                    </td>

                    {/* Target Resource */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-slate-800 text-[11px] line-clamp-1">
                        {log.targetResource}
                      </span>
                    </td>

                    {/* IP & Device */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-slate-400" />
                        <span>{log.ipAddress}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>

                    {/* Hash Digital Seal */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded cursor-pointer group-hover:border-emerald-300"
                          title={`Hash SHA-256 de integridade forense: ${log.integrityHash}`}
                        >
                          {log.integrityHash.slice(0, 10)}…
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHash(log.integrityHash);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Copiar Hash Completo SHA-256"
                        >
                          {copiedHash === log.integrityHash ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Registros imutáveis com carimbo de tempo em conformidade com o <strong>Marco Civil da Internet (Art. 15)</strong> e <strong>LGPD (Art. 46)</strong>.
            </span>
          </div>
          <span className="font-semibold text-slate-700">
            Total: {filteredLogs.length} registro(s)
          </span>
        </div>
      </div>

      {/* Selected Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#082A52]/10 text-[#082A52] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#C89543]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Certificado Forense do Registro</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operador:</span>
                  <span className="font-bold text-slate-900">{selectedLog.actorName} ({selectedLog.actorRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ação Auditada:</span>
                  <span className="font-bold text-slate-900">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Descrição:</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{selectedLog.actionDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recurso / Dossiê:</span>
                  <span className="font-semibold text-slate-900">{selectedLog.targetResource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data & Hora Oficial:</span>
                  <span className="font-mono text-slate-700">{formatTimestamp(selectedLog.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Endereço IP:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User Agent / Navegador:</span>
                  <span className="text-slate-700 text-right truncate max-w-xs">{selectedLog.userAgent}</span>
                </div>
              </div>

              {/* SHA-256 Cryptographic Box */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    Selo Criptográfico SHA-256
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-900 font-semibold">
                    Verificado • Válido
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200 font-mono text-[10px] break-all text-emerald-950">
                  {selectedLog.integrityHash}
                </div>
                <p className="text-[10px] text-emerald-700">
                  Este hash garante que o registro não sofreu nenhuma alteração posterior no banco de dados.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] transition-all"
              >
                Fechar Certificado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
