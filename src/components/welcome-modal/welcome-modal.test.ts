import { describe, it } from 'node:test';
import assert from 'node:assert';
import { WELCOME_SLIDES } from './welcome-slides.ts';

describe('PreviOffice Welcome Slides & Interactive Onboarding Modal', () => {
  it('should define at least 7 comprehensive onboarding slides', () => {
    assert.ok(WELCOME_SLIDES.length >= 7, 'Must have at least 7 base onboarding slides');
  });

  it('Slide 1 should explain Fast Intake vs Full Registration', () => {
    const s1 = WELCOME_SLIDES[0];
    assert.strictEqual(s1.stepNumber, 1);
    assert.ok(s1.title.includes('Entrada Rápida') && s1.title.includes('Ficha Completa'));
    assert.strictEqual(s1.mockup.type, 'reception_intake');
    assert.ok(s1.benefits.some((b) => b.includes('30 segundos')));
  });

  it('Slide 2 should detail Digital Client Record with physical folder archive locator', () => {
    const s2 = WELCOME_SLIDES[1];
    assert.strictEqual(s2.stepNumber, 2);
    assert.ok(s2.title.includes('Prontuário Digital'));
    assert.strictEqual(s2.mockup.type, 'client_record');
    assert.strictEqual(s2.mockup.previewData.name, 'Dona Maria Francisca da Silva');
    assert.ok(s2.mockup.previewData.archiveLocation.includes('Armário 02'));
    assert.ok(s2.benefits.some((b) => b.includes('Localizador de Pasta Física')));
  });

  it('Slide 3 should present return attendances and forensic procedural timeline', () => {
    const s3 = WELCOME_SLIDES[2];
    assert.strictEqual(s3.stepNumber, 3);
    assert.ok(s3.title.includes('Registro de Retornos'));
    assert.strictEqual(s3.mockup.type, 'return_attendance');
    assert.ok(s3.benefits.some((b) => b.includes('Trilha Inalterável')));
  });

  it('Slide 4 should detail contracts and the 3 lawyer remuneration models', () => {
    const s4 = WELCOME_SLIDES[3];
    assert.strictEqual(s4.stepNumber, 4);
    assert.ok(s4.title.includes('3 Modelos de Honorários'));
    assert.strictEqual(s4.mockup.type, 'contracts_fee');
    assert.ok(s4.benefits.some((b) => b.includes('Quota Litis')));
    assert.ok(s4.benefits.some((b) => b.includes('Parcelamento')));
    assert.ok(s4.benefits.some((b) => b.includes('Híbrido')));
  });

  it('Slide 5 should detail the physical Client PDF Dossier for signature and filing', () => {
    const s5 = WELCOME_SLIDES[4];
    assert.strictEqual(s5.stepNumber, 5);
    assert.ok(s5.title.includes('Ficha Cadastral em PDF'));
    assert.strictEqual(s5.mockup.type, 'pdf_dossier');
    assert.ok(s5.benefits.some((b) => b.includes('Assinatura no Balcão')));
    assert.ok(s5.benefits.some((b) => b.includes('Arquivo Físico')));
  });

  it('Slide 6 should present the integrated Vade Mecum with IN 128/2022', () => {
    const s6 = WELCOME_SLIDES[5];
    assert.strictEqual(s6.stepNumber, 6);
    assert.ok(s6.title.includes('Vade Mecum Previdenciário'));
    assert.strictEqual(s6.mockup.type, 'vade_mecum');
    assert.ok(s6.benefits.some((b) => b.includes('IN 128/2022')));
    assert.ok(s6.mockup.previewData.norm.includes('INSS nº 128'));
  });

  it('Slide 7 should detail firm configuration, RBAC team roles, and LGPD audit logs', () => {
    const s7 = WELCOME_SLIDES[6];
    assert.strictEqual(s7.stepNumber, 7);
    assert.ok(s7.title.includes('Configurações da Banca') && s7.title.includes('Auditoria LGPD'));
    assert.strictEqual(s7.mockup.type, 'office_audit');
    assert.ok(s7.benefits.some((b) => b.includes('Auditoria Forense LGPD')));
    assert.ok(s7.mockup.previewData.auditLogs.length >= 3);
  });
});
