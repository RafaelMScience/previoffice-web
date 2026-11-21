/**
 * Domain module for Benefit Document Presets.
 * Predefines required documents per social security benefit type for Fast Intake
 * and provides shortcuts for attendants and lawyers to customize checklists on the fly.
 */

import { getCanonicalBenefitKey } from '../utils/benefit-translations.ts';

export interface DocumentChecklistItem {
  id: string;
  description: string;
  isSelected: boolean;
  isDelivered: boolean;
  isCustom?: boolean;
}

export const BENEFIT_DOCUMENT_PRESETS: Record<string, string[]> = {
  'Rural Special Retirement': [
    'Documento com Foto (RG / CNH)',
    'Comprovante de Residência Rural',
    'Autodeclaração Rural (Segurado Especial)',
    'Contratos da Terra / ITR / CCIR / Notas de Produtor',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'BPC/LOAS Elderly': [
    'Documento com Foto (RG / CNH) do Requerente',
    'RG e CPF de Todos os Membros do Grupo Familiar',
    'Comprovante de Residência Atualizado',
    'Cadastro Único (CadÚnico / Folha Resumo atualizada)',
    'Comprovantes de Renda de Todos da Residência',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'BPC/LOAS Disability': [
    'Documento com Foto (RG / CNH) do Requerente',
    'RG e CPF de Todos os Membros do Grupo Familiar',
    'Comprovante de Residência Atualizado',
    'Cadastro Único (CadÚnico / Folha Resumo atualizada)',
    'Laudos Médicos Atualizados com CID e Gravidade',
    'Receituários Médicos Contínuos / Exames Complementares',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'Age Retirement Urban': [
    'Documento com Foto (RG / CNH)',
    'Comprovante de Residência Atualizado',
    'Carteira de Trabalho (CTPS - todas as vias físicas)',
    'Extrato CNIS Completo',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'Temporary Disability': [
    'Documento com Foto (RG / CNH)',
    'Comprovante de Residência Atualizado',
    'Atestado / Laudo Médico com CID e Tempo Estimado de Repouso',
    'Exames, Prontuários e Receitas Médicas Recentes',
    'Declaração do Último Dia Trabalhado (DUT - se empregado)',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'Death Pension': [
    'Documento com Foto (RG / CNH) do Dependente',
    'Certidão de Óbito do Segurado Falecido',
    'Certidão de Casamento / União Estável ou Nascimento dos Filhos',
    'Documentos Pessoais e CTPS / CNIS do Falecido',
    'Provas de Dependência Econômica',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'Maternity Benefit': [
    'Documento com Foto (RG / CNH) da Requerente',
    'Comprovante de Residência Atualizado',
    'Certidão de Nascimento da Criança ou Atestado Médico',
    'Autodeclaração Rural ou CTPS / Carnês de Recolhimento',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
  'General Query': [
    'Documento com Foto (RG / CNH)',
    'Comprovante de Residência',
    'Extrato CNIS / Carteira de Trabalho (CTPS)',
    'Procuração Ad Judicia & Contrato de Honorários',
  ],
};

export const COMMON_DOCUMENT_SHORTCUTS = [
  'Extrato CNIS Completo',
  'Carteira de Trabalho (CTPS)',
  'Certidão de Casamento / Nascimento',
  'Contrato de Arrendamento / Parceria Rural',
  'Laudo Médico com CID',
  'Folha Resumo CadÚnico',
  'Procuração Ad Judicia & Honorários',
];

/**
 * Returns default checklist items for a chosen benefit type (accepts English or Portuguese).
 */
export function getDefaultDocumentsForBenefit(benefit: string): DocumentChecklistItem[] {
  const canonical = getCanonicalBenefitKey(benefit);
  const descriptions =
    BENEFIT_DOCUMENT_PRESETS[benefit] ||
    BENEFIT_DOCUMENT_PRESETS[canonical] ||
    BENEFIT_DOCUMENT_PRESETS['General Query'] ||
    [];

  return descriptions.map((desc, idx) => ({
    id: `preset-${idx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    description: desc,
    isSelected: true,
    isDelivered: false,
  }));
}
