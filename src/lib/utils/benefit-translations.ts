/**
 * Benefit Types Catalog & Translation Utility.
 * Normalizes, translates, and formats Brazilian Social Security (INSS) benefit names
 * between Brazilian Portuguese (pt-BR) and English (en-US), ensuring that terms like
 * "Temporary Disability" are always displayed as "Benefício por Incapacidade Temporária (Auxílio-Doença)"
 * on formal legal PDFs, contracts, and interfaces.
 */

export interface BenefitCatalogItem {
  key: string;
  aliases: string[];
  labelPt: string;
  labelEn: string;
  shortPt: string;
  shortEn: string;
  legalReference?: string;
}

export const BENEFIT_TYPES_CATALOG: BenefitCatalogItem[] = [
  {
    key: 'Temporary Disability',
    aliases: [
      'temporary disability',
      'temporary disability benefit',
      'incapacidade temporaria',
      'benefício por incapacidade temporária',
      'beneficio por incapacidade temporaria',
      'beneficio por incapacidade temporaria (auxilio-doenca)',
      'benefício por incapacidade temporária (auxílio-doença)',
      'benefício por incapacidade (auxílio-doença)',
      'beneficio por incapacidade (auxilio-doenca)',
      'auxilio-doenca',
      'auxílio-doença',
      'auxilio doenca',
    ],
    labelPt: 'Benefício por Incapacidade Temporária (Auxílio-Doença)',
    labelEn: 'Temporary Disability Benefit (Sickness Benefit)',
    shortPt: 'Incapacidade Temporária (Auxílio-Doença)',
    shortEn: 'Temporary Disability',
    legalReference: 'Art. 59 da Lei Federal nº 8.213/1991',
  },
  {
    key: 'Permanent Disability',
    aliases: [
      'permanent disability',
      'permanent disability benefit',
      'incapacidade permanente',
      'aposentadoria por incapacidade permanente',
      'aposentadoria por invalidez',
      'invalidez',
    ],
    labelPt: 'Aposentadoria por Incapacidade Permanente (Invalidez)',
    labelEn: 'Permanent Disability Pension (Invalidity Pension)',
    shortPt: 'Incapacidade Permanente (Invalidez)',
    shortEn: 'Permanent Disability',
    legalReference: 'Art. 42 da Lei Federal nº 8.213/1991',
  },
  {
    key: 'Rural Special Retirement',
    aliases: [
      'rural special retirement',
      'rural retirement',
      'aposentadoria rural',
      'aposentadoria rural - segurado especial',
      'aposentadoria por idade rural',
      'segurado especial',
    ],
    labelPt: 'Aposentadoria Rural - Segurado Especial',
    labelEn: 'Rural Retirement - Special Insured',
    shortPt: 'Aposentadoria Rural',
    shortEn: 'Rural Retirement',
    legalReference: 'Art. 48, § 1º e § 2º da Lei Federal nº 8.213/1991',
  },
  {
    key: 'Age Retirement Urban',
    aliases: [
      'age retirement urban',
      'urban retirement',
      'aposentadoria urbana por idade',
      'aposentadoria urbana',
      'aposentadoria por idade urbana',
    ],
    labelPt: 'Aposentadoria Urbana por Idade',
    labelEn: 'Urban Age Retirement',
    shortPt: 'Aposentadoria Urbana',
    shortEn: 'Urban Retirement',
    legalReference: 'Art. 48 da Lei Federal nº 8.213/1991 / EC 103/2019',
  },
  {
    key: 'BPC/LOAS Elderly',
    aliases: [
      'bpc/loas elderly',
      'bpc loas elderly',
      'bpc idoso',
      'bpc / loas - idoso (≥ 65 anos)',
      'bpc / loas idoso',
      'loas idoso',
      'amparo assistencial ao idoso',
    ],
    labelPt: 'BPC / LOAS - Idoso (≥ 65 anos)',
    labelEn: 'BPC / LOAS - Elderly (≥ 65 yo)',
    shortPt: 'BPC / LOAS Idoso',
    shortEn: 'BPC / LOAS Elderly',
    legalReference: 'Art. 20 da Lei Federal nº 8.742/1993 (LOAS)',
  },
  {
    key: 'BPC/LOAS Disability',
    aliases: [
      'bpc/loas disability',
      'bpc loas disability',
      'bpc pcd',
      'bpc deficiencia',
      'bpc / loas - pessoa com deficiência (pcd)',
      'bpc / loas pcd',
      'loas deficiente',
      'amparo assistencial a pessoa com deficiencia',
    ],
    labelPt: 'BPC / LOAS - Pessoa com Deficiência (PCD)',
    labelEn: 'BPC / LOAS - Person with Disability (PwD)',
    shortPt: 'BPC / LOAS PCD',
    shortEn: 'BPC / LOAS Disability',
    legalReference: 'Art. 20, § 2º da Lei Federal nº 8.742/1993 (LOAS)',
  },
  {
    key: 'Death Pension',
    aliases: [
      'death pension',
      'pensao por morte',
      'pensão por morte',
      'pensao por morte rural',
      'pensao por morte urbana',
    ],
    labelPt: 'Pensão por Morte (Previdenciária)',
    labelEn: 'Death / Survivor Pension',
    shortPt: 'Pensão por Morte',
    shortEn: 'Death Pension',
    legalReference: 'Art. 74 da Lei Federal nº 8.213/1991',
  },
  {
    key: 'Maternity Benefit',
    aliases: [
      'maternity benefit',
      'salario-maternidade',
      'salário-maternidade',
      'salario maternidade',
      'salario-maternidade rural/urbano',
    ],
    labelPt: 'Salário-Maternidade (Rural / Urbano)',
    labelEn: 'Maternity Benefit (Rural / Urban)',
    shortPt: 'Salário-Maternidade',
    shortEn: 'Maternity Benefit',
    legalReference: 'Art. 71 da Lei Federal nº 8.213/1991',
  },
  {
    key: 'General Query',
    aliases: [
      'general query',
      'consulta geral',
      'consulta geral / outros',
      'orientacao previdenciaria',
      'orientação previdenciária',
    ],
    labelPt: 'Consulta Geral / Orientação Previdenciária',
    labelEn: 'General Query / Social Security Guidance',
    shortPt: 'Consulta Geral',
    shortEn: 'General Query',
    legalReference: 'Atendimento Inicial e Diagnóstico de Direitos',
  },
];

