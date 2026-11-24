'use client';

import React from 'react';
import { Users, Briefcase } from 'lucide-react';
import type { Client } from '@/types/client';
import { formatBenefitType, formatSpecialCategories } from '@/lib/utils/benefit-translations';

interface ClientReportSocioeconomicSectionProps {
  client: Client;
  includeSocioeconomic: boolean;
  includePrevidenciary: boolean;
  isEn: boolean;
}

export function ClientReportSocioeconomicSection({
  client,
  includeSocioeconomic,
  includePrevidenciary,
  isEn,
}: ClientReportSocioeconomicSectionProps) {
  if (!includeSocioeconomic && !includePrevidenciary) return null;

  const formatCurrency = (val?: number): string => {
    if (val === undefined || val === null) return isEn ? 'Not informed' : 'Não informado';
    return new Intl.NumberFormat(isEn ? 'en-US' : 'pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const householdMembers = (client.dependentCount !== undefined ? client.dependentCount : 0) + 1;
  const perCapitaIncome =
    client.monthlyIncome !== undefined
      ? formatCurrency(client.monthlyIncome / householdMembers)
      : isEn
      ? 'Not informed'
      : 'Não informado';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {/* Socioeconômico */}
      {includeSocioeconomic && (
        <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
              <Users className="w-2.5 h-2.5" />
            </div>
            <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
              {isEn ? 'Socioeconomic Profile (LOAS)' : 'Composição Socioeconômica (LOAS)'}
            </h3>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Dependents Count:' : 'Qtd. de Dependentes:'}</span>
              <span className="font-medium text-[#16324F] text-right">
                {client.dependentCount !== undefined
                  ? `${client.dependentCount} ${
                      isEn
                        ? client.dependentCount === 1
                          ? 'dependent'
                          : 'dependents'
                        : client.dependentCount === 1
                        ? 'dependente'
                        : 'dependentes'
                    }`
                  : isEn
                  ? 'Not informed'
                  : 'Não informado'}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Household Members:' : 'Pessoas no Grupo:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {householdMembers}{' '}
                {isEn
                  ? householdMembers === 1
                    ? 'person'
                    : 'people'
                  : householdMembers === 1
                  ? 'pessoa'
                  : 'pessoas'}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Total Household Income:' : 'Renda Familiar Total:'}</span>
              <span className="font-bold text-[#16324F] text-right">
                {formatCurrency(client.monthlyIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 shrink-0">{isEn ? 'Per Capita Income (LOAS):' : 'Renda Per Capita (LOAS):'}</span>
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
              {isEn ? 'Social Security Information' : 'Informações Previdenciárias'}
            </h3>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">
                {isEn ? 'Benefit Species:' : 'Espécie do Benefício:'}
              </span>
              <span className="font-semibold text-[#16324F] text-right truncate pl-2">
                {formatBenefitType(client.benefitType, isEn ? 'en-US' : 'pt-BR')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 shrink-0">{isEn ? 'Benefit Number (NB):' : 'Número do Benefício (NB):'}</span>
              <span className="font-mono font-medium text-[#16324F] text-right">
                {client.benefitNumber || (isEn ? 'Not informed' : 'Não informado')}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 shrink-0">{isEn ? 'Special Category:' : 'Categoria Especial:'}</span>
              <span className="font-medium text-[#16324F] text-right truncate pl-2">
                {formatSpecialCategories(client.specialCategories, isEn ? 'en-US' : 'pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
