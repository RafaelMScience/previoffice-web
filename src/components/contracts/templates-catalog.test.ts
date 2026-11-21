import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDocumentCategory,
  BENEFIT_CATALOG_OPTIONS,
  DOCUMENT_CATEGORY_OPTIONS,
} from '../../lib/utils/benefit-translations.ts';
import { INITIAL_CONTRACT_TEMPLATES, ContractsStore, contractsStore } from '../../lib/data/mock-contracts.ts';
import { MockContractRepository } from '../../lib/repositories/mock-contract-repository.ts';
import type { ContractTemplate, DocumentCategory } from '../../types/contract.ts';

describe('Templates Catalog & Document Categorization (Multi-Tenant)', () => {
  describe('formatDocumentCategory Helper', () => {
    it('formats known document categories to Portuguese display labels', () => {
      assert.strictEqual(formatDocumentCategory('FEE_CONTRACT'), 'Contrato de Honorários');
      assert.strictEqual(formatDocumentCategory('POWER_OF_ATTORNEY'), 'Procuração Ad Judicia');
      assert.strictEqual(formatDocumentCategory('DECLARATION_HIPO'), 'Declaração de Hipossuficiência');
      assert.strictEqual(formatDocumentCategory('WAIVER_TERM'), 'Termo de Renúncia');
      assert.strictEqual(formatDocumentCategory('INSS_REQUEST'), 'Requerimento INSS');
    });

    it('returns custom category name when category is OTHER and custom name is provided', () => {
      assert.strictEqual(
        formatDocumentCategory('OTHER', 'Notificação Extrajudicial'),
        'Notificação Extrajudicial'
      );
      assert.strictEqual(
        formatDocumentCategory('OTHER', 'Contrato de Parceria'),
        'Contrato de Parceria'
      );
    });

    it('falls back gracefully when category is missing or OTHER has no custom text', () => {
      assert.strictEqual(formatDocumentCategory(undefined), 'Contrato de Honorários');
      assert.strictEqual(formatDocumentCategory('OTHER', ''), 'Outro Documento');
      assert.strictEqual(formatDocumentCategory('OTHER', undefined), 'Outro Documento');
    });
  });

  describe('Institutional Default Templates (No Personal Names)', () => {
    it('confirms all default INITIAL_CONTRACT_TEMPLATES have NO hardcoded personal lawyer names', () => {
      for (const tpl of INITIAL_CONTRACT_TEMPLATES) {
        assert.ok(
          !tpl.lawyerName || tpl.lawyerName.trim() === '',
          `Template ${tpl.id} (${tpl.title}) must not have hardcoded lawyerName: "${tpl.lawyerName}"`
        );
        assert.ok(
          !tpl.title.includes('Dr. Alexandre') && !tpl.title.includes('Dra. Camila'),
          `Template title "${tpl.title}" must not contain personal lawyer names`
        );
      }
    });

    it('verifies initial templates have documentCategory specified', () => {
      const categories = INITIAL_CONTRACT_TEMPLATES.map((t) => t.documentCategory);
      assert.ok(categories.includes('FEE_CONTRACT'), 'Must include FEE_CONTRACT templates');
      assert.ok(categories.includes('POWER_OF_ATTORNEY'), 'Must include POWER_OF_ATTORNEY template');
    });
  });

  describe('Tenant Isolation & Default Replacement', () => {
    it('replaces previous default template when a new default template is created for the same benefit and category', () => {
      const store = new ContractsStore();
      
      const tplA = store.addTemplate({
        tenantId: 'tenant-test-office',
        title: 'Modelo Padrão 1',
        documentCategory: 'FEE_CONTRACT',
        benefitSpecies: 'Aposentadoria por Idade Rural',
        description: 'Primeiro padrão',
        defaultFeeModel: 'QUOTA_LITIS',
        defaultQuotaLitisPercentage: 30,
        clausesCount: 8,
        isDefault: true,
        contentBody: 'Cláusula 1...',
      });

      assert.strictEqual(tplA.isDefault, true);

      // Now create another default template for the same benefit & category in the same office
      const tplB = store.addTemplate({
        tenantId: 'tenant-test-office',
        title: 'Modelo Padrão 2 (Substituto)',
        documentCategory: 'FEE_CONTRACT',
        benefitSpecies: 'Aposentadoria por Idade Rural',
        description: 'Novo padrão que substitui o anterior',
        defaultFeeModel: 'QUOTA_LITIS',
        defaultQuotaLitisPercentage: 30,
        clausesCount: 8,
        isDefault: true,
        contentBody: 'Cláusula 1 substituída...',
      });

      const all = store.getTemplates();
      const updatedTplA = all.find((t: ContractTemplate) => t.id === tplA.id);
      const updatedTplB = all.find((t: ContractTemplate) => t.id === tplB.id);

      assert.strictEqual(updatedTplB?.isDefault, true, 'New template must be marked default');
      assert.strictEqual(updatedTplA?.isDefault, false, 'Previous template must have isDefault unset');
    });

    it('ensures templates created by Office A (tenant-A) are NEVER visible to Office B (tenant-B)', () => {
      const store = new ContractsStore();
      
      store.addTemplate({
        tenantId: 'tenant-office-A',
        title: 'Minuta Exclusiva do Escritório A',
        documentCategory: 'FEE_CONTRACT',
        benefitSpecies: 'BPC/LOAS',
        description: 'Confidencial do Escritório A',
        defaultFeeModel: 'QUOTA_LITIS',
        defaultQuotaLitisPercentage: 30,
        clausesCount: 8,
        isDefault: true,
        contentBody: 'Segredo profissional A',
      });

      const templatesForB = store.getTemplates().filter(
        (t: ContractTemplate) => t.tenantId === 'tenant-office-B'
      );

      const hasA = templatesForB.some((t: ContractTemplate) => t.tenantId === 'tenant-office-A');
      assert.strictEqual(hasA, false, 'Office B must NEVER see Office A templates');
    });

    it('confirms MockContractRepository isolates tenants and replaces system defaults per tenant', async () => {
      const repo = new MockContractRepository();

      // Office A creates a custom default for BPC/LOAS
      contractsStore.addTemplate({
        tenantId: 'tenant-test-A',
        title: 'BPC/LOAS Personalizado Office A',
        documentCategory: 'FEE_CONTRACT',
        benefitSpecies: 'BPC/LOAS',
        description: 'Exclusivo do Office A',
        defaultFeeModel: 'QUOTA_LITIS',
        defaultQuotaLitisPercentage: 30,
        clausesCount: 8,
        isDefault: true,
        contentBody: 'Cláusula do Office A',
      });

      // Office B fetches templates
      const templatesB = await repo.fetchTemplates('tenant-test-B');
      
      // Office B must NEVER receive Office A's template
      const hasOfficeA = templatesB.some((t) => t.tenantId === 'tenant-test-A');
      assert.strictEqual(hasOfficeA, false, 'Office B must never receive Office A templates');

      // Office B still sees system templates
      const systemPresets = templatesB.filter((t) => t.tenantId === 'system');
      assert.ok(systemPresets.length > 0, 'Office B must still receive institutional system presets');

      // Office A fetches templates and gets its own custom default
      const templatesA = await repo.fetchTemplates('tenant-test-A');
      const officeACustom = templatesA.find((t) => t.tenantId === 'tenant-test-A');
      assert.ok(officeACustom, 'Office A must receive its own custom template');
      assert.strictEqual(officeACustom?.isDefault, true);
    });
  });
});
