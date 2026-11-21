import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  BENEFIT_DOCUMENT_PRESETS,
  COMMON_DOCUMENT_SHORTCUTS,
  getDefaultDocumentsForBenefit,
  type DocumentChecklistItem,
} from './document-presets.ts';

describe('Document Presets Domain', () => {
  it('should return predefined documents for Rural Special Retirement', () => {
    const docs = getDefaultDocumentsForBenefit('Rural Special Retirement');
    assert.ok(docs.length >= 4);
    assert.ok(docs.some((d) => d.description.includes('Autodeclaração Rural')));
    assert.ok(docs.some((d) => d.description.includes('Documento com Foto')));
    // By default, preset items are selected (required) and set to not delivered (Pendente)
    assert.strictEqual(docs[0].isSelected, true);
    assert.strictEqual(docs[0].isDelivered, false);
  });

  it('should return medical and CadÚnico documents for BPC/LOAS Disability', () => {
    const docs = getDefaultDocumentsForBenefit('BPC/LOAS Disability');
    assert.ok(docs.some((d) => d.description.toLowerCase().includes('cadúnico')));
    assert.ok(docs.some((d) => d.description.toLowerCase().includes('laudo')));
  });

  it('should return temporary disability documents whether passed in English or Portuguese', () => {
    const docsEn = getDefaultDocumentsForBenefit('Temporary Disability');
    assert.ok(docsEn.some((d) => d.description.toLowerCase().includes('atestado / laudo médico')));

    const docsPt = getDefaultDocumentsForBenefit('Benefício por Incapacidade Temporária (Auxílio-Doença)');
    assert.ok(docsPt.some((d) => d.description.toLowerCase().includes('atestado / laudo médico')));
  });

  it('should fallback to default general documents if benefit is unknown', () => {
    const docs = getDefaultDocumentsForBenefit('NonExistentBenefit');
    assert.ok(docs.length >= 2);
    assert.ok(docs.some((d) => d.description.includes('Documento com Foto')));
  });

  it('should export common document shortcuts for quick addition', () => {
    assert.ok(COMMON_DOCUMENT_SHORTCUTS.length > 0);
    assert.ok(COMMON_DOCUMENT_SHORTCUTS.includes('Extrato CNIS Completo'));
    assert.ok(COMMON_DOCUMENT_SHORTCUTS.includes('Carteira de Trabalho (CTPS)'));
  });
});
