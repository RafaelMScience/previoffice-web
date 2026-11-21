import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(zlib.gzip);
const brotliCompressAsync = promisify(zlib.brotliCompress);
const gunzipAsync = promisify(zlib.gunzip);
const brotliDecompressAsync = promisify(zlib.brotliDecompress);

export type SupportedCompression = 'br' | 'gzip' | 'identity';

/**
 * Parses client Accept-Encoding header and resolves preferred algorithm (Brotli preferred over Gzip).
 */
export function resolveEncoding(acceptEncodingHeader?: string | null): SupportedCompression {
  if (!acceptEncodingHeader) return 'identity';

  const header = acceptEncodingHeader.toLowerCase();

  // Brotli offers highest compression ratio for text/JSON
  if (header.includes('br')) {
    return 'br';
  }
  if (header.includes('gzip')) {
    return 'gzip';
  }

  return 'identity';
}

/**
 * Compresses string or Buffer with Brotli (level 4 for real-time web response speed) or Gzip fallback.
 */
export async function compressPayload(
  payload: string | Buffer,
  encoding: SupportedCompression
): Promise<{ data: Buffer; encoding: SupportedCompression }> {
  const buffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf-8');

  if (encoding === 'br') {
    const data = await brotliCompressAsync(buffer, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4, // Balanced speed & high compression ratio
      },
    });
    return { data, encoding: 'br' };
  }

  if (encoding === 'gzip') {
    const data = await gzipAsync(buffer, {
      level: 6,
    });
    return { data, encoding: 'gzip' };
  }

  return { data: buffer, encoding: 'identity' };
}

/**
 * Decompresses Brotli or Gzip buffers.
 */
export async function decompressPayload(
  buffer: Buffer,
  encoding: SupportedCompression
): Promise<Buffer> {
  if (encoding === 'br') {
    return await brotliDecompressAsync(buffer);
  }
  if (encoding === 'gzip') {
    return await gunzipAsync(buffer);
  }
  return buffer;
}
