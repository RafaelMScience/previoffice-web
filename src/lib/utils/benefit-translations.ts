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

/**
 * Standard Benefit Catalog Options for Template & Contract selection
 */
export const BENEFIT_CATALOG_OPTIONS = [
  'Aposentadoria por Idade Urbana',
  'Aposentadoria por Idade Rural',
  'Aposentadoria por Tempo de Contribuição',
  'Aposentadoria Especial',
  'Auxílio por Incapacidade Temporária (Auxílio-Doença)',
  'Auxílio-Acidente',
  'Benefício de Prestação Continuada (BPC/LOAS Idoso)',
  'Benefício de Prestação Continuada (BPC/LOAS Deficiência)',
  'Pensão por Morte Urbana',
  'Pensão por Morte Rural',
  'Salário-Maternidade',
  'Revisão de Benefício',
  'Planejamento Previdenciário',
  'Geral / Todos os Benefícios',
  'Outro Benefício',
] as const;

/**
 * Standard Document Category Options for Minutas & Modelos
 */
export const DOCUMENT_CATEGORY_OPTIONS = [
  { value: 'FEE_CONTRACT', label: 'Contrato de Honorários' },
  { value: 'POWER_OF_ATTORNEY', label: 'Procuração Ad Judicia et Extra' },
  { value: 'DECLARATION_HIPO', label: 'Declaração de Hipossuficiência' },
  { value: 'WAIVER_TERM', label: 'Termo de Renúncia' },
  { value: 'INSS_REQUEST', label: 'Requerimento Administrativo INSS' },
  { value: 'OTHER', label: 'Outro Tipo de Documento' },
] as const;

/**
 * Formats a document category enum to friendly Portuguese label
 */
export function formatDocumentCategory(
  category?: string,
  customName?: string
): string {
  if (category === 'OTHER' && customName?.trim()) {
    return customName.trim();
  }
  switch (category) {
    case 'FEE_CONTRACT':
      return 'Contrato de Honorários';
    case 'POWER_OF_ATTORNEY':
      return 'Procuração Ad Judicia';
    case 'DECLARATION_HIPO':
      return 'Declaração de Hipossuficiência';
    case 'WAIVER_TERM':
      return 'Termo de Renúncia';
    case 'INSS_REQUEST':
      return 'Requerimento INSS';
    case 'OTHER':
      return customName?.trim() || 'Outro Documento';
    default:
      return 'Contrato de Honorários';
  }
}

/**
 * Formats a special category enum or string into friendly localized label.
 * Maps 'URBAN_COMMON' -> 'Geral / Trabalhador Urbano' (or 'General / Urban Worker' in EN),
 * 'RURAL' -> 'Produtor Rural / Agricultura Familiar (Segurado Especial)',
 * 'PCD' -> 'Pessoa com Deficiência (PCD)',
 * 'SPECIAL_HAZARDOUS' -> 'Especial com Insalubridade / Periculosidade'.
 */
export function formatSpecialCategory(
  category?: string,
  locale: 'pt-BR' | 'en-US' = 'pt-BR'
): string {
  if (!category || !category.trim()) {
    return locale === 'en-US' ? 'Not informed' : 'Não informado';
  }

  const normalized = category.trim().toUpperCase().replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'URBAN_COMMON':
    case 'URBAN':
    case 'GERAL':
    case 'URBANO':
    case 'TRABALHADOR_URBANO':
      return locale === 'en-US' ? 'General / Urban Worker' : 'Geral / Trabalhador Urbano';

    case 'RURAL':
    case 'SEGURADO_ESPECIAL':
    case 'AGRICULTOR':
    case 'AGRICULTURA_FAMILIAR':
    case 'PRODUTOR_RURAL':
      return locale === 'en-US'
        ? 'Rural Producer / Family Agriculture (Special Insured)'
        : 'Produtor Rural / Agricultura Familiar (Segurado Especial)';

    case 'PCD':
    case 'DEFICIENCIA':
    case 'DEFICIENTE':
    case 'PESSOA_COM_DEFICIENCIA':
      return locale === 'en-US'
        ? 'Person with Disability (PwD)'
        : 'Pessoa com Deficiência (PCD)';

    case 'SPECIAL_HAZARDOUS':
    case 'HAZARDOUS':
    case 'INSALUBRE':
    case 'INSALUBRIDADE':
    case 'PERICULOSIDADE':
    case 'ATIVIDADE_ESPECIAL':
      return locale === 'en-US'
        ? 'Special with Hazardous / Unhealthy Activity'
        : 'Especial com Insalubridade / Periculosidade';

    default:
      return category;
  }
}

/**
 * Formats an array of special categories into a comma-separated localized string.
 */
export function formatSpecialCategories(
  categories?: (string | undefined)[] | null,
  locale: 'pt-BR' | 'en-US' = 'pt-BR'
): string {
  if (!categories || categories.length === 0) {
    return locale === 'en-US' ? 'Not informed' : 'Não informado';
  }
  const formatted = categories
    .map((cat) => (cat ? formatSpecialCategory(cat, locale) : null))
    .filter((val): val is string => Boolean(val && val !== 'Não informado' && val !== 'Not informed'));

  if (formatted.length === 0) {
    return locale === 'en-US' ? 'Not informed' : 'Não informado';
  }

  return formatted.join(', ');
}

