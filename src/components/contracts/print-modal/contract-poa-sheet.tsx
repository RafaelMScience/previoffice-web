'use client';

import React from 'react';
import type { Contract } from '@/types/contract';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

interface ContractPoaSheetProps {
  contract: Contract;
  locale: string;
}

export function ContractPoaSheet({ contract, locale }: ContractPoaSheetProps) {
  const isEn = locale === 'en-US';

  const getFullTodayDate = () => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  };

  return (
    <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
      <div>
        {/* POA Header */}
        <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {isEn
              ? 'Judiciary Branch • National Social Security Institute'
              : 'Poder Judiciário • Instituto Nacional do Seguro Social'}
          </div>
          <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
            {isEn ? 'Power of Attorney Ad Judicia et Extra' : 'Procuração Ad Judicia et Extra'}
          </h2>
          <div className="text-xs text-[#168447] font-bold mt-0.5">
            {isEn
              ? 'Special Social Security Powers (Art. 105 CPC / Art. 22 Law 8,906/94)'
              : 'Poderes Especiais Previdenciários (Art. 105 do CPC / Art. 22 Lei 8.906/94)'}
          </div>
        </div>

        {contract.customPoaBody ? (
          <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
            {contract.customPoaBody}
          </div>
        ) : (
          <div className="space-y-3 text-xs leading-relaxed text-slate-800">
            <p>
              <strong>{isEn ? 'PRINCIPAL:' : 'OUTORGANTE:'}</strong> <strong>{contract.clientName}</strong>,{' '}
              {isEn ? 'Brazilian, registered under Tax ID (CPF) No.' : 'brasileiro(a), inscrito(a) no Cadastro de Pessoas Físicas (CPF/MF) sob o nº'}{' '}
              <span className="font-mono font-bold">{contract.clientCpf}</span>,{' '}
              {isEn ? 'residing and domiciled in the State of Amazonas.' : 'residente e domiciliado(a) no Estado do Amazonas.'}
            </p>

            <p>
              <strong>{isEn ? 'ATTORNEYS-IN-FACT:' : 'OUTORGADOS:'}</strong>{' '}
              <strong>{contract.lawyerName || (isEn ? 'Lead Attorney' : 'Advogado Responsável')}</strong>,{' '}
              {isEn ? 'attorney registered with the Brazilian Bar under' : 'advogado inscrito na Ordem dos Advogados do Brasil sob a'}{' '}
              {contract.lawyerOab || 'OAB/AM nº 00.000'},{' '}
              {isEn
                ? 'and associate attorneys belonging to the law firm'
                : 'e os advogados associados integrantes da sociedade'}{' '}
              <strong>{contract.officeName ? contract.officeName.toUpperCase() : isEn ? 'LAW FIRM' : 'SOCIEDADE DE ADVOGADOS'}</strong>,{' '}
              {isEn
                ? 'with professional address where they receive judicial notifications.'
                : 'com escritório profissional onde recebem notificações, intimações e correspondências de estilo.'}
            </p>

            <div>
              <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                {isEn ? 'GENERAL AD JUDICIA ET EXTRA POWERS' : 'PODERES DA CLÁUSULA AD JUDICIA ET EXTRA'}
              </h3>
              <p className="mt-0.5">
                {isEn
                  ? 'By this private instrument of power of attorney, the Principal grants to the Attorneys-in-fact broad and general ad judicia et extra powers to represent them before any Court, Federal or State Courts, Special Federal Courts, and public autarchies, notably the NATIONAL SOCIAL SECURITY INSTITUTE (INSS).'
                  : 'Por este instrumento particular de procuração, o(a) Outorgante confere aos outorgados amplos e gerais poderes da cláusula ad judicia et extra para o foro em geral, em conjunto ou separadamente, podendo representá-lo(a) perante qualquer Juízo, Instância, Tribunal da Justiça Estadual, Justiça Federal e Juizados Especiais Federais, bem como perante autarquias públicas, agências da Previdência Social — INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS), Conselho de Recursos da Previdência Social (CRPS), Receita Federal do Brasil e órgãos fazendários.'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                {isEn ? 'EXPRESS SPECIAL POWERS (ART. 105 BRAZILIAN CODE OF CIVIL PROCEDURE)' : 'PODERES ESPECIAIS EXPRESSOS (ART. 105 DO CÓDIGO DE PROCESSO CIVIL)'}
              </h3>
              <p className="mt-0.5">
                {isEn
                  ? 'Confers also special and express powers to petition, waive, settle, confess, sign covenants, receive summons, file administrative and judicial appeals, waive amounts exceeding 60 minimum wages in Special Federal Courts, and expressly RECEIVE AND WITHDRAW JUDICIAL WARRANTS, PRECATÓRIOS, AND RPVs before official federal banks, retaining contractual legal fees, and subdelegate with or without reservation of equal powers.'
                  : 'Confere ainda poderes especiais e expressos para requerer, desistir, transigir, acordar, anuir, confessar, firmar compromissos, receber citações e intimações, interpor recursos administrativos e judiciais, renunciar a valores excedentes ao teto de 60 (sessenta) salários mínimos dos Juizados Especiais Federais (quando benéfico à celeridade processual), prestar depoimento, dar e receber quitação total ou parcial, e expressamente RECEBER E LEVANTAR ALVARÁS JUDICIAIS, PRECATÓRIOS E REQUISIÇÕES DE PEQUENO VALOR (RPV) perante a Caixa Econômica Federal e o Banco do Brasil S/A, retendo a cota-parte dos honorários advocatícios estipulados no contrato formal de honorários, substabelecer com ou sem reserva de iguais poderes, dando tudo por bom, firme e valioso.'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                {isEn ? 'SPECIFIC PURPOSE OF MANDATE' : 'FINALIDADE ESPECÍFICA DO MANDATO'}
              </h3>
              <p className="mt-0.5">
                {isEn
                  ? `This power of attorney is specifically designated for the request, granting, and settlement of ${formatBenefitType(contract.benefitSpecies, 'en-US')} (Physical File Location: ${contract.physicalFileLocation}).`
                  : `A presente procuração destina-se especificamente ao pleito, concessão e liquidação do benefício previdenciário de ${formatBenefitType(contract.benefitSpecies, 'pt-BR')} (Pasta do Cliente: ${contract.physicalFileLocation}).`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="pt-8 space-y-8 break-inside-avoid text-xs">
        <div className="text-right text-slate-600">
          {isEn ? `Location, ${getFullTodayDate()}.` : `Localidade, ${getFullTodayDate()}.`}
        </div>

        <div className="max-w-xs mx-auto border-t border-slate-800 pt-2 text-center">
          <strong className="block text-slate-900">{contract.clientName}</strong>
          <span className="text-[11px] text-slate-500 font-mono">
            {isEn ? 'PRINCIPAL' : 'OUTORGANTE'} • {isEn ? 'Tax ID (CPF):' : 'CPF:'} {contract.clientCpf}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
          <div className="border-t border-slate-400 pt-1">
            <span>{isEn ? 'Signature on Behalf (if illiterate):' : 'Assinatura a Rogo (se analfabeto):'}</span><br />
            <span>{isEn ? 'Name:' : 'Nome:'} ____________________________________</span><br />
            <span>{isEn ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
          </div>

          <div className="border-t border-slate-400 pt-1">
            <span>{isEn ? 'Attesting Witness:' : 'Testemunha Instrumentária:'}</span><br />
            <span>{isEn ? 'Name:' : 'Nome:'} ____________________________________</span><br />
            <span>{isEn ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
}
