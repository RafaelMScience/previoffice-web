'use client';

import React from 'react';
import {
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  Scale,
  Award,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { calculateAge, checkRuralRetirementAge } from '@/lib/domain/benefit-rules';
import type { Client } from '@/types/client';

interface BenefitDiagnosticCardProps {
  client: Client;
}

export function BenefitDiagnosticCard({ client }: BenefitDiagnosticCardProps) {
  const { t } = useI18n();

  const birthDate = client.birthDate;
  const ageCalc = birthDate ? calculateAge(birthDate) : null;
  const age = ageCalc ? ageCalc.years : null;
  const months = ageCalc ? ageCalc.months : null;

  // Assuming female by default or checked from client data
  const isFemale = true;
  const ruralTargetAge = isFemale ? 55 : 60;
  const urbanTargetAge = isFemale ? 62 : 65;
  const loasTargetAge = 65;

  const ruralEligible = age !== null && age >= ruralTargetAge;
  const urbanEligible = age !== null && age >= urbanTargetAge;
  const loasEligible = age !== null && age >= loasTargetAge;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C89543]" />
            <h2 className="text-lg font-bold text-slate-900">{t.clientDetails.diagnosticTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.clientDetails.diagnosticSubtitle}</p>
        </div>

        {age !== null && (
          <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-xl text-center border border-slate-200">
            <span className="text-xs text-slate-500 block font-semibold">Idade Atual</span>
            <span className="text-lg font-bold text-[#0B192E]">
              {age} anos {months !== null && `e ${months}m`}
            </span>
          </div>
        )}
      </div>

      {/* Diagnostic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Aposentadoria Rural */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            ruralEligible
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rural (Segurado Especial)
            </span>
            {ruralEligible ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Idade Atingida
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                <Clock className="w-3.5 h-3.5" /> Idade Faltante
              </span>
            )}
          </div>

          <div className="text-base font-bold text-slate-900 mb-1">
            Requisito: {ruralTargetAge} anos
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {ruralEligible
              ? `Segurado já atingiu a idade mínima rural (${ruralTargetAge} anos). Necessário comprovar 180 meses de efetivo exercício de atividade rural em regime de economia familiar.`
              : age !== null
              ? `Faltam ${Math.max(0, ruralTargetAge - age)} ano(s) para atingir a idade mínima rural. Iniciar instrução probatória (ITR, notas fiscais, certidão de casamento).`
              : 'Informe a data de nascimento para calcular a idade.'}
          </p>
        </div>

        {/* Card 2: Aposentadoria Urbana */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            urbanEligible
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urbana (Idade EC 103/19)
            </span>
            {urbanEligible ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Idade Atingida
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full border border-slate-300">
                <Clock className="w-3.5 h-3.5" /> Idade Faltante
              </span>
            )}
          </div>

          <div className="text-base font-bold text-slate-900 mb-1">
            Requisito: {urbanTargetAge} anos
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {urbanEligible
              ? `Atingiu a idade mínima urbana da EC 103/2019 (${urbanTargetAge} anos). Exige carência mínima de 15 anos de contribuição (180 recolhimentos no CNIS).`
              : age !== null
              ? `Faltam ${Math.max(0, urbanTargetAge - age)} ano(s) para a idade urbana. Conferir se há tempo de contribuição para regras de transição (pedágio ou pontos).`
              : 'Informe a data de nascimento para calcular.'}
          </p>
        </div>

        {/* Card 3: BPC / LOAS */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            loasEligible
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              BPC / LOAS Idoso
            </span>
            {loasEligible ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Idade Apta (65+)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full border border-slate-300">
                Abaixo de 65 anos
              </span>
            )}
          </div>

          <div className="text-base font-bold text-slate-900 mb-1">
            Critério: Idade ≥ 65 anos
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {loasEligible
              ? 'Atende ao critério etário do BPC/LOAS. Requer CadÚnico atualizado e renda familiar per capita inferior a 1/4 do salário mínimo (Art. 20, Lei 8.742/93).'
              : 'Se for menor de 65 anos, o BPC só é cabível na modalidade Pessoa com Deficiência (PCD), exigindo impedimento de longo prazo e laudo pericial.'}
          </p>
        </div>
      </div>

      {/* Legal Action Checklist for the Lawyer */}
      <div className="bg-[#0B192E]/5 border border-[#0B192E]/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-[#0B192E] font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#C89543]" />
          Orientações Práticas de Mesa para o Advogado
        </div>
        <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
          <li>
            <strong>Senha do Meu INSS:</strong> Verificar se a senha está válida para puxar o Extrato CNIS e o Laudo SABI diretamente.
          </li>
          <li>
            <strong>Conferência de Vínculos Extemporâneos:</strong> Procurar indicadores como `PREM-EXT`, `IEAN` ou `PEXT` no extrato CNIS para retificação documental.
          </li>
          <li>
            <strong>Prova Material Rural:</strong> Solicitar certidões de nascimento dos filhos, certidão de casamento civil ou religioso e declarações de sindicato rural de época.
          </li>
        </ul>
      </div>
    </div>
  );
}
