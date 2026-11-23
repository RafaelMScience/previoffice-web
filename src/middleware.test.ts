import { describe, it } from 'node:test';
import assert from 'node:assert';
import { STATIC_ASSET_EXTENSIONS, isStaticAssetPath } from './lib/security/routing.ts';

describe('Security: Middleware Path & Asset Routing Filter (VULN-10)', () => {
  it('should identify legitimate static assets', () => {
    assert.strictEqual(isStaticAssetPath('/favicon.ico'), true);
    assert.strictEqual(isStaticAssetPath('/logo.svg'), true);
    assert.strictEqual(isStaticAssetPath('/images/avatar.png'), true);
    assert.strictEqual(isStaticAssetPath('/styles/global.css'), true);
    assert.strictEqual(isStaticAssetPath('/bundle.js'), true);
  });

  it('should NOT bypass protected application routes that contain dots in parameters or query names', () => {
    assert.strictEqual(isStaticAssetPath('/clientes/test.page'), false);
    assert.strictEqual(isStaticAssetPath('/clientes/maria.silva'), false);
    assert.strictEqual(isStaticAssetPath('/atendimentos/protocolo.2026'), false);
    assert.strictEqual(isStaticAssetPath('/contratos/v1.2'), false);
  });
});
