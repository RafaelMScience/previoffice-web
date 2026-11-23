import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import {
  encryptData,
  decryptData,
  isEncrypted,
  encryptBuffer,
  decryptBuffer,
} from './encryption.ts';

describe('Encryption Security Module', () => {
  it('should encrypt and decrypt plaintext password correctly (round-trip)', () => {
    const plain = 'MinhaSenha@INSS2026#';
    const encrypted = encryptData(plain);

    assert.notStrictEqual(encrypted, plain);
    assert.strictEqual(isEncrypted(encrypted), true);
    assert.match(encrypted, /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);

    const decrypted = decryptData(encrypted);
    assert.strictEqual(decrypted, plain);
  });

  it('should identify plain text as not encrypted', () => {
    assert.strictEqual(isEncrypted('123456'), false);
    assert.strictEqual(isEncrypted('minhasenha@123'), false);
    assert.strictEqual(isEncrypted(''), false);
  });

  it('should detect isEncrypted even with leading or trailing whitespace', () => {
    const plain = 'MinhaSenhaSegura';
    const encrypted = encryptData(plain);
    const withWhitespace = `  ${encrypted} \n`;

    assert.strictEqual(isEncrypted(withWhitespace), true);
    // encryptData on an already encrypted string should NOT re-encrypt
    const reEncrypted = encryptData(withWhitespace);
    assert.strictEqual(reEncrypted, encrypted);
    assert.strictEqual(decryptData(withWhitespace), plain);
  });

  it('should return unencrypted legacy plaintext unchanged on decryptData', () => {
    const plain = 'senha_legada_sem_criptografia';
    const result = decryptData(plain);
    assert.strictEqual(result, plain);
  });

  it('should handle empty or null values gracefully', () => {
    assert.strictEqual(encryptData(''), '');
    assert.strictEqual(decryptData(''), '');
  });

  it('should decrypt legacy ciphertext encrypted with fallback key when master key is active', () => {
    // Manually encrypt with fallback key
    const fallbackKey = crypto.createHash('sha256').update('po_master_security_encryption_key_2026').digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', fallbackKey, iv);
    const plain = 'SenhaCriadaPeloNavegadorComFallback';
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const armored = `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;

    // Now test decryptData
    const decrypted = decryptData(armored);
    assert.strictEqual(decrypted, plain);
  });

  it('should encrypt and decrypt binary buffers correctly', () => {
    const original = Buffer.from('Documento confidencial do cliente em PDF ou imagem', 'utf-8');
    const encrypted = encryptBuffer(original);

    assert.notDeepStrictEqual(encrypted, original);
    const decrypted = decryptBuffer(encrypted);
    assert.deepStrictEqual(decrypted, original);
    assert.strictEqual(decrypted.toString('utf-8'), original.toString('utf-8'));
  });

  it('should fail closed and throw in production when master keys are missing', () => {
    const origEnv = process.env.NODE_ENV;
    const origKey1 = process.env.ENCRYPTION_MASTER_KEY;
    const origKey2 = process.env.MASTER_ADMIN_KEY;

    try {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.ENCRYPTION_MASTER_KEY;
      delete process.env.MASTER_ADMIN_KEY;

      assert.throws(
        () => {
          encryptData('SegredoQueNaoPodeUsarFallback');
        },
        {
          name: 'Error',
          message: /SECURITY CRITICAL: ENCRYPTION_MASTER_KEY or MASTER_ADMIN_KEY must be defined in production environment/,
        }
      );
    } finally {
      (process.env as any).NODE_ENV = origEnv;
      if (origKey1) process.env.ENCRYPTION_MASTER_KEY = origKey1;
      if (origKey2) process.env.MASTER_ADMIN_KEY = origKey2;
    }
  });
});
