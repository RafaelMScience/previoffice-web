import { describe, it } from 'node:test';
import assert from 'node:assert';
import { contractsStore, INITIAL_CONTRACT_TEMPLATES } from './mock-contracts.ts';
import { mergeTemplatePlaceholders } from '../utils/template-engine.ts';

describe('Contracts Store and Robust Legal Templates', () => {
  it('should load initial robust contract templates', () => {
    const templates = contractsStore.getTemplates();
    assert.ok(templates.length >= 4);

    const ruralTpl = templates.find((t) => t.id === 'tpl-001');
    assert.ok(ruralTpl, 'Rural template tpl-001 should exist');
    assert.strictEqual(ruralTpl.benefitSpecies, 'Aposentadoria por Idade Rural');

    // Verify presence of authentic, real Brazilian legislation
    assert.ok(ruralTpl.contentBody.includes('Lei Federal nº 8.906/1994'), 'Should cite Estatuto da OAB');
    assert.ok(ruralTpl.contentBody.includes('art. 22, § 4º da Lei nº 8.906/94') || ruralTpl.contentBody.includes('artigo 22, § 4º'), 'Should cite RPV destacamento');
    assert.ok(ruralTpl.contentBody.includes('Lei Federal nº 10.406/2002'), 'Should cite Código Civil');
    assert.ok(ruralTpl.contentBody.includes('Lei Federal nº 13.105/2015') || ruralTpl.contentBody.includes('Código de Processo Civil'), 'Should cite CPC');
    assert.ok(ruralTpl.contentBody.includes('Lei Federal nº 13.709/2018') || ruralTpl.contentBody.includes('LGPD'), 'Should cite LGPD');
    assert.ok(ruralTpl.contentBody.includes('Lei nº 8.213/1991'), 'Should cite Lei de Benefícios');
  });

  it('should merge placeholders seamlessly into the robust rural template', () => {
    const ruralTpl = contractsStore.getTemplates().find((t) => t.id === 'tpl-001')!;

    const merged = mergeTemplatePlaceholders(ruralTpl.contentBody, {
      clientName: 'Sebastião Alves da Silva',
      clientCpf: '123.456.789-00',
      clientRg: '1.234.567 SSP/AM',
      clientMaritalStatus: 'Casado(a)',
      clientProfession: 'Agricultor Familiar / Lavrador',
      clientAddress: 'Sítio Riacho do Meio, Zona Rural, Manaus - AM',
      clientPhone: '(92) 98765-4321',
      benefitSpecies: 'Aposentadoria por Idade Rural',
      feeDescription: '30% (trinta por cento) sobre a totalidade dos atrasados apurados',
      lawyerName: 'Dr. Alexandre Pontes',
      lawyerOab: 'OAB/AM 55.858',
      cabinetFolder: 'Armário Rural - Pasta 2026-R01',
      fullDate: '20 de Novembro de 2026',
    });

    assert.ok(merged.includes('Sebastião Alves da Silva'));
    assert.ok(merged.includes('123.456.789-00'));
    assert.ok(merged.includes('Agricultor Familiar / Lavrador'));
    assert.ok(merged.includes('Sítio Riacho do Meio'));
    assert.ok(merged.includes('Dr. Alexandre Pontes'));
    assert.ok(merged.includes('OAB/AM 55.858'));
    assert.ok(merged.includes('30% (trinta por cento) sobre a totalidade dos atrasados'));
    assert.ok(!merged.includes('{{NOME_CLIENTE}}'));
    assert.ok(!merged.includes('{{CPF}}'));
    assert.ok(!merged.includes('{{HONORARIOS}}'));
  });

  it('should automatically translate English benefit terms like Temporary Disability in template merging', () => {
    const rawTemplate = 'OBJETO: Concessão do benefício previdenciário de {{BENEFICIO}}. Contratante: {{NOME_CLIENTE}}.';
    const merged = mergeTemplatePlaceholders(rawTemplate, {
      clientName: 'Antônio Carlos da Silva',
      benefitSpecies: 'Temporary Disability',
    });

    assert.ok(
      merged.includes('Benefício por Incapacidade Temporária (Auxílio-Doença)'),
      'Should translate Temporary Disability to Benefício por Incapacidade Temporária (Auxílio-Doença)'
    );
    assert.ok(!merged.includes('Temporary Disability'));
  });

  it('should allow adding a custom template and retrieving it from store', () => {
    const newTemplate = contractsStore.addTemplate({
      tenantId: 'tenant-001',
      title: 'Minuta Customizada — Aposentadoria Híbrida',
      benefitSpecies: 'Aposentadoria Híbrida',
      description: 'Minuta específica adicionada na aba modelos',
      defaultFeeModel: 'QUOTA_LITIS',
      defaultQuotaLitisPercentage: 30,
      clausesCount: 8,
      isDefault: false,
      lawyerName: 'Dra. Camila Santos',
      lawyerOab: 'OAB/AM 22.100',
      contentBody: 'CONTRATO CUSTOMIZADO {{NOME_CLIENTE}} - {{BENEFICIO}}',
    });

    assert.ok(newTemplate.id.startsWith('tpl-'));
    const all = contractsStore.getTemplates();
    const found = all.find((t) => t.id === newTemplate.id);
    assert.ok(found);
    assert.strictEqual(found.title, 'Minuta Customizada — Aposentadoria Híbrida');
  });

  it('should allow updating an existing template', () => {
    const templates = contractsStore.getTemplates();
    const tpl = templates[0];
    const originalTitle = tpl.title;

    const updated = contractsStore.updateTemplate({
      ...tpl,
      title: `${originalTitle} (Revisada OAB)`,
    });

    assert.ok(updated);
    assert.strictEqual(updated.title, `${originalTitle} (Revisada OAB)`);
  });
});
