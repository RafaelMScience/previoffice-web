'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { Client } from '@/types/client';
import type { Attendance } from '@/types/attendance';
import { formatCpf } from '@/lib/domain/cpf-validator';
import { ClientReportPersonalSection } from './client-report-personal-section';
import { ClientReportAddressSection } from './client-report-address-section';
import { ClientReportSocioeconomicSection } from './client-report-socioeconomic-section';
import { ClientReportAttendancesSection } from './client-report-attendances-section';
import { ClientReportSignaturesSection } from './client-report-signatures-section';

export interface ClientReportSheetProps {
  client: Client;
  attendances?: Attendance[];
  lawyerName: string;
  lawyerOab: string;
  officeName: string;
  includePersonalData: boolean;
  includeDocuments: boolean;
  includeAddressAndContacts: boolean;
  includeSocioeconomic: boolean;
  includePrevidenciary: boolean;
  includeAttendanceHistory: boolean;
  includeClientSignature: boolean;
  includeLawyerSignature: boolean;
  isEn: boolean;
}

export function ClientReportSheet({
  client,
  attendances = [],
  lawyerName,
  lawyerOab,
  officeName,
  includePersonalData,
  includeDocuments,
  includeAddressAndContacts,
  includeSocioeconomic,
  includePrevidenciary,
  includeAttendanceHistory,
  includeClientSignature,
  includeLawyerSignature,
  isEn,
}: ClientReportSheetProps) {
  const generatedAt = new Date();

  return (
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
            {isEn
              ? 'Social Security Law • Legal & Administrative Practice'
              : 'Previdência Social • Advocacia Previdenciária e Administrativa'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {lawyerName} • {lawyerOab}
          </p>
        </div>

        <div className="text-right text-[10px] text-slate-500 font-mono">
          <span className="block font-bold text-[#082A52] text-xs">
            {isEn ? 'CLIENT RECORD' : 'FICHA CADASTRAL'}
          </span>
          <span>Ref: #{client.id.toUpperCase()}</span>
          <span className="block mt-0.5">
            {isEn
              ? `Issued on: ${generatedAt.toLocaleDateString('en-US')} at ${generatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
              : `Emitido em: ${generatedAt.toLocaleDateString('pt-BR')} às ${generatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
          </span>
        </div>
      </div>

      {/* Profile Overview Card (Navy & Royal Accent) */}
      <div className="bg-[#082A52] text-white rounded-lg p-3.5 flex items-center gap-3.5 shadow-xs w-full">
        {/* Photo or Clean Monogram Placeholder */}
        {client.photoReference ? (
          <img
            src={client.photoReference}
            alt={client.fullName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-lg object-cover border border-[#C89543]/40 shrink-0"
            loading="eager"
            decoding="sync"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-white/10 border border-[#C89543]/40 flex flex-col items-center justify-center shrink-0">
            <User className="w-6 h-6 text-[#C89543]" />
            <span className="text-[7px] font-bold tracking-wider text-slate-300 uppercase mt-0.5">
              {isEn ? 'No Photo' : 'Sem Foto'}
            </span>
          </div>
        )}

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
                ? (isEn ? 'Inactive Client' : 'Cadastro Inativo')
                : client.status === 'CLOSED'
                ? (isEn ? 'Signed Contract' : 'Contrato Assinado')
                : client.status === 'PENDING'
                ? (isEn ? 'Maturing Lead' : 'Em Maturação')
                : (isEn ? 'Active Client' : 'Primeiro Contato')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-200">
            <span>
              <strong className="text-[#C89543]">{isEn ? 'Tax ID:' : 'CPF:'}</strong> {formatCpf(client.cpf || '')}
            </span>
            <span>
              <strong className="text-[#C89543]">{isEn ? 'ID:' : 'RG:'}</strong> {client.rg || (isEn ? 'Not informed' : 'Não informado')}
            </span>
            <span>
              <strong className="text-[#C89543]">{isEn ? 'Folder:' : 'Pasta:'}</strong>{' '}
              {client.physicalFileLocation || (isEn ? 'General Archive' : 'Arquivo Geral')}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Dados Pessoais & Documentos */}
      <ClientReportPersonalSection
        client={client}
        includePersonalData={includePersonalData}
        includeDocuments={includeDocuments}
        isEn={isEn}
      />

      {/* Section 2: Endereço & Contatos */}
      <ClientReportAddressSection
        client={client}
        includeAddressAndContacts={includeAddressAndContacts}
        isEn={isEn}
      />

      {/* Section 3: Informações Socioeconômicas & Previdenciárias */}
      <ClientReportSocioeconomicSection
        client={client}
        includeSocioeconomic={includeSocioeconomic}
        includePrevidenciary={includePrevidenciary}
        isEn={isEn}
      />

      {/* Observações / Fatos Narrados */}
      {client.notes && (
        <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1">
          <span className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider block">
            {isEn ? 'Notes and Reported Facts' : 'Observações e Relato de Fatos'}
          </span>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {client.notes}
          </p>
        </div>
      )}

      {/* Section 4: Histórico de Atendimentos */}
      <ClientReportAttendancesSection
        attendances={attendances}
        visitCount={client.visitCount}
        lawyerName={lawyerName}
        includeAttendanceHistory={includeAttendanceHistory}
        isEn={isEn}
      />

      {/* Section 5: Bloco Formal de Assinaturas e Rodapé */}
      <ClientReportSignaturesSection
        client={client}
        lawyerName={lawyerName}
        lawyerOab={lawyerOab}
        officeName={officeName}
        includeClientSignature={includeClientSignature}
        includeLawyerSignature={includeLawyerSignature}
        isEn={isEn}
      />
    </div>
  );
}
