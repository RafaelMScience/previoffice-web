import crypto from 'crypto';
import zlib from 'zlib';

const MAGIC_HEADER = Buffer.from('PREVIOFFICE_ENC_V1', 'utf-8'); // 18 bytes
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits

/**
 * Deriva uma chave de 256 bits a partir da senha mestra e do salt usando PBKDF2.
 */
function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    passphrase,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Compacta dados brutos com Gzip no nível máximo.
 */
export function compressBackup(data: Buffer | string): Buffer {
  const inputBuffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  return zlib.gzipSync(inputBuffer, { level: 9 });
}

/**
 * Descompacta dados Gzip para buffer original.
 */
export function decompressBackup(compressed: Buffer): Buffer {
  return zlib.gunzipSync(compressed);
}

/**
 * Criptografa dados com padrão militar AES-256-GCM autenticado.
 * Formato do pacote binário:
 * [MAGIC_HEADER: 18b] + [SALT: 16b] + [IV: 12b] + [AUTH_TAG: 16b] + [CIPHERTEXT: Nb]
 */
export function encryptBackup(data: Buffer | string, passphrase: string): Buffer {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('A frase-chave de backup deve conter no mínimo 8 caracteres.');
  }

  const rawBuffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(rawBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([MAGIC_HEADER, salt, iv, authTag, ciphertext]);
}

/**
 * Descriptografa e autentica um pacote de backup AES-256-GCM.
 * Lança erro se a chave estiver incorreta ou os dados tiverem sido adulterados.
 */
export function decryptBackup(encryptedBuffer: Buffer, passphrase: string): Buffer {
  if (!passphrase) {
    throw new Error('Frase-chave de backup não fornecida.');
  }

  const headerLength = MAGIC_HEADER.length;
  const minLength = headerLength + SALT_LENGTH + IV_LENGTH + TAG_LENGTH;

  if (encryptedBuffer.length < minLength) {
    throw new Error('Arquivo de backup inválido ou corrompido: tamanho insuficiente.');
  }

  const header = encryptedBuffer.subarray(0, headerLength);
  if (!header.equals(MAGIC_HEADER)) {
    throw new Error('Cabeçalho de backup incompatível ou arquivo corrompido.');
  }

  let offset = headerLength;
  const salt = encryptedBuffer.subarray(offset, offset + SALT_LENGTH);
  offset += SALT_LENGTH;

  const iv = encryptedBuffer.subarray(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const authTag = encryptedBuffer.subarray(offset, offset + TAG_LENGTH);
  offset += TAG_LENGTH;

  const ciphertext = encryptedBuffer.subarray(offset);

  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error('Falha na descriptografia: senha incorreta ou arquivo adulterado (HMAC inválido).');
  }
}
