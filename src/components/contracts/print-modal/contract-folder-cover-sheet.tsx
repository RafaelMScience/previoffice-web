'use client';

import React from 'react';
import { Scale } from 'lucide-react';
import type { Contract } from '@/types/contract';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

interface ContractFolderCoverSheetProps {
  contract: Contract;
  locale: string;
}

export function ContractFolderCoverSheet({ contract, locale }: ContractFolderCoverSheetProps) {
  const isEn = locale === 'en-US';

  const getFullTodayDate = () => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  };

  return (
    <div className="border-4 border-double border-[#082A52] p-6 sm:p-8 rounded-lg space-y-6">
      {/* Cover Header */}
      <div className="text-center border-b-2 border-[#082A52] pb-4">
        <div className="flex items-center justify-center gap-2 text-[#082A52] mb-1">
          <Scale className="w-5 h-5 text-[#C89543]" />
          <span className="font-bold uppercase tracking-wider text-xs">
            {contract.officeName || (isEn ? 'Law Firm' : 'Sociedade de Advogados')}
          </span>
        </div>
        <h2 className="font-extrabold text-lg sm:text-xl text-[#082A52] uppercase tracking-tight">
          {isEn ? 'Social Security Case File' : 'Dossiê do Processo Previdenciário'}
        </h2>
        <div className="text-xs text-[#C89543] font-bold uppercase tracking-widest mt-0.5">
          {isEn
            ? 'Central Physical Archive • OAB Records Management'
            : 'Arquivo Físico Central • Gestão Documental OAB'}
        </div>
      </div>

      {/* Folder Badge Box */}
      <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            {isEn ? 'Folder Identification' : 'Identificação da Pasta'}
          </span>
          <div className="text-2xl font-mono font-extrabold text-[#082A52]">
            {contract.contractNumber}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            {isEn ? 'Cabinet & Drawer' : 'Armário e Gaveta'}
          </span>
          <div className="text-sm font-bold text-[#C89543]">
            {contract.physicalFileLocation ||
              (isEn ? 'General Cabinet - Drawer 01' : 'Armário Geral - Gaveta 01')}
          </div>
        </div>
      </div>

      {/* Client Data Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
          {isEn ? 'Client Registration Data' : 'Dados Cadastrais do Segurado(a)'}
        </h3>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 text-slate-500 font-medium w-40">
                {isEn ? 'Full Name:' : 'Nome Completo:'}
              </td>
              <td className="py-1.5 font-bold text-slate-900">{contract.clientName}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 text-slate-500 font-medium">
                {isEn ? 'Tax ID (CPF):' : 'CPF:'}
              </td>
              <td className="py-1.5 font-mono font-bold text-slate-900">{contract.clientCpf}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 text-slate-500 font-medium">
                {isEn ? 'Benefit Species:' : 'Espécie do Benefício:'}
              </td>
              <td className="py-1.5 font-bold text-[#082A52]">
                {formatBenefitType(contract.benefitSpecies, isEn ? 'en-US' : 'pt-BR')}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 text-slate-500 font-medium">
                {isEn ? 'Registered Contract:' : 'Contrato Registrado:'}
              </td>
              <td className="py-1.5 font-mono text-slate-800">{contract.contractNumber}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 text-slate-500 font-medium">
                {isEn ? 'Contact Phone:' : 'Telefone de Contato:'}
              </td>
              <td className="py-1.5 text-slate-800">
                {contract.clientPhone || (isEn ? 'Not informed' : 'Não informado')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Physical Documents Checklist */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
          {isEn ? 'Mandatory Physical Documents in File' : 'Rol de Documentos Físicos Obrigatórios da Pasta'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">[  ]</span>
            <span>{isEn ? 'Original Signed Power of Attorney' : 'Procuração Ad Judicia Original Assinada'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">[  ]</span>
            <span>{isEn ? 'Signed Legal Fee Agreement' : 'Contrato de Honorários OAB Assinado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">[  ]</span>
            <span>{isEn ? 'Copy of Client ID and Tax ID' : 'Cópia de RG e CPF do Segurado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">[  ]</span>
            <span>{isEn ? 'Updated Proof of Residence' : 'Comprovante de Residência Atualizado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">[  ]</span>
            <span>{isEn ? 'Full CNIS Statement and Physical Work Card' : 'Extrato CNIS Integral e CTPS Física'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">[  ]</span>
            <span>{isEn ? 'Rural Declaration or Documentary Evidence' : 'Declaração Rural ou Prova Material e Laudos'}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
        <span>{isEn ? 'Filing Date:' : 'Data de Autuação:'} {getFullTodayDate()}</span>
        <span>{contract.officeName || (isEn ? 'Law Firm' : 'Sociedade de Advogados')} • {contract.lawyerOab || 'OAB/AM'}</span>
      </div>
    </div>
  );
}
