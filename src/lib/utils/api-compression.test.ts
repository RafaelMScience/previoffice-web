import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCompressedJsonResponse, MIN_COMPRESSION_SIZE_BYTES } from './compression.ts';

describe('Item 27: Compactação de Respostas com Gzip na API (Payloads > 1 KB)', () => {
  it('does NOT compress small JSON payloads (< 1 KB) to avoid CPU overhead', async () => {
    const smallData = { status: 'ok', count: 5 };
    const fakeRequest = { headers: { get: () => 'gzip, deflate, br' } };

    const res = await createCompressedJsonResponse(smallData, fakeRequest);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    assert.equal(res.headers.get('content-encoding'), null, 'Must NOT contain content-encoding for payloads < 1 KB');
  });

  it('compresses large JSON payloads (> 1 KB) with gzip when client supports gzip', async () => {
    // Generate JSON > 1 KB
    const largeData = {
      documents: Array.from({ length: 30 }, (_, i) => ({
        id: `doc-${i}`,
        originalName: `procuracao_documento_previdenciario_assinatura_${i}.pdf`,
        category: 'PROC_AD_JUDICIA',
        sizeBytes: 1024 * 50,
      })),
    };

    const fakeRequest = { headers: { get: (h: string) => (h === 'accept-encoding' ? 'gzip, deflate' : null) } };
    const res = await createCompressedJsonResponse(largeData, fakeRequest);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    assert.equal(res.headers.get('content-encoding'), 'gzip', 'Must contain Content-Encoding: gzip');
    assert.equal(res.headers.get('vary'), 'Accept-Encoding');

    const uncompressedSize = Buffer.byteLength(JSON.stringify(largeData), 'utf8');
    const compressedSize = Number(res.headers.get('content-length'));

    assert.ok(uncompressedSize > MIN_COMPRESSION_SIZE_BYTES, 'Uncompressed size must exceed 1 KB');
    assert.ok(compressedSize < uncompressedSize, 'Compressed size must be smaller than uncompressed size');
    assert.ok(compressedSize / uncompressedSize < 0.5, 'Gzip compression should achieve > 50% size reduction on JSON');
  });

  it('serves uncompressed payload if client does not support gzip encoding', async () => {
    const largeData = {
      items: Array.from({ length: 50 }, (_, i) => ({ id: i, label: 'item-teste' })),
    };

    const fakeRequestNoGzip = { headers: { get: () => null } };
    const res = await createCompressedJsonResponse(largeData, fakeRequestNoGzip);

    assert.equal(res.headers.get('content-encoding'), null, 'Must not compress when client lacks gzip header');
  });
});
