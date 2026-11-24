'use client';

import React from 'react';
import { User, FileText } from 'lucide-react';
import type { Client, MaritalStatus } from '@/types/client';
import { formatCpf } from '@/lib/domain/cpf-validator';

interface ClientReportPersonalSectionProps {
  client: Client;
  includePersonalData: boolean;
  includeDocuments: boolean;
  isEn: boolean;
}

export function ClientReportPersonalSection({
  client,
  includePersonalData,
  includeDocuments,
  isEn,
}: ClientReportPersonalSectionProps) {
  if (!includePersonalData && !includeDocuments) return null;

  const calculateAge = (dateString?: string): number | null => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return null;
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const formatBirthDate = (dateString?: string): string => {
    if (!dateString) return isEn ? 'Not informed' : 'Não informado';
    try {
      const parts = dateString.split('T')[0].split('-');
      if (parts.length === 3) {
        if (isEn) return `${parts[1]}/${parts[2]}/${parts[0]}`;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const formatMaritalStatus = (status?: MaritalStatus): string => {
    if (isEn) {
      switch (status) {
        case 'SINGLE':
          return 'Single';
        case 'MARRIED':
          return 'Married';
        case 'STABLE_UNION':
          return 'Stable Union';
        case 'DIVORCED':
          return 'Divorced';
        case 'SEPARATED':
          return 'Separated';
        case 'WIDOWED':
          return 'Widowed';
        default:
          return status || 'Not informed';
      }
    }
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {/* Dados Pessoais */}
      {includePersonalData && (
        <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
              <User className="w-2.5 h-2.5" />
            </div>
            <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
              {isEn ? 'Personal Data' : 'Dados Pessoais'}
            </h3>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Full Name:' : 'Nome Completo:'}</span>
              <span className="font-semibold text-[#16324F] text-right truncate pl-2">
                {client.fullName}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Date of Birth:' : 'Nascimento:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {client.birthDate
                  ? `${formattedBirth} ${age !== null ? (isEn ? `(${age} years old)` : `(${age} anos)`) : ''}`
                  : (isEn ? 'Not informed' : 'Não informado')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Marital Status:' : 'Estado Civil:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {formatMaritalStatus(client.maritalStatus)}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Profession:' : 'Profissão:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {client.profession || (isEn ? 'Not informed' : 'Não informado')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? "Mother's Name:" : 'Nome da Mãe:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {client.motherName || (isEn ? 'Not informed' : 'Não informado')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 shrink-0">{isEn ? "Father's Name:" : 'Nome do Pai:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {client.fatherName || (isEn ? 'Not informed' : 'Não informado')}
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
              {isEn ? 'Documents' : 'Documentos'}
            </h3>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Tax ID (CPF):' : 'CPF:'}</span>
              <span className="font-mono font-bold text-[#16324F] text-right">
                {formatCpf(client.cpf || '')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Identity Card (RG):' : 'RG:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {client.rg ? client.rg : (isEn ? 'Not informed' : 'Não informado')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Physical Folder:' : 'Pasta Física:'}</span>
              <span className="font-mono text-[11px] font-semibold text-slate-700 text-right truncate pl-2">
                {client.physicalFileLocation || (isEn ? 'General Archive - Main Folder' : 'Arquivo Geral - Pasta Principal')}
              </span>
            </div>
            <div className="pt-0.5">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
                {isEn ? 'Attached Documents:' : 'Documentos Vinculados à Pasta:'}
              </span>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>• {isEn ? 'Personal identification documents' : 'Documentos pessoais de identificação'}</p>
                <p>• {isEn ? 'Updated proof of residence' : 'Comprovante de residência atualizado'}</p>
                <p>• {isEn ? 'Social security statement (CNIS and Work Card)' : 'Extrato Previdenciário do CNIS e CTPS'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
