import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  compressBackup,
  decompressBackup,
  encryptBackup,
  decryptBackup,
} from './backup-encryption.ts';

describe('Backup Security & Encryption: Disaster Recovery Cycle', () => {
  const sampleDatabaseDump = `
    -- PreviOffice PostgreSQL Dump Simulation
    CREATE TABLE tenants (id UUID PRIMARY KEY, name TEXT);
    INSERT INTO tenants VALUES ('11111111-1111-1111-1111-111111111111', 'Escritório Pontes & Associados');
    CREATE TABLE clients (id UUID PRIMARY KEY, tenant_id UUID, name TEXT, cpf TEXT);
    INSERT INTO clients VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'João da Silva', '12345678901');
    INSERT INTO clients VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Maria de Souza', '98765432100');
  `.repeat(10); // repetido para simular tamanho

  const masterPassphrase = 'SenhaUltraSecretaPreviOffice#2026!ComAltaEntropia';

  it('should compress SQL dump and significantly reduce payload size', () => {
    const rawBuffer = Buffer.from(sampleDatabaseDump, 'utf-8');
    const compressed = compressBackup(rawBuffer);

    assert.ok(
      compressed.length < rawBuffer.length * 0.3,
      `O arquivo compactado (${compressed.length}b) deve ser menor que 30% do original (${rawBuffer.length}b)`
    );

    const decompressed = decompressBackup(compressed);
    assert.strictEqual(decompressed.toString('utf-8'), sampleDatabaseDump);
  });

  it('should encrypt with AES-256-GCM and decrypt cleanly with correct passphrase', () => {
    const originalBuffer = Buffer.from(sampleDatabaseDump, 'utf-8');
    const encrypted = encryptBackup(originalBuffer, masterPassphrase);

    // O arquivo cifrado não deve conter texto legível
    assert.ok(!encrypted.toString('utf-8').includes('João da Silva'));
    assert.ok(!encrypted.toString('utf-8').includes('Escritório Pontes'));

    // Restauração
    const decrypted = decryptBackup(encrypted, masterPassphrase);
    assert.strictEqual(decrypted.toString('utf-8'), sampleDatabaseDump);

    // Checksum SHA-256 idêntico
    const originalHash = crypto.createHash('sha256').update(originalBuffer).digest('hex');
    const restoredHash = crypto.createHash('sha256').update(decrypted).digest('hex');
    assert.strictEqual(restoredHash, originalHash);
  });

  it('should reject decryption when wrong passphrase is provided', () => {
    const originalBuffer = Buffer.from('dados confidenciais', 'utf-8');
    const encrypted = encryptBackup(originalBuffer, masterPassphrase);

    assert.throws(
      () => decryptBackup(encrypted, 'SenhaErrada12345678!'),
      /Falha na descriptografia/
    );
  });

  it('should reject decryption if the encrypted archive was corrupted or tampered with', () => {
    const originalBuffer = Buffer.from('dados protegidos do escritório', 'utf-8');
    const encrypted = encryptBackup(originalBuffer, masterPassphrase);

    // Altera 1 byte no corpo da mensagem (simulação de corrupção de disco ou ataque)
    const corrupted = Buffer.from(encrypted);
    corrupted[corrupted.length - 5] ^= 0xff;

    assert.throws(
      () => decryptBackup(corrupted, masterPassphrase),
      /Falha na descriptografia/
    );
  });

  it('should simulate full disaster recovery: Dump -> Compress -> Encrypt -> Wipe -> Decrypt -> Decompress -> Restore', () => {
    // 1. Simulação do Banco Ativo
    let mockLiveDatabase = sampleDatabaseDump;
    const initialChecksum = crypto.createHash('sha256').update(mockLiveDatabase).digest('hex');

    // 2. Rotina de Backup (Gzip + AES-256)
    const compressedDump = compressBackup(mockLiveDatabase);
    const encryptedOffsiteArchive = encryptBackup(compressedDump, masterPassphrase);

    // 3. Simulação de Desastre (Banco de dados zerado / corrompido)
    mockLiveDatabase = '';
    assert.strictEqual(mockLiveDatabase.length, 0);

    // 4. Rotina de Recuperação (Disaster Recovery)
    const decryptedDump = decryptBackup(encryptedOffsiteArchive, masterPassphrase);
    const restoredDatabase = decompressBackup(decryptedDump).toString('utf-8');

    // 5. Verificação da Integridade pós-recuperação
    const finalChecksum = crypto.createHash('sha256').update(restoredDatabase).digest('hex');
    assert.strictEqual(finalChecksum, initialChecksum);
    assert.ok(restoredDatabase.includes('João da Silva'));
    assert.ok(restoredDatabase.includes('Escritório Pontes & Associados'));
  });
});
