import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  unmask,
  maskCpf,
  maskCnpj,
  maskCpfCnpj,
  maskPhone,
  maskCep,
  maskBenefitNumber,
} from './masks.ts';

describe('Mask Utilities', () => {
  it('unmask should strip non-digits', () => {
    assert.equal(unmask('123.456.789-00'), '12345678900');
    assert.equal(unmask('(83) 98888-0000'), '83988880000');
    assert.equal(unmask(''), '');
    assert.equal(unmask(null), '');
    assert.equal(unmask(undefined), '');
  });

  describe('maskCpf', () => {
    it('formats partial and complete CPFs', () => {
      assert.equal(maskCpf('123'), '123');
      assert.equal(maskCpf('1234'), '123.4');
      assert.equal(maskCpf('123456'), '123.456');
      assert.equal(maskCpf('1234567'), '123.456.7');
      assert.equal(maskCpf('123456789'), '123.456.789');
      assert.equal(maskCpf('1234567890'), '123.456.789-0');
      assert.equal(maskCpf('12345678901'), '123.456.789-01');
      assert.equal(maskCpf('123456789019999'), '123.456.789-01'); // truncates to 11
    });

    it('handles empty or null values', () => {
      assert.equal(maskCpf(''), '');
      assert.equal(maskCpf(null), '');
    });
  });

  describe('maskCnpj', () => {
    it('formats partial and complete CNPJs', () => {
      assert.equal(maskCnpj('12'), '12');
      assert.equal(maskCnpj('123'), '12.3');
      assert.equal(maskCnpj('12345'), '12.345');
      assert.equal(maskCnpj('12345678'), '12.345.678');
      assert.equal(maskCnpj('123456780001'), '12.345.678/0001');
      assert.equal(maskCnpj('12345678000195'), '12.345.678/0001-95');
      assert.equal(maskCnpj('12345678000195999'), '12.345.678/0001-95'); // truncates to 14
    });
  });

  describe('maskCpfCnpj', () => {
    it('dynamically formats as CPF when <= 11 digits and CNPJ when > 11 digits', () => {
      assert.equal(maskCpfCnpj('12345678901'), '123.456.789-01');
      assert.equal(maskCpfCnpj('12345678000195'), '12.345.678/0001-95');
    });
  });

  describe('maskPhone', () => {
    it('formats DDD only', () => {
      assert.equal(maskPhone('8'), '(8');
      assert.equal(maskPhone('83'), '(83');
    });

    it('formats landline (8 digits + DDD = 10 digits)', () => {
      assert.equal(maskPhone('833321'), '(83) 3321');
      assert.equal(maskPhone('8333214567'), '(83) 3321-4567');
    });

    it('formats mobile phone (9 digits + DDD = 11 digits)', () => {
      assert.equal(maskPhone('83988884567'), '(83) 98888-4567');
      assert.equal(maskPhone('83988884567999'), '(83) 98888-4567'); // truncates to 11
    });

    it('handles empty or null values', () => {
      assert.equal(maskPhone(''), '');
      assert.equal(maskPhone(null), '');
    });
  });

  describe('maskCep', () => {
    it('formats partial and complete CEPs', () => {
      assert.equal(maskCep('58000'), '58000');
      assert.equal(maskCep('58000000'), '58000-000');
      assert.equal(maskCep('58000000999'), '58000-000'); // truncates to 8
    });
  });

  describe('maskBenefitNumber', () => {
    it('formats 10-digit INSS Benefit Number', () => {
      assert.equal(maskBenefitNumber('1234567890'), '123.456.789-0');
      assert.equal(maskBenefitNumber('1234567890999'), '123.456.789-0'); // truncates to 10
    });
  });
});
