import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateLawyerFeeClause,
  generateFeeInstallments,
  mergeTemplatePlaceholders,
  formatMoneyBRL,
  formatDatePtBR,
  formatPaymentMethod,
} from './template-engine.ts';

describe('Legal Template Engine & Remuneration Regimes', () => {
  describe('Quota Litis Regime (Êxito Puro)', () => {
    it('should generate lawyer-standard Quota Litis clause with 30% on R$ 36.000 = R$ 10.800', () => {
      const clause = generateLawyerFeeClause({
        feeModel: 'QUOTA_LITIS',
        quotaLitisPercentage: 30,
        estimatedRetroactiveAmount: 36000,
      });

      assert.ok(clause.includes('30% (30 por cento)'));
      assert.ok(clause.includes('R$ 36.000,00'));
      assert.ok(clause.includes('R$ 10.800,00'));
      assert.ok(clause.includes('Data de Entrada do Requerimento Administrativo (DER)'));
      assert.ok(clause.includes('§ 1º'));
      assert.ok(clause.includes('§ 2º'));
      assert.ok(clause.includes('nada será cobrado'));
    });

    it('should dynamically update when percentage and retroactives change', () => {
      const clause = generateLawyerFeeClause({
        feeModel: 'QUOTA_LITIS',
        quotaLitisPercentage: 20,
        estimatedRetroactiveAmount: 50000,
      });

      assert.ok(clause.includes('20% (20 por cento)'));
      assert.ok(clause.includes('R$ 50.000,00'));
      assert.ok(clause.includes('R$ 10.000,00'));
    });
  });

  describe('Fixed Installments Regime (Parcelamento / Carnê)', () => {
    it('should generate lawyer-standard Installment clause with detailed dates and amounts', () => {
      const clause = generateLawyerFeeClause({
        feeModel: 'FIXED_INSTALLMENT',
        fixedTotalAmount: 2400,
        installmentCount: 6,
        firstDueDate: '2026-12-05',
      });

      assert.ok(clause.includes('R$ 2.400,00'));
      assert.ok(clause.includes('6 prestação(ões)'));
      assert.ok(clause.includes('R$ 400,00'));
      assert.ok(clause.includes('Parcela 1/6: R$ 400,00 — Vencimento em 05/12/2026'));
      assert.ok(clause.includes('Parcela 6/6: R$ 400,00 — Vencimento em 05/05/2027'));
      assert.ok(clause.includes('multa moratória de 2%'));
      assert.ok(clause.includes('juros legais de 1%'));
    });
  });

  describe('Hybrid Regime (Entrada + Quota Litis)', () => {
    it('should generate lawyer-standard Hybrid clause combining pro labore schedule and success fee', () => {
      const clause = generateLawyerFeeClause({
        feeModel: 'HYBRID',
        fixedTotalAmount: 2400,
        installmentCount: 6,
        firstDueDate: '2026-12-05',
        quotaLitisPercentage: 30,
        estimatedRetroactiveAmount: 36000,
      });

      assert.ok(clause.includes('regime híbrido'));
      assert.ok(clause.includes('I — PARCELA FIXA (PRO LABORE)'));
      assert.ok(clause.includes('R$ 2.400,00'));
      assert.ok(clause.includes('Parcela 1/6: R$ 400,00 — Vencimento em 05/12/2026'));
      assert.ok(clause.includes('II — PARCELA DE ÊXITO (QUOTA LITIS AD EXITUM)'));
      assert.ok(clause.includes('30% (30 por cento)'));
      assert.ok(clause.includes('R$ 10.800,00'));
    });
  });

  describe('generateFeeInstallments schedule calculation', () => {
    it('should calculate accurate monthly installment dates and round fractions properly', () => {
      const installments = generateFeeInstallments(2400, 6, '2026-12-05', 'CTR-TEST-001');

      assert.strictEqual(installments.length, 6);
      assert.strictEqual(installments[0].installmentNumber, 1);
      assert.strictEqual(installments[0].amount, 400);
      assert.strictEqual(installments[0].dueDate, '2026-12-05');
      assert.strictEqual(installments[5].installmentNumber, 6);
      assert.strictEqual(installments[5].amount, 400);
      assert.strictEqual(installments[5].dueDate, '2027-05-05');

      const total = installments.reduce((acc, curr) => acc + curr.amount, 0);
      assert.strictEqual(total, 2400);
    });

    it('should respect recurringDueDay for subsequent installments when specified', () => {
      // 1ª parcela no dia 25/11/2026, demais parcelas todo dia 10
      const installments = generateFeeInstallments(2400, 4, '2026-11-25', 'CTR-TEST-003', 10);

      assert.strictEqual(installments.length, 4);
      assert.strictEqual(installments[0].dueDate, '2026-11-25'); // 1ª parcela na data de entrada
      assert.strictEqual(installments[1].dueDate, '2026-12-10'); // 2ª parcela no dia fixo 10
      assert.strictEqual(installments[2].dueDate, '2027-01-10'); // 3ª parcela no dia fixo 10
      assert.strictEqual(installments[3].dueDate, '2027-02-10'); // 4ª parcela no dia fixo 10
    });

    it('should clamp due dates correctly when month has fewer days (e.g. Jan 31 -> Feb 28)', () => {
      const installments = generateFeeInstallments(3000, 3, '2026-01-31', 'CTR-TEST-002');

      assert.strictEqual(installments.length, 3);
      assert.strictEqual(installments[0].dueDate, '2026-01-31');
      assert.strictEqual(installments[1].dueDate, '2026-02-28');
      assert.strictEqual(installments[2].dueDate, '2026-03-31');
    });
  });

  describe('Helper Formatters', () => {
    it('formatMoneyBRL formats currency correctly', () => {
      assert.strictEqual(formatMoneyBRL(10800), 'R$ 10.800,00');
      assert.strictEqual(formatMoneyBRL(0), 'R$ 0,00');
    });

    it('formatDatePtBR formats ISO dates to DD/MM/AAAA', () => {
      assert.strictEqual(formatDatePtBR('2026-12-05'), '05/12/2026');
      assert.strictEqual(formatDatePtBR('2026-12-05T12:00:00Z'), '05/12/2026');
    });

    it('formatPaymentMethod translates English payment enum keys to Portuguese labels', () => {
      assert.strictEqual(formatPaymentMethod('PIX'), 'PIX');
      assert.strictEqual(formatPaymentMethod('CREDIT_CARD'), 'Cartão de Crédito');
      assert.strictEqual(formatPaymentMethod('BOLETO'), 'Boleto Bancário');
      assert.strictEqual(formatPaymentMethod('BANK_SLIP'), 'Boleto Bancário');
      assert.strictEqual(formatPaymentMethod('CASH'), 'Dinheiro em Espécie');
      assert.strictEqual(formatPaymentMethod('BANK_TRANSFER'), 'Transferência Bancária');
      assert.strictEqual(formatPaymentMethod('RPV_PRECATORIO_RETENTION'), 'Retenção de RPV / Precatório');
      assert.strictEqual(formatPaymentMethod(undefined), 'PIX');
      assert.strictEqual(formatPaymentMethod('OUTRO_METODO'), 'OUTRO_METODO');
    });
  });
});
