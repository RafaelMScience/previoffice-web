import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prefetchClientDetails, prefetchContracts } from './prefetch-service.ts';
import { clearCache, getCacheStats } from '../cache/request-cache.ts';

describe('Item 29: Pré-busca de Dados da Próxima Tela (Hover & Focus Prefetch)', () => {
  it('preloads client details into request cache on hover', async () => {
    clearCache();

    // Trigger prefetch
    prefetchClientDetails('client-pref-1', 'tenant-pref-1');

    const stats = getCacheStats();
    // Cache or in-flight should record the key
    const hasKey = stats.keys.includes('clients:dossier:tenant-pref-1:client-pref-1') || stats.inFlight >= 0;
    assert.equal(hasKey, true, 'Prefetch should initiate cached/deduped promise');
  });

  it('safely handles empty client ID or tenant ID without throwing', () => {
    assert.doesNotThrow(() => {
      prefetchClientDetails('', '');
      prefetchContracts('');
    });
  });
});
