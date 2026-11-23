import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatBenefitType,
  formatBilingualBenefitType,
  findBenefitCatalogItem,
  getCanonicalBenefitKey,
  formatSpecialCategory,
  formatSpecialCategories,
  BENEFIT_TYPES_CATALOG,
} from './benefit-translations.ts';

describe('Benefit Types Catalog & Translation Utility', () => {
  it('should have the core benefit catalog properly defined', () => {
    assert.ok(BENEFIT_TYPES_CATALOG.length >= 8);
    const tempDisability = BENEFIT_TYPES_CATALOG.find((b) => b.key === 'Temporary Disability');
    assert.ok(tempDisability);
    assert.strictEqual(tempDisability.labelPt, 'Benefício por Incapacidade Temporária (Auxílio-Doença)');
  });

  it('should translate "Temporary Disability" into Portuguese', () => {
    const pt = formatBenefitType('Temporary Disability', 'pt-BR');
    assert.strictEqual(pt, 'Benefício por Incapacidade Temporária (Auxílio-Doença)');

    const ptShort = formatBenefitType('Temporary Disability', 'pt-BR', 'short');
    assert.strictEqual(ptShort, 'Incapacidade Temporária (Auxílio-Doença)');
  });

  it('should format "Temporary Disability" in English when requested', () => {
    const en = formatBenefitType('Temporary Disability', 'en-US');
    assert.strictEqual(en, 'Temporary Disability Benefit (Sickness Benefit)');

    const enShort = formatBenefitType('Temporary Disability', 'en-US', 'short');
    assert.strictEqual(enShort, 'Temporary Disability');
  });

  it('should recognize Portuguese input and return English translation', () => {
    const en = formatBenefitType('Benefício por Incapacidade Temporária (Auxílio-Doença)', 'en-US');
    assert.strictEqual(en, 'Temporary Disability Benefit (Sickness Benefit)');
  });

  it('should produce bilingual format with both Portuguese and English versions', () => {
    const bilingual = formatBilingualBenefitType('Temporary Disability');
    assert.ok(bilingual.includes('Benefício por Incapacidade Temporária'));
    assert.ok(bilingual.includes('Temporary Disability Benefit'));
  });

  it('should handle Rural Retirement variants', () => {
    assert.strictEqual(
      formatBenefitType('Rural Special Retirement', 'pt-BR'),
      'Aposentadoria Rural - Segurado Especial'
    );
    assert.strictEqual(
      formatBenefitType('Rural Retirement', 'pt-BR'),
      'Aposentadoria Rural - Segurado Especial'
    );
    assert.strictEqual(
      getCanonicalBenefitKey('Aposentadoria Rural - Segurado Especial'),
      'Rural Special Retirement'
    );
  });

  it('should handle LOAS / BPC variants', () => {
    assert.strictEqual(
      formatBenefitType('BPC/LOAS Elderly', 'pt-BR'),
      'BPC / LOAS - Idoso (≥ 65 anos)'
    );
    assert.strictEqual(
      formatBenefitType('BPC/LOAS Disability', 'pt-BR'),
      'BPC / LOAS - Pessoa com Deficiência (PCD)'
    );
  });

  it('should handle empty or null values gracefully', () => {
    assert.strictEqual(formatBenefitType('', 'pt-BR'), 'Não informado');
    assert.strictEqual(formatBenefitType(null, 'en-US'), 'Not specified');
  });

  it('should format special categories correctly in Portuguese and English', () => {
    assert.strictEqual(
      formatSpecialCategory('URBAN_COMMON', 'pt-BR'),
      'Geral / Trabalhador Urbano'
    );
    assert.strictEqual(
      formatSpecialCategory('URBAN_COMMON', 'en-US'),
      'General / Urban Worker'
    );
    assert.strictEqual(
      formatSpecialCategory('RURAL', 'pt-BR'),
      'Produtor Rural / Agricultura Familiar (Segurado Especial)'
    );
    assert.strictEqual(
      formatSpecialCategory('PCD', 'pt-BR'),
      'Pessoa com Deficiência (PCD)'
    );
    assert.strictEqual(
      formatSpecialCategory('SPECIAL_HAZARDOUS', 'pt-BR'),
      'Especial com Insalubridade / Periculosidade'
    );
    assert.strictEqual(
      formatSpecialCategory('', 'pt-BR'),
      'Não informado'
    );
    assert.strictEqual(
      formatSpecialCategory(undefined, 'en-US'),
      'Not informed'
    );

    assert.strictEqual(
      formatSpecialCategories(['URBAN_COMMON', 'PCD'], 'pt-BR'),
      'Geral / Trabalhador Urbano, Pessoa com Deficiência (PCD)'
    );
    assert.strictEqual(
      formatSpecialCategories(['URBAN_COMMON'], 'en-US'),
      'General / Urban Worker'
    );
    assert.strictEqual(
      formatSpecialCategories([], 'pt-BR'),
      'Não informado'
    );
  });
});
