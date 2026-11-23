import crypto from 'crypto';

/**
 * Military-grade AES-256-GCM encryption for sensitive legal credentials (INSS passwords, document keys).
 * Produces an armored string formatted as: "iv:authTag:ciphertext" (hex encoded).
 */

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_FALLBACK_KEY = 'po_master_security_encryption_key_2026';

function getKeys(): Buffer[] {
  const envKey = process.env.ENCRYPTION_MASTER_KEY || process.env.MASTER_ADMIN_KEY;

  if (!envKey && process.env.NODE_ENV === 'production') {
    throw new Error(
      'SECURITY CRITICAL: ENCRYPTION_MASTER_KEY or MASTER_ADMIN_KEY must be defined in production environment.'
    );
  }

  const primary = envKey || DEFAULT_FALLBACK_KEY;

  const keys: Buffer[] = [
    crypto.createHash('sha256').update(primary).digest(),
  ];

  if (process.env.NODE_ENV !== 'production' && primary !== DEFAULT_FALLBACK_KEY) {
    keys.push(crypto.createHash('sha256').update(DEFAULT_FALLBACK_KEY).digest());
  }

  return keys;
}

/**
 * Checks whether a given string is already formatted as an AES-256-GCM armored string.
 */
export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  const parts = trimmed.split(':');
  if (parts.length !== 3) return false;
  const [ivHex, tagHex, cipherHex] = parts;
  return (
    ivHex.length === 24 &&
    tagHex.length === 32 &&
    cipherHex.length > 0 &&
    /^[0-9a-fA-F]+$/.test(ivHex) &&
    /^[0-9a-fA-F]+$/.test(tagHex) &&
    /^[0-9a-fA-F]+$/.test(cipherHex)
  );
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 */
export function encryptData(plaintext: string): string {
  const trimmed = plaintext?.trim();
  if (!trimmed) return '';
  if (isEncrypted(trimmed)) return trimmed;

  const key = getKeys()[0];
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(trimmed, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM armored string ("iv:authTag:ciphertext").
 * Tries the primary server master key first, then gracefully falls back to the client/fallback key.
 * Falls back safely to the original string if it is not encrypted or plaintext legacy.
 */
export function decryptData(cipherArmored: string): string {
  if (!cipherArmored) return '';

  const trimmed = cipherArmored.trim();
  if (!isEncrypted(trimmed)) {
    return cipherArmored;
  }

  const [ivHex, tagHex, cipherHex] = trimmed.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');

  const keys = getKeys();

  for (const key of keys) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      // Try next key in rotation (e.g., client/server fallback)
      continue;
    }
  }

  console.error('Decryption failed for all candidate keys.');
  return '';
}

/**
 * Encrypts a binary Buffer (e.g. uploaded documents or compressed photos) using AES-256-GCM.
 * Prepends 12-byte IV + 16-byte AuthTag to the ciphertext Buffer.
 */
export function encryptBuffer(buffer: Buffer): Buffer {
  const key = getKeys()[0];
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Output layout: [IV (12 bytes)][AuthTag (16 bytes)][Ciphertext]
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts a binary Buffer previously encrypted with encryptBuffer.
 */
export function decryptBuffer(encryptedBuffer: Buffer): Buffer {
  if (encryptedBuffer.length < 28) {
    return encryptedBuffer;
  }

  const iv = encryptedBuffer.subarray(0, 12);
  const authTag = encryptedBuffer.subarray(12, 28);
  const ciphertext = encryptedBuffer.subarray(28);

  const keys = getKeys();
  for (const key of keys) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
    } catch {
      continue;
    }
  }

  console.error('Buffer decryption failed for all keys.');
  return Buffer.alloc(0);
}
