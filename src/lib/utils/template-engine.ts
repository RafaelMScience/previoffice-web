/**
 * Legal Contract & POA Template Engine
 * Handles dynamic placeholders injection for multi-tenant and multi-lawyer practices.
 */

import { formatBenefitType } from './benefit-translations.ts';
import type { FeeInstallment, FeeModel } from '@/types/contract';

export interface TemplatePlaceholder {
  tag: string;
  label: string;
  description: string;
  example: string;
}

export const TEMPLATE_PLACEHOLDERS: TemplatePlaceholder[] = [
  { tag: '{{NOME_CLIENTE}}', label: 'Nome do Cliente', description: 'Nome completo do segurado contratante', example: 'Maria Francisca da Silva' },
  { tag: '{{CPF}}', label: 'CPF', description: 'CPF formatado do segurado', example: '123.456.789-09' },
  { tag: '{{RG}}', label: 'RG', description: 'Número do RG e órgão expedidor', example: '2.456.789 SSP/AM' },
  { tag: '{{ESTADO_CIVIL}}', label: 'Estado Civil', description: 'Estado civil em português', example: 'Casada' },
  { tag: '{{PROFISSAO}}', label: 'Profissão', description: 'Profissão ou ocupação rural/urbana', example: 'Agricultora Familiar' },
  { tag: '{{ENDERECO}}', label: 'Endereço Completo', description: 'Rua, número, bairro, cidade e CEP', example: 'Sítio Boa Vista, Zona Rural, Manaus - AM' },
  { tag: '{{TELEFONE}}', label: 'Telefone', description: 'WhatsApp ou telefone para contato', example: '(92) 98765-4321' },
  { tag: '{{BENEFICIO}}', label: 'Espécie de Benefício', description: 'Benefício previdenciário objeto da ação', example: 'Aposentadoria por Idade Rural' },
  { tag: '{{HONORARIOS}}', label: 'Condição de Honorários', description: 'Descrição da Quota Litis ou parcelamento', example: '30% (trinta por cento) sobre os atrasados apurados' },
  { tag: '{{NOME_ADVOGADO}}', label: 'Nome do Advogado', description: 'Advogado titular responsável pelo contrato', example: 'Dr. Alexandre Pontes' },
  { tag: '{{OAB_ADVOGADO}}', label: 'OAB do Advogado', description: 'Número de inscrição na OAB com seccional', example: 'OAB/AM 55.858' },
  { tag: '{{PASTA_FISICA}}', label: 'Pasta no Arquivo', description: 'Etiqueta do armário e gaveta física', example: 'Armário B - Gaveta 03 - Pasta 2026-042' },
  { tag: '{{NOME_ESCRITORIO}}', label: 'Nome da Sociedade / Escritório', description: 'Razão social registrada do escritório de advocacia', example: 'Alexandre Pontes Sociedade de Advogados' },
  { tag: '{{OAB_ESCRITORIO}}', label: 'OAB da Sociedade', description: 'Inscrição da sociedade de advogados na OAB', example: 'OAB/AM' },
  { tag: '{{DATA_EXTENSO}}', label: 'Data por Extenso', description: 'Data atual por extenso da assinatura', example: '17 de Novembro de 2026' },
];

export interface LawyerFeeClauseOptions {
  feeModel: FeeModel;
  quotaLitisPercentage?: number;
  estimatedRetroactiveAmount?: number;
  fixedTotalAmount?: number;
  installmentCount?: number;
  firstDueDate?: string;
  installments?: FeeInstallment[];
}

