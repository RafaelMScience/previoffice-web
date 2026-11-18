'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  FileText,
  User,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Clock,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatCpf } from '@/lib/domain/cpf-validator';
import type { Client, MaritalStatus } from '@/types/client';
import type { Attendance, AttendanceType } from '@/types/attendance';

interface ClientPdfReportModalProps {
  client: Client;
  attendances?: Attendance[];
  isOpen: boolean;
  onClose: () => void;
  lawyerName?: string;
  lawyerOab?: string;
  officeName?: string;
}

export function ClientPdfReportModal({
  client,
  attendances = [],
  isOpen,
  onClose,
  lawyerName = 'Dr. Alexandre Pontes',
  lawyerOab = 'OAB/PB 18.234',
  officeName = 'Alexandre Pontes Sociedade de Advogados',
}: ClientPdfReportModalProps) {
  const { t } = useI18n();

  // Export Presets
  const [preset, setPreset] = useState<'all' | 'registration' | 'attendances'>('all');

  // Modular Toggles
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeAddressAndContacts, setIncludeAddressAndContacts] = useState(true);
  const [includeSocioeconomic, setIncludeSocioeconomic] = useState(true);
  const [includePrevidenciary, setIncludePrevidenciary] = useState(true);
  const [includeAttendanceHistory, setIncludeAttendanceHistory] = useState(true);
  const [includeClientSignature, setIncludeClientSignature] = useState(true);
  const [includeLawyerSignature, setIncludeLawyerSignature] = useState(true);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'all' | 'registration' | 'attendances') => {
    setPreset(type);
    if (type === 'all') {
      setIncludePersonalData(true);
      setIncludeDocuments(true);
      setIncludeAddressAndContacts(true);
      setIncludeSocioeconomic(true);
      setIncludePrevidenciary(true);
      setIncludeAttendanceHistory(true);
      setIncludeClientSignature(true);
      setIncludeLawyerSignature(true);
    } else if (type === 'registration') {
      setIncludePersonalData(true);
      setIncludeDocuments(true);
      setIncludeAddressAndContacts(true);
      setIncludeSocioeconomic(true);
      setIncludePrevidenciary(true);
      setIncludeAttendanceHistory(false);
      setIncludeClientSignature(true);
      setIncludeLawyerSignature(true);
    } else if (type === 'attendances') {
      setIncludePersonalData(false);
      setIncludeDocuments(false);
      setIncludeAddressAndContacts(false);
      setIncludeSocioeconomic(false);
      setIncludePrevidenciary(false);
      setIncludeAttendanceHistory(true);
      setIncludeClientSignature(true);
      setIncludeLawyerSignature(true);
    }
  };

  /**
   * Isolated iframe print engine:
   * Guarantees that ONLY the clean A4 sheet (#client-pdf-printable-area) is sent
   * to the browser print dialog, completely preventing web dashboard/sidebar leakage.
   */
  const handlePrint = () => {
    const printableArea = document.getElementById('client-pdf-printable-area');
    if (!printableArea) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;'
    );
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Capture active application styles and CSS links
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Ficha do Cliente - ${client.fullName}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #FFFFFF !important;
              color: #0B192E !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif !important;
            }
            .a4-print-sheet {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: #FFFFFF !important;
            }
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div class="a4-print-sheet">
            ${printableArea.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  // Helper date parsing (immune to UTC-3 midnight timezone shifts)
  const formatBirthDate = (isoDate?: string) => {
    if (!isoDate) return 'Não informado';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return new Date(isoDate).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const parts = birthDateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const birthYear = parseInt(parts[0], 10);
      const birthMonth = parseInt(parts[1], 10) - 1;
      const birthDay = parseInt(parts[2], 10);
      const now = new Date();
      let age = now.getFullYear() - birthYear;
      const m = now.getMonth() - birthMonth;
      if (m < 0 || (m === 0 && now.getDate() < birthDay)) {
        age--;
      }
      return age >= 0 ? age : null;
    }
    return null;
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatMaritalStatus = (status?: MaritalStatus | string) => {
    switch (status) {
      case 'SINGLE':
        return 'Solteiro(a)';
      case 'MARRIED':
        return 'Casado(a)';
      case 'STABLE_UNION':
        return 'União Estável';
      case 'DIVORCED':
        return 'Divorciado(a)';
      case 'SEPARATED':
        return 'Separado(a)';
      case 'WIDOWED':
        return 'Viúvo(a)';
      default:
        return status || 'Não informado';
    }
  };

  const age = calculateAge(client.birthDate);
  const formattedBirth = formatBirthDate(client.birthDate);
  const generatedAt = new Date();

  // Household calculation: client + dependents
  const householdMembers = (client.dependentCount !== undefined ? client.dependentCount : 0) + 1;
  const perCapitaIncome =
    client.monthlyIncome !== undefined
      ? formatCurrency(client.monthlyIncome / householdMembers)
      : 'Não informado';

  const getAttendanceTypeLabel = (type: AttendanceType) => {
    switch (type) {
      case 'FIRST_CONSULTATION':
      case 'FIRST_VISIT':
        return '1ª Consulta / Triagem';
      case 'RETURN_DOCUMENTS':
      case 'RETURN':
        return 'Retorno c/ Documentos';
      case 'CONTRACT_SIGNING':
        return 'Assinatura de Contrato OAB';
      default:
        return 'Orientação Previdenciária';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-pdf-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Controls Header (Screen Only Toolbar) */}
        <div className="bg-[#0B192E] text-white p-4 sm:p-5 relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Printer className="w-4 h-4" />
            <span>{t.clientDetails.clientPdfModalTitle}</span>
          </div>

          <h2 id="client-pdf-title" className="text-xl font-bold tracking-tight">
            Relatório Oficial do Cliente: {client.fullName}
          </h2>

          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            {t.clientDetails.clientPdfModalSubtitle}
          </p>

          {/* Preset Buttons & Options Bar */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Modelos:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  preset === 'all'
                    ? 'bg-[#C89543] text-white shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Relatório Completo
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('registration')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  preset === 'registration'
                    ? 'bg-[#C89543] text-white shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Somente Ficha Cadastral
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('attendances')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  preset === 'attendances'
                    ? 'bg-[#C89543] text-white shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Histórico de Atendimentos
              </button>
            </div>

            {/* Print Action Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#C89543] hover:bg-[#b08137] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar em PDF</span>
              </button>
            </div>
          </div>

          {/* Granular Section Checkboxes */}
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-300">
            <span className="font-semibold text-slate-400">Incluir no documento:</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includePersonalData}
                onChange={(e) => setIncludePersonalData(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Dados Pessoais</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeDocuments}
                onChange={(e) => setIncludeDocuments(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Documentos</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeAddressAndContacts}
                onChange={(e) => setIncludeAddressAndContacts(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Endereço & Contatos</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeSocioeconomic}
                onChange={(e) => setIncludeSocioeconomic(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Socioeconômico</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includePrevidenciary}
                onChange={(e) => setIncludePrevidenciary(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Previdenciário</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeAttendanceHistory}
                onChange={(e) => setIncludeAttendanceHistory(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Atendimentos</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeClientSignature}
                onChange={(e) => setIncludeClientSignature(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Assinatura Cliente</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeLawyerSignature}
                onChange={(e) => setIncludeLawyerSignature(e.target.checked)}
                className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
              />
              <span>Visto Advogado</span>
            </label>
          </div>
        </div>

        {/* Gray Preview Drafting Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#CBD5E1]/60 flex justify-center items-start">
          {/* Authentic A4 Paper Sheet (Strictly 210mm x 297mm proportions) */}
          <div
            id="client-pdf-printable-area"
            className="bg-white text-slate-800 shadow-2xl border border-slate-300 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 space-y-5 rounded-xs box-border"
            style={{ width: '210mm' }}
          >
            {/* Header: Office Branding and Identification */}
            <div className="border-b-2 border-[#082A52] pb-3 flex items-start justify-between w-full">
              <div>
                <h1 className="text-xl font-black text-[#082A52] tracking-tight uppercase">
                  {officeName}
                </h1>
                <p className="text-xs font-semibold text-[#C89543] tracking-wider uppercase mt-0.5">
                  Previdência Social • Advocacia Previdenciária & Administrativa
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {lawyerName} • {lawyerOab}
                </p>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono">
                <span className="block font-bold text-[#082A52] text-xs">FICHA CADASTRAL</span>
                <span>Ref: #{client.id.toUpperCase()}</span>
                <span className="block mt-0.5">
                  Emitido em: {generatedAt.toLocaleDateString('pt-BR')} às{' '}
                  {generatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Profile Overview Card (Navy & Royal Accent) */}
            <div className="bg-[#082A52] text-white rounded-lg p-3.5 flex items-center gap-3.5 shadow-xs w-full">
              {/* Photo or Clean Monogram Placeholder */}
              <div className="w-14 h-14 rounded-lg bg-white/10 border border-[#C89543]/40 flex flex-col items-center justify-center shrink-0">
                <User className="w-6 h-6 text-[#C89543]" />
                <span className="text-[7px] font-bold tracking-wider text-slate-300 uppercase mt-0.5">
                  Sem Foto
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-black tracking-tight truncate">{client.fullName}</h2>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      client.status === 'INACTIVE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : client.status === 'CLOSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {client.status === 'INACTIVE'
                      ? 'Cadastro Inativo'
                      : client.status === 'CLOSED'
                      ? 'Contrato Assinado / Ativo'
                      : client.status === 'PENDING'
                      ? 'Em Maturação'
                      : 'Primeiro Contato / Ativo'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-200">
                  <span>
                    <strong className="text-[#C89543]">CPF:</strong> {formatCpf(client.cpf || '')}
                  </span>
                  <span>
                    <strong className="text-[#C89543]">RG:</strong> {client.rg || 'Não informado'}
                  </span>
                  <span>
                    <strong className="text-[#C89543]">Pasta:</strong>{' '}
                    {client.physicalFileLocation || 'Arquivo Geral'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Dados Pessoais & Documentos */}
            {(includePersonalData || includeDocuments) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {/* Dados Pessoais */}
                {includePersonalData && (
                  <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
                        <User className="w-2.5 h-2.5" />
                      </div>
                      <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
                        Dados Pessoais
                      </h3>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Nome Completo:</span>
                        <span className="font-semibold text-[#16324F] text-right truncate pl-2">
                          {client.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Nascimento:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {client.birthDate
                            ? `${formattedBirth} ${age !== null ? `(${age} anos)` : ''}`
                            : 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Estado Civil:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {formatMaritalStatus(client.maritalStatus)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Profissão:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {client.profession || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Nome da Mãe:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {client.motherName || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 shrink-0">Nome do Pai:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {client.fatherName || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documentos */}
                {includeDocuments && (
                  <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
                        <FileText className="w-2.5 h-2.5" />
                      </div>
                      <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
                        Documentos
                      </h3>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">CPF:</span>
                        <span className="font-mono font-bold text-[#16324F] text-right">
                          {formatCpf(client.cpf || '')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">RG:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {client.rg ? client.rg : 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Pasta Física:</span>
                        <span className="font-mono text-[11px] font-semibold text-slate-700 text-right truncate pl-2">
                          {client.physicalFileLocation || 'Arquivo Geral - Pasta Principal'}
                        </span>
                      </div>
                      <div className="pt-0.5">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
                          Documentos Vinculados à Pasta:
                        </span>
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <p>• Documentos pessoais de identificação (RG / CNH / CPF)</p>
                          <p>• Comprovante de residência atualizado</p>
                          <p>• Extrato Previdenciário do CNIS / CTPS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 2: Endereço & Contatos */}
            {includeAddressAndContacts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {/* Endereço */}
                <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
                      <MapPin className="w-2.5 h-2.5" />
                    </div>
                    <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
                      Endereço Residencial
                    </h3>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500 shrink-0">Logradouro:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2">
                        {client.street || 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500 shrink-0">Número / Compl:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2">
                        {client.streetNumber || 'S/N'}{' '}
                        {client.complement ? `(${client.complement})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500 shrink-0">Bairro:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2">
                        {client.neighborhood || 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500 shrink-0">Cidade / UF:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2">
                        {client.city ? `${client.city} - ${client.state || 'PB'}` : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500 shrink-0">CEP:</span>
                      <span className="font-mono font-medium text-[#16324F] text-right">
                        {client.postalCode || 'Não informado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contatos */}
                <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5" />
                    </div>
                    <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
                      Contatos & Recados
                    </h3>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500 shrink-0">Celular / WhatsApp:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2">
                        {client.mobilePhone || 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500 shrink-0">Telefone Fixo / Recado:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2">
                        {client.phone || 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500 shrink-0">E-mail:</span>
                      <span className="font-medium text-[#16324F] text-right truncate pl-2 lowercase">
                        {client.email || 'Não informado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Informações Socioeconômicas & Previdenciárias */}
            {(includeSocioeconomic || includePrevidenciary) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {/* Socioeconômico */}
                {includeSocioeconomic && (
                  <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
                        <Users className="w-2.5 h-2.5" />
                      </div>
                      <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
                        Composição Socioeconômica (LOAS)
                      </h3>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Qtd. de Dependentes:</span>
                        <span className="font-medium text-[#16324F] text-right">
                          {client.dependentCount !== undefined
                            ? `${client.dependentCount} dependente(s)`
                            : 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Pessoas no Grupo:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {householdMembers} {householdMembers === 1 ? 'pessoa' : 'pessoas'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Renda Familiar Total:</span>
                        <span className="font-bold text-[#16324F] text-right">
                          {formatCurrency(client.monthlyIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 shrink-0">Renda Per Capita (LOAS):</span>
                        <span className="font-bold text-[#0B78D0] text-right">
                          {perCapitaIncome}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Previdenciário */}
                {includePrevidenciary && (
                  <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
                        <Briefcase className="w-2.5 h-2.5" />
                      </div>
                      <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
                        Informações Previdenciárias
                      </h3>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Tipo de Benefício:</span>
                        <span className="font-semibold text-[#16324F] text-right truncate pl-2">
                          {client.benefitType || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 shrink-0">Número do Benefício (NB):</span>
                        <span className="font-mono font-medium text-[#16324F] text-right">
                          {client.benefitNumber || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 shrink-0">Categoria Especial:</span>
                        <span className="font-medium text-[#16324F] text-right truncate pl-2">
                          {client.specialCategories && client.specialCategories.length > 0
                            ? client.specialCategories.join(', ')
                            : 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observações / Fatos Narrados */}
            {client.notes && (
              <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1">
                <span className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider block">
                  Observações e Relato de Fatos
                </span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {client.notes}
                </p>
              </div>
            )}

            {/* Section 4: Histórico de Atendimentos */}
            {includeAttendanceHistory && (
              <div className="space-y-2 pt-1 w-full">
                <div className="flex items-center justify-between pb-1 border-b border-[#D8E5EF]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <h3 className="text-[11px] font-extrabold text-[#082A52] uppercase tracking-wider">
                      Histórico de Atendimentos Presenciais
                    </h3>
                  </div>
                  <span className="text-[9px] font-bold text-[#082A52] bg-[#EEF6FD] px-2 py-0.5 rounded-full border border-[#D8E5EF]">
                    Total de Consultas: {attendances.length || client.visitCount}
                  </span>
                </div>

                {attendances.length === 0 ? (
                  <div className="bg-[#EEF6FD] border border-[#D8E5EF] rounded-lg p-3 text-center text-xs text-slate-600">
                    Nenhum histórico detalhado de comparecimento registrado para este segurado.
                  </div>
                ) : (
                  <div className="border border-[#D8E5EF] rounded-lg overflow-hidden w-full">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-[#EEF6FD] text-[9px] uppercase font-bold text-[#082A52] border-b border-[#D8E5EF]">
                        <tr>
                          <th className="px-2.5 py-1.5">Data / Hora</th>
                          <th className="px-2.5 py-1.5">Tipo</th>
                          <th className="px-2.5 py-1.5">Profissional</th>
                          <th className="px-2.5 py-1.5">Status</th>
                          <th className="px-2.5 py-1.5">Objetivo / Observações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendances.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/50 break-inside-avoid">
                            <td className="px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap">
                              {new Date(att.attendedAt).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(att.attendedAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-2.5 py-1.5 font-medium text-[11px]">
                              {getAttendanceTypeLabel(att.attendanceType)}
                            </td>
                            <td className="px-2.5 py-1.5 text-slate-600 text-[11px]">
                              {att.attendantName || lawyerName}
                            </td>
                            <td className="px-2.5 py-1.5">
                              <span className="text-[8px] font-bold text-[#168447] bg-[#E3F7E9] px-1.5 py-0.5 rounded">
                                Realizado
                              </span>
                            </td>
                            <td className="px-2.5 py-1.5 text-[11px] text-slate-600">
                              <span className="font-semibold block text-[#16324F]">{att.objective}</span>
                              {att.narrativeHistory && (
                                <span className="line-clamp-2 text-slate-500 text-[10px]">
                                  {att.narrativeHistory}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Section 5: Bloco Formal de Assinaturas */}
            {(includeClientSignature || includeLawyerSignature) && (
              <div className="pt-4 pb-1 break-inside-avoid w-full">
                <div className="grid grid-cols-2 gap-8 text-center w-full">
                  {/* Assinatura do Cliente */}
                  {includeClientSignature && (
                    <div className="space-y-1">
                      <div className="h-10 flex items-end justify-center">
                        {/* Espaço em branco para firma manuscrita */}
                      </div>
                      <div className="w-full border-t border-slate-700 pt-1.5">
                        <span className="block text-xs font-bold text-[#082A52]">
                          {client.fullName}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono">
                          CPF: {formatCpf(client.cpf || '')}
                        </span>
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider">
                          Assinatura do Cliente / Segurado
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Assinatura do Advogado */}
                  {includeLawyerSignature && (
                    <div className="space-y-1">
                      <div className="h-10 flex items-end justify-center">
                        {/* Espaço para visto e carimbo da OAB */}
                      </div>
                      <div className="w-full border-t border-slate-700 pt-1.5">
                        <span className="block text-xs font-bold text-[#082A52]">
                          {lawyerName}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          {lawyerOab}
                        </span>
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider">
                          Advogado Responsável / Visto OAB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rodapé Oficial da Folha */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500 break-inside-avoid w-full">
              <span className="font-semibold text-[#082A52]">
                {officeName} — Todos os direitos reservados.
              </span>
              <span>
                Documento impresso em conformidade com o Estatuto da OAB e a LGPD (Lei nº 13.709/18).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
