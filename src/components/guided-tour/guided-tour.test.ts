import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TOUR_STEPS } from './tour-steps.ts';
import { DEMO_CLIENT, DEMO_ATTENDANCES, DEMO_CONTRACT } from '../../lib/guided-tour/demo-data.ts';

describe('Guided Tour & Interactive Spotlight Walkthrough', () => {
  it('should define exactly 7 comprehensive steps covering all user requirements', () => {
    assert.strictEqual(TOUR_STEPS.length, 7);
  });

  it('Step 1 should explain Fast Intake vs Full Client Registration', () => {
    const step1 = TOUR_STEPS[0];
    assert.strictEqual(step1.stepNumber, 1);
    assert.ok(step1.title.includes('Entrada Rápida'));
    assert.ok(step1.description.includes('duas modalidades'));
    assert.ok(step1.highlights.some((h) => h.includes('Entrada Rápida')));
    assert.ok(step1.highlights.some((h) => h.includes('Ficha Cadastral Completa')));
    assert.strictEqual(step1.targetSelector, '#tour-fast-intake-btn');
  });

  it('Step 2 should showcase client data visualization with sandbox demo data', () => {
    const step2 = TOUR_STEPS[1];
    assert.strictEqual(step2.stepNumber, 2);
    assert.strictEqual(step2.requiresDemoData, true);
    assert.strictEqual(step2.targetSelector, '#tour-demo-client-row');
    assert.ok(step2.highlights.some((h) => h.includes('Localizador de Pasta Física')));
  });

  it('Step 3 should detail return attendances and procedural timeline', () => {
    const step3 = TOUR_STEPS[2];
    assert.strictEqual(step3.stepNumber, 3);
    assert.ok(step3.title.includes('Retorno'));
    assert.ok(step3.highlights.some((h) => h.includes('Histórico Inalterável')));
    assert.ok(step3.highlights.some((h) => h.includes('Checklist de Documentos Pendentes')));
  });

  it('Step 4 should explain contracts, powers of attorney, and template customization', () => {
    const step4 = TOUR_STEPS[3];
    assert.strictEqual(step4.stepNumber, 4);
    assert.ok(step4.title.includes('Contratos') && step4.title.includes('Procurações'));
    assert.ok(step4.highlights.some((h) => h.includes('Quota Litis')));
    assert.ok(step4.highlights.some((h) => h.includes('Como Alterar Minutas')));
  });

  it('Step 5 should explain the purpose of the Client PDF Dossier', () => {
    const step5 = TOUR_STEPS[4];
    assert.strictEqual(step5.stepNumber, 5);
    assert.ok(step5.title.includes('Ficha em PDF'));
    assert.ok(step5.highlights.some((h) => h.includes('Assinatura Física')));
    assert.ok(step5.highlights.some((h) => h.includes('Armazenamento em Pasta Física')));
    assert.ok(step5.highlights.some((h) => h.includes('LGPD')));
  });

  it('Step 6 should highlight the integrated Vade Mecum for instant statutory search', () => {
    const step6 = TOUR_STEPS[5];
    assert.strictEqual(step6.stepNumber, 6);
    assert.strictEqual(step6.targetSelector, '#tour-vade-mecum-btn');
    assert.ok(step6.highlights.some((h) => h.includes('IN 128')));
  });

  it('Step 7 should cover firm settings, team permissions, and LGPD audit logs', () => {
    const step7 = TOUR_STEPS[6];
    assert.strictEqual(step7.stepNumber, 7);
    assert.strictEqual(step7.targetSelector, '#tour-settings-nav-link');
    assert.ok(step7.highlights.some((h) => h.includes('Dados da Banca')));
    assert.ok(step7.highlights.some((h) => h.includes('Auditoria Forense (LGPD)')));
  });

  it('DEMO_CLIENT should provide comprehensive realistic sample data without polluting DB', () => {
    assert.strictEqual(DEMO_CLIENT.id, 'demo-client-tour-001');
    assert.strictEqual(DEMO_CLIENT.benefitType, 'Aposentadoria por Idade Rural');
    assert.strictEqual(DEMO_CLIENT.visitCount, 2);
    assert.ok(DEMO_ATTENDANCES && DEMO_ATTENDANCES.length >= 2);
    assert.strictEqual(DEMO_CONTRACT.contractNumber, 'CTR-2026-DEMO');
  });
});
