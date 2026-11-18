/**
 * Legal Contract & POA Template Engine
 * Handles dynamic placeholders injection for multi-tenant and multi-lawyer practices.
 */

export interface TemplatePlaceholder {
  tag: string;
  label: string;
  description: string;
  example: string;
}

export const TEMPLATE_PLACEHOLDERS: TemplatePlaceholder[] = [
  { tag: '{{NOME_CLIENTE}}', label: 'Nome do Cliente', description: 'Nome completo do segurado contratante', example: 'Maria Francisca da Silva' },
  { tag: '{{CPF}}', label: 'CPF', description: 'CPF formatado do segurado', example: '123.456.789-09' },
  { tag: '{{RG}}', label: 'RG', description: 'Número do RG e órgão expedidor', example: '2.456.789 SSP/PB' },
  { tag: '{{ESTADO_CIVIL}}', label: 'Estado Civil', description: 'Estado civil em português', example: 'Casada' },
  { tag: '{{PROFISSAO}}', label: 'Profissão', description: 'Profissão ou ocupação rural/urbana', example: 'Agricultora Familiar' },
  { tag: '{{ENDERECO}}', label: 'Endereço Completo', description: 'Rua, número, bairro, cidade e CEP', example: 'Sítio Boa Vista, Zona Rural, Guarabira - PB' },
  { tag: '{{TELEFONE}}', label: 'Telefone', description: 'WhatsApp ou telefone para contato', example: '(83) 98765-4321' },
  { tag: '{{BENEFICIO}}', label: 'Espécie de Benefício', description: 'Benefício previdenciário objeto da ação', example: 'Aposentadoria por Idade Rural' },
  { tag: '{{HONORARIOS}}', label: 'Condição de Honorários', description: 'Descrição da Quota Litis ou parcelamento', example: '30% (trinta por cento) sobre os atrasados apurados' },
  { tag: '{{NOME_ADVOGADO}}', label: 'Nome do Advogado', description: 'Advogado titular responsável pelo contrato', example: 'Dr. Alexandre Pontes' },
  { tag: '{{OAB_ADVOGADO}}', label: 'OAB do Advogado', description: 'Número de inscrição na OAB com seccional', example: 'OAB/PB 18.234' },
  { tag: '{{PASTA_FISICA}}', label: 'Pasta no Arquivo', description: 'Etiqueta do armário e gaveta física', example: 'Armário B - Gaveta 03 - Pasta 2026-042' },
  { tag: '{{DATA_EXTENSO}}', label: 'Data por Extenso', description: 'Data atual por extenso da assinatura', example: '17 de Novembro de 2026' },
];

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
  cabinetFolder?: string;
  fullDate?: string;
}

export function mergeTemplatePlaceholders(
  templateBody: string,
  variables: MergeVariables
): string {
  if (!templateBody) return '';

  const dateExtenso =
    variables.fullDate ||
    new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

  const replacements: Record<string, string> = {
    '{{NOME_CLIENTE}}': variables.clientName || '__________________________________',
    '{{CPF}}': variables.clientCpf || '___.___.___-__',
    '{{RG}}': variables.clientRg || 'Não informado',
    '{{ESTADO_CIVIL}}': variables.clientMaritalStatus || 'Solteiro(a)',
    '{{PROFISSAO}}': variables.clientProfession || 'Lavrador(a) / Agricultor(a)',
    '{{ENDERECO}}': variables.clientAddress || 'Domiciliado(a) neste município',
    '{{TELEFONE}}': variables.clientPhone || 'Não informado',
    '{{BENEFICIO}}': variables.benefitSpecies || 'Benefício Previdenciário',
    '{{HONORARIOS}}': variables.feeDescription || '30% (trinta por cento) sobre o proveito econômico',
    '{{NOME_ADVOGADO}}': variables.lawyerName || 'Dr. Alexandre Pontes',
    '{{OAB_ADVOGADO}}': variables.lawyerOab || 'OAB/PB 18.234',
    '{{PASTA_FISICA}}': variables.cabinetFolder || 'Arquivo Geral do Escritório',
    '{{DATA_EXTENSO}}': dateExtenso,
  };

  let merged = templateBody;
  for (const [tag, val] of Object.entries(replacements)) {
    const escapedTag = tag.replace(/[{}]/g, '\\$&');
    merged = merged.replace(new RegExp(escapedTag, 'g'), val);
  }

  return merged;
}
