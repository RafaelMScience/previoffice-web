import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  cachedRead,
  invalidateTenantCache,
  buildTenantCacheKey,
  setCustomCacheProvider,
} from './redis-cache.ts';

describe('Item 10: Cache Redis dos Dados Mais Consultados & Invalidação', () => {
  beforeEach(() => {
    // Reset provider to fresh in-memory instance
    setCustomCacheProvider(null);
  });

  it('should cache result on first call and serve from cache on second call', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { contractsCount: 42, timestamp: Date.now() };
    };

    const key = buildTenantCacheKey('tenant_alpha', 'contracts', 'kpis');

    // 1st call: fetcher executed
    const firstRes = await cachedRead(key, fetcher, 30);
    assert.strictEqual(fetchCount, 1);
    assert.strictEqual(firstRes.contractsCount, 42);

    // 2nd call: served instantly from cache
    const secondRes = await cachedRead(key, fetcher, 30);
    assert.strictEqual(fetchCount, 1, 'Fetcher must NOT be called on cache hit');
    assert.strictEqual(secondRes.contractsCount, 42);
    assert.strictEqual(secondRes.timestamp, firstRes.timestamp);
  });

  it('should invalidate cache when data changes and fetch fresh data on next read', async () => {
    let mockState = 'Minuta Original v1';
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { content: mockState };
    };

    const key = buildTenantCacheKey('tenant_beta', 'templates', 'doc_01');

    // 1st read
    const res1 = await cachedRead(key, fetcher, 60);
    assert.strictEqual(res1.content, 'Minuta Original v1');
    assert.strictEqual(fetchCount, 1);

    // Mutation occurs: update template and invalidate tenant templates cache
    mockState = 'Minuta Atualizada v2';
    await invalidateTenantCache('tenant_beta', 'templates');

    // 2nd read: must re-fetch immediately
    const res2 = await cachedRead(key, fetcher, 60);
    assert.strictEqual(fetchCount, 2, 'Fetcher should be invoked after cache invalidation');
    assert.strictEqual(res2.content, 'Minuta Atualizada v2');
  });

  it('should enforce strict multi-tenant isolation and prevent cache leaks between offices', async () => {
    const tenant1Key = buildTenantCacheKey('office_01', 'clients', 'list');
    const tenant2Key = buildTenantCacheKey('office_02', 'clients', 'list');

    await cachedRead(tenant1Key, async () => ({ client: 'Cliente do Escritório 1' }), 60);
    await cachedRead(tenant2Key, async () => ({ client: 'Cliente do Escritório 2' }), 60);

    const data1 = await cachedRead(tenant1Key, async () => ({ client: 'unexpected' }), 60);
    const data2 = await cachedRead(tenant2Key, async () => ({ client: 'unexpected' }), 60);

    assert.strictEqual(data1.client, 'Cliente do Escritório 1');
    assert.strictEqual(data2.client, 'Cliente do Escritório 2');
    assert.notStrictEqual(data1.client, data2.client);
  });

  it('should throw error if tenantId is missing to protect multi-tenant boundaries', () => {
    assert.throws(
      () => buildTenantCacheKey('', 'contracts'),
      /Tenant ID é obrigatório/
    );
  });
});
