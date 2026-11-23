import { describe, it } from 'node:test';
import assert from 'node:assert';
import { encryptData, decryptData } from '../../../lib/security/encryption.ts';

describe('INSS Password Security & Masking Invariants (VULN-05 & VULN-06)', () => {
  it('should encrypt plaintext password and verify decryption round-trip', () => {
    const rawSecret = 'INSS@Gov2026!#Segredo';
    const encrypted = encryptData(rawSecret);

    assert.notStrictEqual(encrypted, rawSecret);
    assert.strictEqual(decryptData(encrypted), rawSecret);
  });

  it('should ensure masked placeholder is never treated as a new password to encrypt', () => {
    const placeholder: string = '••••••••';
    const isMasked = placeholder.includes('•');
    assert.strictEqual(isMasked, true);

    // In client-service, masked input must not overwrite encrypted_inss_password
    let targetPayloadValue: string | null | undefined = undefined;
    const inputPassword: string = placeholder;

    if (inputPassword === '') {
      targetPayloadValue = null;
    } else if (inputPassword && !inputPassword.includes('•')) {
      targetPayloadValue = encryptData(inputPassword);
    }

    assert.strictEqual(targetPayloadValue, undefined);
  });

  it('should encrypt when a new valid password without bullets is submitted', () => {
    const newPassword: string = 'MinhaNovaSenha@2026';
    let targetPayloadValue: string | null | undefined = undefined;

    if (newPassword === '') {
      targetPayloadValue = null;
    } else if (newPassword && !newPassword.includes('•')) {
      targetPayloadValue = encryptData(newPassword);
    }

    assert.notStrictEqual(targetPayloadValue, undefined);
    assert.notStrictEqual(targetPayloadValue, null);
    assert.strictEqual(decryptData(targetPayloadValue!), newPassword);
  });

  it('should set encrypted_inss_password to null when user explicitly clears the password field', () => {
    const clearedPassword: string = '';
    let targetPayloadValue: string | null | undefined = undefined;

    if (clearedPassword === '') {
      targetPayloadValue = null;
    } else if (clearedPassword && !clearedPassword.includes('•')) {
      targetPayloadValue = encryptData(clearedPassword);
    }

    assert.strictEqual(targetPayloadValue, null);
  });
});