/**
 * Normalizes input string for robust case & accent insensitive comparison.
 */
function cleanBenefitString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Finds the corresponding catalog item for any given benefit string (in English or Portuguese).
 */
export function findBenefitCatalogItem(rawBenefit?: string | null): BenefitCatalogItem | undefined {
  if (!rawBenefit || !rawBenefit.trim()) return undefined;

  const cleanInput = cleanBenefitString(rawBenefit);

  return BENEFIT_TYPES_CATALOG.find((item) => {
    if (cleanBenefitString(item.key) === cleanInput) return true;
    if (cleanBenefitString(item.labelPt) === cleanInput) return true;
    if (cleanBenefitString(item.labelEn) === cleanInput) return true;
    if (cleanBenefitString(item.shortPt) === cleanInput) return true;
    if (cleanBenefitString(item.shortEn) === cleanInput) return true;
    return item.aliases.some((alias) => cleanBenefitString(alias) === cleanInput);
  });
}

/**
 * Formats a benefit type into the requested locale and format style.
 * Ensures that English values like "Temporary Disability" are properly translated to
 * "Benefício por Incapacidade Temporária (Auxílio-Doença)" in Portuguese.
 */
export function formatBenefitType(
  rawBenefit?: string | null,
  locale: 'pt-BR' | 'en-US' = 'pt-BR',
  format: 'full' | 'short' = 'full'
): string {
  if (!rawBenefit || !rawBenefit.trim()) {
    return locale === 'en-US' ? 'Not specified' : 'Não informado';
  }

  const item = findBenefitCatalogItem(rawBenefit);
  if (item) {
    if (locale === 'en-US') {
      return format === 'short' ? item.shortEn : item.labelEn;
    }
    return format === 'short' ? item.shortPt : item.labelPt;
  }

  // If not matched directly in catalog, check for common partial substrings
  const clean = cleanBenefitString(rawBenefit);
  if (
    clean.includes('temporary disability') ||
    clean.includes('auxilio-doenca') ||
    clean.includes('auxilio doenca') ||
    clean.includes('incapacidade temporaria')
  ) {
    return locale === 'en-US' ? 'Temporary Disability Benefit (Sickness Benefit)' : 'Benefício por Incapacidade Temporária (Auxílio-Doença)';
  }
  if (clean.includes('rural')) {
    return locale === 'en-US' ? 'Rural Retirement - Special Insured' : 'Aposentadoria Rural - Segurado Especial';
  }
  if (clean.includes('loas') || clean.includes('bpc')) {
    return locale === 'en-US' ? 'BPC / LOAS Social Benefit' : 'Benefício Assistencial BPC / LOAS';
  }

  return rawBenefit;
}

/**
 * @deprecated Avoid bilingual concatenation with slashes. Platform documents and PDFs
 * must operate with strict locale separation (strictly 'pt-BR' when Portuguese or 'en-US' when English).
 */
export function formatBilingualBenefitType(rawBenefit?: string | null): string {
  const pt = formatBenefitType(rawBenefit, 'pt-BR', 'full');
  const en = formatBenefitType(rawBenefit, 'en-US', 'full');
  if (pt.toLowerCase() === en.toLowerCase()) return pt;
  return `${pt} / ${en}`;
}

/**
 * Helper to get the canonical English key for internal preset lookups.
 */
export function getCanonicalBenefitKey(rawBenefit?: string | null): string {
  const item = findBenefitCatalogItem(rawBenefit);
  return item ? item.key : (rawBenefit || 'General Query');
}
