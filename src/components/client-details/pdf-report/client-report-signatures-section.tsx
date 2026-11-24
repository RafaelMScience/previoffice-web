'use client';

import React from 'react';
import type { Client } from '@/types/client';
import { formatCpf } from '@/lib/domain/cpf-validator';

interface ClientReportSignaturesSectionProps {
  client: Client;
  lawyerName: string;
  lawyerOab: string;
  officeName: string;
  includeClientSignature: boolean;
  includeLawyerSignature: boolean;
  isEn: boolean;
}

export function ClientReportSignaturesSection({
  client,
  lawyerName,
  lawyerOab,
  officeName,
  includeClientSignature,
  includeLawyerSignature,
  isEn,
}: ClientReportSignaturesSectionProps) {
  return (
    <>
      {/* Bloco Formal de Assinaturas */}
      {(includeClientSignature || includeLawyerSignature) && (
        <div className="pt-4 pb-1 break-inside-avoid w-full">
          <div className="grid grid-cols-2 gap-8 text-center w-full">
            {/* Assinatura do Cliente */}
            {includeClientSignature && (
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center" />
                <div className="w-full border-t border-slate-700 pt-1.5">
                  <span className="block text-xs font-bold text-[#082A52]">
                    {client.fullName}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    {isEn ? 'Tax ID (CPF):' : 'CPF:'} {formatCpf(client.cpf || '')}
                  </span>
                  <span className="block text-[8px] text-slate-600 font-bold uppercase tracking-wider">
                    {isEn ? 'Client Signature' : 'Assinatura do Cliente'}
                  </span>
                </div>
              </div>
            )}

            {/* Assinatura do Advogado */}
            {includeLawyerSignature && (
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center" />
                <div className="w-full border-t border-slate-700 pt-1.5">
                  <span className="block text-xs font-bold text-[#082A52]">
                    {lawyerName}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    {lawyerOab}
                  </span>
                  <span className="block text-[8px] text-slate-600 font-bold uppercase tracking-wider">
                    {isEn ? 'Responsible Attorney' : 'Advogado Responsável'}
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
          {officeName} — {isEn ? 'All rights reserved.' : 'Todos os direitos reservados.'}
        </span>
        <span>
          {isEn
            ? 'Official document printed in accordance with Bar Association regulations and Data Privacy laws.'
            : 'Documento impresso em conformidade com o Estatuto da OAB e a LGPD (Lei nº 13.709/18).'}
        </span>
      </div>
    </>
  );
}
