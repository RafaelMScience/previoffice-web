import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMoneyBRL,
  formatDatePtBR,
  formatDateTimePtBR,
  formatPaymentMethod,
  formatProcessStatus,
} from './formatters.ts';

describe('Standardized Formatters (pt-BR)', () => {
  describe('formatMoneyBRL', () => {
    it('should format numbers to BRL currency correctly', () => {
      assert.match(formatMoneyBRL(1250.5), /R\$\s*1\.250,50/);
      assert.match(formatMoneyBRL(0), /R\$\s*0,00/);
      assert.match(formatMoneyBRL(1000000), /R\$\s*1\.000\.000,00/);
    });

    it('should handle null, undefined or NaN safely without crashing', () => {
      assert.match(formatMoneyBRL(undefined), /R\$\s*0,00/);
      assert.match(formatMoneyBRL(null), /R\$\s*0,00/);
      assert.match(formatMoneyBRL(NaN), /R\$\s*0,00/);
    });
  });

  describe('formatDatePtBR', () => {
    it('should format ISO dates YYYY-MM-DD to DD/MM/AAAA', () => {
      assert.strictEqual(formatDatePtBR('2026-11-24'), '24/11/2026');
      assert.strictEqual(formatDatePtBR('1965-04-12T00:00:00.000Z'), '12/04/1965');
    });

    it('should return fallback string for missing or invalid dates', () => {
      assert.strictEqual(formatDatePtBR(null), 'Não informada');
      assert.strictEqual(formatDatePtBR(undefined), 'Não informada');
      assert.strictEqual(formatDatePtBR('data-invalida'), 'Data inválida');
    });
  });

  describe('formatDateTimePtBR', () => {
    it('should format datetime safely', () => {
      const result = formatDateTimePtBR('2026-11-24T14:30:00.000Z');
      assert.ok(result.includes('/'));
      assert.ok(result.includes('às'));
    });

    it('should return fallback for missing datetime', () => {
      assert.strictEqual(formatDateTimePtBR(null), 'Não informada');
    });
  });

  describe('formatPaymentMethod', () => {
    it('should translate payment methods to Portuguese labels', () => {
      assert.strictEqual(formatPaymentMethod('PIX'), 'PIX');
      assert.strictEqual(formatPaymentMethod('BOLETO'), 'Boleto Bancário');
      assert.strictEqual(formatPaymentMethod('BANK_SLIP'), 'Boleto Bancário');
      assert.strictEqual(formatPaymentMethod('CREDIT_CARD'), 'Cartão de Crédito');
      assert.strictEqual(formatPaymentMethod('BANK_TRANSFER'), 'Transferência Bancária');
      assert.strictEqual(formatPaymentMethod('CASH'), 'Dinheiro em Espécie');
      assert.strictEqual(formatPaymentMethod('RPV_PRECATORIO_RETENTION'), 'Retenção de RPV / Precatório');
      assert.strictEqual(formatPaymentMethod(null), 'PIX');
    });
  });

  describe('formatProcessStatus', () => {
    it('should map status to Portuguese labels and badge classes', () => {
      assert.strictEqual(formatProcessStatus('IN_PROGRESS').label, 'Em Andamento');
      assert.strictEqual(formatProcessStatus('COMPLETED').label, 'Concluído');
      assert.strictEqual(formatProcessStatus('CANCELLED').label, 'Cancelado');
      assert.strictEqual(formatProcessStatus('WAITING_DOCUMENT').label, 'Aguardando Documentos');
      assert.strictEqual(formatProcessStatus(null).label, 'Não Definido');
    });
  });
});
