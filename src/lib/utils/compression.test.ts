import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  resolveEncoding,
  compressPayload,
  decompressPayload,
} from './compression.ts';

describe('Item 09: Compressão Brotli & Gzip (HTTP Responses & JSON Payloads)', () => {
  it('should prefer Brotli (br) over Gzip when both are supported in Accept-Encoding', () => {
    const encoding = resolveEncoding('gzip, deflate, br, zstd');
    assert.strictEqual(encoding, 'br');
  });

  it('should fallback to Gzip when client only accepts gzip', () => {
    const encoding = resolveEncoding('gzip, deflate');
    assert.strictEqual(encoding, 'gzip');
  });

  it('should fallback to identity when client does not support compression', () => {
    assert.strictEqual(resolveEncoding(''), 'identity');
    assert.strictEqual(resolveEncoding(null), 'identity');
    assert.strictEqual(resolveEncoding('identity'), 'identity');
  });

  it('should compress JSON text payload with Brotli and achieve significant size reduction (> 50%)', async () => {
    const largeMockJson = JSON.stringify({
      clients: Array.from({ length: 50 }, (_, i) => ({
        id: `client_${i}`,
        fullName: `Cliente Previdenciário Número ${i}`,
        cpf: '123.456.789-00',
        benefitType: 'APOSENTADORIA_RURAL',
        status: 'ACTIVE',
        notes: 'Documentação completa arquivada em pasta física no armário A.',
      })),
    });

    const originalSize = Buffer.byteLength(largeMockJson, 'utf-8');
    const { data: compressed, encoding } = await compressPayload(largeMockJson, 'br');

    assert.strictEqual(encoding, 'br');
    assert.ok(
      compressed.byteLength < originalSize * 0.45,
      `Brotli compressed size (${compressed.byteLength}B) should be < 45% of original (${originalSize}B)`
    );

    // Verify round-trip decompression
    const decompressed = await decompressPayload(compressed, 'br');
    assert.strictEqual(decompressed.toString('utf-8'), largeMockJson);
  });

  it('should compress JSON text payload with Gzip fallback and successfully decompress', async () => {
    const mockJson = JSON.stringify({
      status: 'success',
      records: Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Record ${i}` })),
    });

    const originalSize = Buffer.byteLength(mockJson, 'utf-8');
    const { data: compressed, encoding } = await compressPayload(mockJson, 'gzip');

    assert.strictEqual(encoding, 'gzip');
    assert.ok(
      compressed.byteLength < originalSize,
      `Gzip compressed size (${compressed.byteLength}B) should be < original (${originalSize}B)`
    );

    const decompressed = await decompressPayload(compressed, 'gzip');
    assert.strictEqual(decompressed.toString('utf-8'), mockJson);
  });
});
