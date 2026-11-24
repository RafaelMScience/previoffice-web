'use client';

import React from 'react';
import type { Contract } from '@/types/contract';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import { formatDatePtBR } from '@/lib/utils/template-engine';

interface ContractAgreementSheetProps {
  contract: Contract;
  locale: string;
}

export function ContractAgreementSheet({ contract, locale }: ContractAgreementSheetProps) {
  const isEn = locale === 'en-US';
  const quotaLitis = contract.feeStructure.quotaLitisPercentage || 30;
  const fixedTotal = contract.feeStructure.fixedTotalAmount || 0;
  const installments = contract.feeStructure.installments || [];

  const formatBRL = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

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
        {/* Office Header */}
        <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {contract.officeName || (isEn ? 'Law Firm' : 'Sociedade de Advogados')} • OAB
          </div>
          <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
            {isEn
              ? 'Agreement for Legal Services and Attorney Fees'
              : 'Contrato de Prestação de Serviços Advocatícios e Honorários'}
          </h2>
          <div className="text-xs text-[#C89543] font-bold mt-0.5">
            {isEn ? 'Private Instrument No.' : 'Instrumento Particular Nº'} {contract.contractNumber} •{' '}
            {formatBenefitType(contract.benefitSpecies, isEn ? 'en-US' : 'pt-BR')}
          </div>
        </div>

        {contract.customContractBody ? (
          <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
            {contract.customContractBody}
          </div>
        ) : (
          <>
            {/* Qualification */}
            <div className="space-y-2 text-xs leading-relaxed text-slate-800">
              <p>
                <strong>{isEn ? 'CLIENT:' : 'CONTRATANTE:'}</strong> <strong>{contract.clientName}</strong>,{' '}
                {isEn ? 'registered under Tax ID (CPF) No.' : 'inscrito(a) no CPF/MF sob o nº'}{' '}
                <span className="font-mono font-bold">{contract.clientCpf}</span>,{' '}
                {isEn ? 'telephone' : 'telefone'} <span>{contract.clientPhone || (isEn ? 'Not informed' : 'Não informado')}</span>,{' '}
                {isEn
                  ? 'domiciled in the State of Amazonas, hereinafter referred to simply as the CLIENT.'
                  : 'domiciliado(a) no Estado do Amazonas, doravante denominado(a) simplesmente CONTRATANTE.'}
              </p>

              <p>
                <strong>{isEn ? 'LAW FIRM:' : 'CONTRATADA:'}</strong>{' '}
                <strong>{contract.officeName ? contract.officeName.toUpperCase() : isEn ? 'LAW FIRM' : 'SOCIEDADE DE ADVOGADOS'}</strong>,{' '}
                {isEn
                  ? 'legal entity registered with the Brazilian Bar Association (OAB), represented by the attorney'
                  : 'pessoa jurídica de direito privado inscrita na OAB sob o registro competente, representada pelo advogado'}{' '}
                <strong>{contract.lawyerName || (isEn ? 'Lead Attorney' : 'Advogado Responsável')}</strong>,{' '}
                {isEn ? 'registered under' : 'inscrito na'}{' '}
                <strong>{contract.lawyerOab || 'OAB/AM 00.000'}</strong>,{' '}
                {isEn
                  ? 'having its principal office established in this district, hereinafter referred to simply as the LAW FIRM.'
                  : 'com sede e escritório profissional estabelecido nesta comarca, doravante denominada simplesmente CONTRATADA.'}
              </p>
            </div>

            {/* Clauses */}
            <div className="space-y-3 pt-2 text-xs leading-relaxed text-slate-800">
              <div>
                <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                  {isEn ? 'CLAUSE ONE — SCOPE AND SPONSORSHIP' : 'CLÁUSULA PRIMEIRA — DO OBJETO E PATROCÍNIO'}
                </h3>
                <p className="mt-0.5">
                  {isEn
                    ? `The purpose of this instrument is the provision of legal services and advocacy by the LAW FIRM in favor of the CLIENT, aiming at administrative filings before the NATIONAL SOCIAL SECURITY INSTITUTE (INSS) and, if necessary, federal or state lawsuits for the granting of ${formatBenefitType(contract.benefitSpecies, 'en-US')}.`
                    : `O presente instrumento tem por objeto a prestação de serviços jurídicos e assessoria contenciosa pela CONTRATADA em favor do CONTRATANTE, visando ao requerimento, postulação administrativa perante o INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS) e, se necessário, o ajuizamento de competente Ação Previdenciária perante a Justiça Federal ou Estadual, com vistas à concessão e liquidação do benefício de ${formatBenefitType(contract.benefitSpecies, 'pt-BR')}.`}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                  {isEn ? 'CLAUSE TWO — ATTORNEY FEES' : 'CLÁUSULA SEGUNDA — DOS HONORÁRIOS ADVOCATÍCIOS CONTRATUAIS'}
                </h3>
                {contract.feeStructure.feeModel === 'QUOTA_LITIS' && (
                  <p className="mt-0.5">
                    {isEn
                      ? `In consideration of the services agreed upon, the CLIENT will pay the LAW FIRM success fees (Quota Litis) at the rate of ${quotaLitis}% (${quotaLitis} percent) on the full economic benefit obtained, corresponding to the total retroactive amounts from the date of application (DER) until actual benefit granting.`
                      : `Em remuneração pelos serviços ora pactuados, o CONTRATANTE pagará à CONTRATADA honorários advocatícios ad exitum (Quota Litis) no percentual de ${quotaLitis}% (${quotaLitis} por cento) incidentes sobre a totalidade do proveito econômico auferido na causa, correspondente ao montante dos valores retroativos apurados desde a Data de Entrada do Requerimento (DER) até a efetiva implantação do benefício previdenciário pelo INSS.`}
                  </p>
                )}

                {contract.feeStructure.feeModel === 'FIXED_INSTALLMENT' && (
                  <div className="mt-0.5 space-y-1">
                    <p>
                      {isEn
                        ? `For the services rendered, the CLIENT will pay the LAW FIRM the fixed amount of ${formatBRL(fixedTotal)}, divided into ${contract.feeStructure.installmentCount || installments.length || 1} monthly installment(s) of ${formatBRL(installments[0]?.amount || (fixedTotal / (contract.feeStructure.installmentCount || installments.length || 1)))}, settled according to the following schedule:`
                        : `Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA a quantia líquida e certa de ${formatBRL(fixedTotal)}, parcelada em ${contract.feeStructure.installmentCount || installments.length || 1} prestação(ões) mensal(is) de ${formatBRL(installments[0]?.amount || (fixedTotal / (contract.feeStructure.installmentCount || installments.length || 1)))}, devidamente registradas e solvidas conforme o seguinte cronograma:`}
                    </p>
                    {installments.length > 0 && (
                      <div className="pl-3 py-1 space-y-0.5 font-mono text-[11px] text-slate-700">
                        {installments.map((inst) => (
                          <div key={inst.id || inst.installmentNumber}>
                            • {isEn ? 'Installment' : 'Parcela'} {inst.installmentNumber}/{contract.feeStructure.installmentCount || installments.length}: {formatBRL(inst.amount)} — {isEn ? 'Due on' : 'Vencimento em'} {formatDatePtBR(inst.dueDate)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {contract.feeStructure.feeModel === 'HYBRID' && (
                  <div className="mt-0.5 space-y-1">
                    <p>
                      {isEn
                        ? 'For the services rendered, the parties agree on hybrid compensation:'
                        : 'Pelos serviços prestados, as partes convencionam remuneração advocatícia sob o regime híbrido (cumulativo):'}
                    </p>
                    <p className="pl-2">
                      <strong>{isEn ? 'I — Fixed Retainer (Pro Labore):' : 'I — Parcela Fixa (Pro Labore):'}</strong>{' '}
                      {formatBRL(contract.feeStructure.fixedTotalAmount)}, {isEn ? 'split into' : 'parcelado em'}{' '}
                      {contract.feeStructure.installmentCount || installments.length || 1}{' '}
                      {isEn ? 'monthly installment(s) of' : 'prestação(ões) mensal(is) de'}{' '}
                      {formatBRL(installments[0]?.amount || ((contract.feeStructure.fixedTotalAmount || 0) / (contract.feeStructure.installmentCount || installments.length || 1)))}.
                    </p>
                    {installments.length > 0 && (
                      <div className="pl-5 py-0.5 space-y-0.5 font-mono text-[11px] text-slate-700">
                        {installments.map((inst) => (
                          <div key={inst.id || inst.installmentNumber}>
                            • {isEn ? 'Installment' : 'Parcela'} {inst.installmentNumber}/{contract.feeStructure.installmentCount || installments.length}: {formatBRL(inst.amount)} — {isEn ? 'Due on' : 'Vencimento em'} {formatDatePtBR(inst.dueDate)}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="pl-2">
                      <strong>{isEn ? 'II — Success Fee (Quota Litis):' : 'II — Parcela de Êxito (Quota Litis):'}</strong>{' '}
                      {quotaLitis}% ({quotaLitis} {isEn ? 'percent' : 'por cento'}) {isEn ? 'on retroactive amounts.' : 'incidente sobre todos os valores atrasados apurados entre a DER e a efetiva implantação do benefício.'}
                    </p>
                  </div>
                )}

                <p className="mt-1">
                  <strong>{isEn ? 'Single Paragraph — Direct Retention at Source:' : 'Parágrafo Único — Destacamento de Honorários na Fonte:'}</strong>{' '}
                  {isEn
                    ? 'The LAW FIRM is expressly authorized to file this contract before court for direct payment of attorney fees via judicial requisition (RPV or Precatório) under Brazilian Federal Law 8,906/94 (art. 22, § 4).'
                    : 'Fica a CONTRATADA expressamente autorizada a requerer perante o juízo competente a juntada do presente contrato para fins de retenção e expedição de Requisição de Pequeno Valor (RPV) ou Precatório em seu próprio nome referente à sua cota-parte, nos exatos termos do artigo 22, § 4º da Lei Federal nº 8.906/94 (Estatuto da Advocacia e da OAB).'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                  {isEn ? 'CLAUSE THREE — STATUTORY FEES' : 'CLÁUSULA TERCEIRA — DOS HONORÁRIOS SUCUMBENCIAIS'}
                </h3>
                <p className="mt-0.5">
                  {isEn
                    ? 'Any court-awarded statutory fees belong exclusively to the attorneys, not offsetting the contractual fees stipulated in Clause Two (art. 23 of Law 8,906/94).'
                    : 'Os honorários advocatícios eventualmente arbitrados judicialmente a título de sucumbência pertencerão com exclusividade aos patronos da causa, não se confundindo nem se compensando com os honorários contratuais estipulados na Cláusula Segunda (art. 23 da Lei 8.906/94).'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                  {isEn ? 'CLAUSE FOUR — COOPERATION DUTIES' : 'CLÁUSULA QUARTA — DOS DEVERES DE COOPERAÇÃO E VERACIDADE'}
                </h3>
                <p className="mt-0.5">
                  {isEn
                    ? 'The CLIENT undertakes to provide with accuracy and punctuality all civil certificates, work cards, and evidence required for the legal proceedings.'
                    : 'O CONTRATANTE obriga-se a fornecer com exatidão e pontualidade todos os documentos, certidões civis, comprovantes de trabalho rural/urbano e relatórios necessários ao deslinde da causa, responsabilizando-se civil e penalmente pelas informações declaradas à banca.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                  {isEn ? 'CLAUSE FIVE — TERMINATION' : 'CLÁUSULA QUINTA — DA RESCISÃO E REVOGAÇÃO DE MANDATO'}
                </h3>
                <p className="mt-0.5">
                  {isEn
                    ? 'Unilateral revocation of power of attorney without proven cause does not exempt the CLIENT from proportional payment of fees due for the work performed.'
                    : 'A revogação unilateral do mandato outorgado sem justo motivo comprovado não desonera o CONTRATANTE do pagamento proporcional dos honorários devidos pelo trabalho profissional até então desempenhado pelos advogados.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                  {isEn ? 'CLAUSE SIX — JURISDICTION' : 'CLÁUSULA SEXTA — DO FORO DE ELEIÇÃO'}
                </h3>
                <p className="mt-0.5">
                  {isEn
                    ? 'To resolve any disputes arising from this contract, the parties elect the district court of the CLIENT domicile.'
                    : 'Para dirimir quaisquer controvérsias decorrentes do presente contrato, as partes elegem o foro da Comarca de domicílio do CONTRATANTE, com expressa renúncia de qualquer outro.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Signatures */}
      <div className="pt-6 space-y-8 break-inside-avoid text-xs">
        <div className="text-right text-slate-600">
          {isEn ? `Location, ${getFullTodayDate()}.` : `Localidade, ${getFullTodayDate()}.`}
        </div>

        <div className="grid grid-cols-2 gap-8 text-center pt-2">
          <div className="border-t border-slate-800 pt-1.5">
            <strong className="block text-slate-900">{contract.clientName}</strong>
            <span className="text-[11px] text-slate-500 font-mono">
              {isEn ? 'CLIENT' : 'CONTRATANTE'} • {isEn ? 'Tax ID (CPF):' : 'CPF:'} {contract.clientCpf}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-1.5">
            <strong className="block text-slate-900">{contract.lawyerName || (isEn ? 'Lead Attorney' : 'Advogado Responsável')}</strong>
            <span className="text-[11px] text-slate-500">
              {contract.officeName || (isEn ? 'Law Firm' : 'Sociedade de Advogados')} • {contract.lawyerOab || 'OAB/AM'} • {isEn ? 'LAW FIRM' : 'CONTRATADA'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
          <div className="border-t border-slate-400 pt-1">
            <span>{isEn ? 'Signature on Behalf (if illiterate):' : 'Assinatura a Rogo (se analfabeto):'}</span><br />
            <span>{isEn ? 'Name:' : 'Nome:'} ____________________________________</span><br />
            <span>{isEn ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
          </div>

          <div className="border-t border-slate-400 pt-1">
            <span>{isEn ? '1st Witness:' : '1ª Testemunha Instrumentária:'}</span><br />
            <span>{isEn ? 'Name:' : 'Nome:'} ____________________________________</span><br />
            <span>{isEn ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-2">
          <div className="border-t border-slate-400 pt-1">
            <span>{isEn ? '2nd Witness:' : '2ª Testemunha Instrumentária:'}</span><br />
            <span>{isEn ? 'Name:' : 'Nome:'} ____________________________________</span><br />
            <span>{isEn ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
}