export function formatMoneyBRL(val?: number): string {
  if (val === undefined || isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(val)
    .replace(/\s+/g, ' ');
}

export function formatDatePtBR(isoDate?: string): string {
  if (!isoDate) return 'Não informada';
  const parts = isoDate.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

/**
 * Generates the full schedule of installments with dates and amounts
 */
export function generateFeeInstallments(
  fixedAmount: number,
  installmentsCount: number,
  firstDueDate: string,
  contractNumber?: string
): FeeInstallment[] {
  const count = Math.max(1, installmentsCount || 1);
  const total = fixedAmount || 0;
  const perInstallment = Math.round((total / count) * 100) / 100;
  
  // Parse YYYY-MM-DD components directly to avoid timezone drift
  const rawDateStr = firstDueDate ? firstDueDate.split('T')[0] : new Date().toISOString().split('T')[0];
  const dateParts = rawDateStr.split('-').map(Number);
  const baseYear = dateParts[0] || new Date().getFullYear();
  const baseMonth = dateParts[1] || (new Date().getMonth() + 1);
  const baseDay = dateParts[2] || new Date().getDate();

  const installments: FeeInstallment[] = [];

  for (let i = 1; i <= count; i++) {
    // 0-indexed month offset:
    const targetMonthIndex = (baseMonth - 1) + (i - 1);
    const targetYear = baseYear + Math.floor(targetMonthIndex / 12);
    const targetMonth = (targetMonthIndex % 12) + 1; // 1 to 12

    // Clamp day to max days in target month (e.g., 31 Jan -> 28 Feb)
    const maxDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const clampedDay = Math.min(baseDay, maxDaysInMonth);

    const formattedMonth = String(targetMonth).padStart(2, '0');
    const formattedDay = String(clampedDay).padStart(2, '0');
    const dueDate = `${targetYear}-${formattedMonth}-${formattedDay}`;

    installments.push({
      id: `inst-${Date.now()}-${i}`,
      contractId: contractNumber || 'CTR-DRAFT',
      installmentNumber: i,
      amount: i === count ? Math.round((total - perInstallment * (count - 1)) * 100) / 100 : perInstallment,
      dueDate,
      status: 'PENDING',
    });
  }
  return installments;
}

/**
 * Generates an authentic, robust lawyer-standard fee clause
 * following OAB regulations (Lei Federal nº 8.906/1994 e Código de Ética).
 */
export function generateLawyerFeeClause(options: LawyerFeeClauseOptions): string {
  const model = options.feeModel || 'QUOTA_LITIS';
  const percentage = options.quotaLitisPercentage ?? 30;
  const retroactive = options.estimatedRetroactiveAmount ?? 36000;
  const projectedFee = (retroactive * percentage) / 100;
  const fixedTotal = options.fixedTotalAmount ?? 2400;
  const count = Math.max(1, options.installmentCount ?? 6);
  const firstDate = options.firstDueDate || new Date().toISOString().split('T')[0];

  const installmentsList =
    options.installments && options.installments.length > 0
      ? options.installments
      : generateFeeInstallments(fixedTotal, count, firstDate);

  if (model === 'QUOTA_LITIS') {
    return `${percentage}% (${percentage} por cento) sobre a totalidade do proveito econômico obtido pelo(a) CONTRATANTE na presente demanda, correspondente à integralidade dos valores retroativos apurados desde a Data de Entrada do Requerimento Administrativo (DER) até a efetiva implantação do benefício previdenciário concedido pelo INSS ou em sede judicial.\n` +
      `Estimativa Provisória de Honorários: O valor do benefício e atrasados é estimado provisoriamente em ${formatMoneyBRL(retroactive)}, perfazendo honorários de êxito previstos no montante de ${formatMoneyBRL(projectedFee)}.\n` +
      `§ 1º — A base de cálculo dos honorários advocatícios abrangerá a totalidade dos valores retroativos e parcelas vencidas apuradas da DER à concessão, devidamente corrigidas monetariamente e acrescidas dos juros de mora legais na liquidação.\n` +
      `§ 2º — Na hipótese de o pleito restar definitivamente indeferido na via administrativa e judicial por ausência de direito reconhecido, nada será cobrado do(a) CONTRATANTE a título de honorários advocatícios de êxito.`;
  }

  if (model === 'FIXED_INSTALLMENT') {
    const lines = installmentsList
      .map(
        (inst) =>
          `  • Parcela ${inst.installmentNumber}/${installmentsList.length}: ${formatMoneyBRL(inst.amount)} — Vencimento em ${formatDatePtBR(inst.dueDate)}`
      )
      .join('\n');

    return `o valor fixo, total e certo de ${formatMoneyBRL(fixedTotal)}, a ser adimplido em ${count} prestação(ões) mensal(is) e consecutiva(s) de ${formatMoneyBRL(fixedTotal / count)}, pagáveis mediante boleto bancário, chave PIX ou recibo profissional emitido pela CONTRATADA, obedecendo ao seguinte cronograma de vencimentos:\n` +
      `${lines}\n` +
      `§ 1º — As parcelas vencerão nas datas supramencionadas, facultado ao(à) CONTRATANTE a quitação antecipada de qualquer valor.\n` +
      `§ 2º — O inadimplemento injustificado de qualquer parcela por mais de 10 (dez) dias ensejará o vencimento antecipado das parcelas vincendas, incidindo sobre o saldo devedor multa moratória de 2% (dois por cento) e juros legais de 1% (um por cento) ao mês.`;
  }

  // HYBRID model
  const lines = installmentsList
    .map(
      (inst) =>
        `  • Parcela ${inst.installmentNumber}/${installmentsList.length}: ${formatMoneyBRL(inst.amount)} — Vencimento em ${formatDatePtBR(inst.dueDate)}`
    )
    .join('\n');

  return `remuneração advocatícia mista e cumulativa (regime híbrido), compreendendo duas verbas:\n` +
    `I — PARCELA FIXA (PRO LABORE): O montante certo de ${formatMoneyBRL(fixedTotal)}, dividido em ${count} prestação(ões) mensal(is) de ${formatMoneyBRL(fixedTotal / count)}, com início do cronograma em ${formatDatePtBR(firstDate)}, conforme discriminado:\n` +
    `${lines}\n` +
    `II — PARCELA DE ÊXITO (QUOTA LITIS AD EXITUM): O percentual de ${percentage}% (${percentage} por cento) incidente sobre a totalidade do proveito econômico obtido (valores retroativos da DER à implantação do benefício previdenciário), com estimativa de atrasados de ${formatMoneyBRL(retroactive)} e êxito previsto de ${formatMoneyBRL(projectedFee)}.\n` +
    `§ 1º — A parcela fixa remunera os atos de estudo preparatório, protocolo e postulação administrativa inicial, sendo devida independentemente do resultado final da lide; a parcela de êxito vincula-se estritamente à concessão e liquidação do direito previdenciário.\n` +
    `§ 2º — O atraso no pagamento das parcelas da remuneração fixa acarretará multa de 2% (dois por cento) e juros moratórios de 1% (um por cento) ao mês.`;
}

export interface MergeVariables {
  clientName: string;
  clientCpf: string;
  clientRg?: string;
  clientMaritalStatus?: string;
  clientProfession?: string;
  clientAddress?: string;
  clientPhone?: string;
  benefitSpecies: string;
  feeDescription: string;
  lawyerName: string;
  lawyerOab: string;
  officeName?: string;
  officeOab?: string;
  cabinetFolder?: string;
  fullDate?: string;
}

export function mergeTemplatePlaceholders(
  templateBody: string,
  variables: Partial<MergeVariables>
): string {
  if (!templateBody) return '';

  const dateExtenso =
    variables.fullDate ||
    new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

  const effectiveOfficeName = variables.officeName || 'Alexandre Pontes Sociedade de Advogados';
  const effectiveOfficeOab = variables.officeOab || 'OAB/AM';

  const replacements: Record<string, string> = {
    '{{NOME_CLIENTE}}': variables.clientName || '__________________________________',
    '{{CPF}}': variables.clientCpf || '___.___.___-__',
    '{{RG}}': variables.clientRg || 'Não informado',
    '{{ESTADO_CIVIL}}': variables.clientMaritalStatus || 'Solteiro(a)',
    '{{PROFISSAO}}': variables.clientProfession || 'Agricultor(a) Familiar',
    '{{ENDERECO}}': variables.clientAddress || 'Domiciliado(a) neste município',
    '{{TELEFONE}}': variables.clientPhone || 'Não informado',
    '{{BENEFICIO}}': formatBenefitType(variables.benefitSpecies, 'pt-BR') || 'Benefício Previdenciário',
    '{{HONORARIOS}}': variables.feeDescription || '30% (trinta por cento) sobre o proveito econômico',
    '{{NOME_ADVOGADO}}': variables.lawyerName || 'Dr. Alexandre Pontes',
    '{{OAB_ADVOGADO}}': variables.lawyerOab || 'OAB/AM 55.858',
    '{{NOME_ESCRITORIO}}': effectiveOfficeName,
    '{{OAB_ESCRITORIO}}': effectiveOfficeOab,
    '{{PASTA_FISICA}}': variables.cabinetFolder || 'Arquivo Geral do Escritório',
    '{{DATA_EXTENSO}}': dateExtenso,
  };

  let merged = templateBody;
  for (const [tag, val] of Object.entries(replacements)) {
    const escapedTag = tag.replace(/[{}]/g, '\\$&');
    merged = merged.replace(new RegExp(escapedTag, 'g'), val);
  }

  // Also replace literal legacy hardcoded "ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS" if officeName is customized
  if (variables.officeName && variables.officeName.trim()) {
    merged = merged.replace(/ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS/g, variables.officeName.toUpperCase());
    merged = merged.replace(/Alexandre Pontes Sociedade de Advogados/g, variables.officeName);
  }

  // Translate any untranslated English benefit references in existing stored templates
  merged = merged.replace(/Temporary Disability/gi, 'Benefício por Incapacidade Temporária (Auxílio-Doença)');
  merged = merged.replace(/Permanent Disability/gi, 'Aposentadoria por Incapacidade Permanente');
  merged = merged.replace(/Rural Special Retirement/gi, 'Aposentadoria Rural - Segurado Especial');
  merged = merged.replace(/Rural Retirement/gi, 'Aposentadoria Rural - Segurado Especial');
  merged = merged.replace(/Death Pension/gi, 'Pensão por Morte');
  merged = merged.replace(/Maternity Benefit/gi, 'Salário-Maternidade');

  return merged;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto Bancário',
  BANK_SLIP: 'Boleto Bancário',
  CASH: 'Dinheiro em Espécie',
  CREDIT_CARD: 'Cartão de Crédito',
  BANK_TRANSFER: 'Transferência Bancária',
  RPV_PRECATORIO_RETENTION: 'Retenção de RPV / Precatório',
};

export function formatPaymentMethod(method?: string): string {
  if (!method) return 'PIX';
  return PAYMENT_METHOD_LABELS[method] || method;
}
