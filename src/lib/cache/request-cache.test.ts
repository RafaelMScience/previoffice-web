import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  dedupeRequest,
  invalidateCache,
  clearCache,
  getCacheStats,
} from './request-cache.ts';

describe('Request Deduplication & Cache Utility (dedupeRequest)', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should deduplicate concurrent in-flight requests to a single execution', async () => {
    let callCount = 0;
    const slowFetcher = async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { result: 'data-123' };
    };

    // Trigger 3 concurrent calls
    const [res1, res2, res3] = await Promise.all([
      dedupeRequest('test:concurrent', slowFetcher),
      dedupeRequest('test:concurrent', slowFetcher),
      dedupeRequest('test:concurrent', slowFetcher),
    ]);

    assert.equal(callCount, 1, 'Fetcher must be executed exactly once for concurrent identical calls');
    assert.deepEqual(res1, { result: 'data-123' });
    assert.deepEqual(res2, { result: 'data-123' });
    assert.deepEqual(res3, { result: 'data-123' });
  });

  it('should return cached data on sequential calls within TTL without calling fetcher again', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { count: callCount };
    };

    const first = await dedupeRequest('test:sequential', fetcher, { ttlMs: 1000 });
    const second = await dedupeRequest('test:sequential', fetcher, { ttlMs: 1000 });

    assert.equal(callCount, 1);
    assert.equal(first.count, 1);
    assert.equal(second.count, 1);
  });

  it('should re-fetch when TTL expires', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { count: callCount };
    };

    const first = await dedupeRequest('test:ttl', fetcher, { ttlMs: 30 });
    assert.equal(first.count, 1);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 45));

    const second = await dedupeRequest('test:ttl', fetcher, { ttlMs: 30 });
    assert.equal(second.count, 2, 'Should execute fetcher again after TTL expiration');
  });

  it('should bypass cache when force: true is specified', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { count: callCount };
    };

    await dedupeRequest('test:force', fetcher, { ttlMs: 10000 });
    assert.equal(callCount, 1);

    const forced = await dedupeRequest('test:force', fetcher, { force: true, ttlMs: 10000 });
    assert.equal(callCount, 2);
    assert.equal(forced.count, 2);
  });

  it('should invalidate cache entries by key or prefix', async () => {
    let countA = 0;
    let countB = 0;

    await dedupeRequest('clients:list:t1', async () => ++countA, { ttlMs: 10000 });
    await dedupeRequest('attendances:list:t1', async () => ++countB, { ttlMs: 10000 });

    const statsBefore = getCacheStats();
    assert.equal(statsBefore.size, 2);

    // Invalidate prefix 'clients:'
    invalidateCache('clients:');

    const statsAfter = getCacheStats();
    assert.equal(statsAfter.size, 1);
    assert.equal(statsAfter.keys.includes('attendances:list:t1'), true);

    // Calling clients again should re-trigger fetcher
    await dedupeRequest('clients:list:t1', async () => ++countA, { ttlMs: 10000 });
    assert.equal(countA, 2);

    // Calling attendances should still be cached
    await dedupeRequest('attendances:list:t1', async () => ++countB, { ttlMs: 10000 });
    assert.equal(countB, 1);
  });

  it('should clean up in-flight promise and not cache when fetcher fails', async () => {
    let attempts = 0;
    const failingFetcher = async () => {
      attempts++;
      throw new Error('Network failure');
    };

    await assert.rejects(async () => {
      await dedupeRequest('test:failure', failingFetcher);
    }, /Network failure/);

    const stats = getCacheStats();
    assert.equal(stats.inFlight, 0, 'In-flight map must be cleaned up on error');
    assert.equal(stats.size, 0, 'Failed responses must not be cached');

    // Subsequent call should retry and not be blocked
    let recoveryCalled = false;
    const recoveryFetcher = async () => {
      recoveryCalled = true;
      return 'recovered';
    };

    const res = await dedupeRequest('test:failure', recoveryFetcher);
    assert.equal(recoveryCalled, true);
    assert.equal(res, 'recovered');
  });

  it('should not cache stale data if invalidated while request is still in-flight', async () => {
    let callCount = 0;
    const slowFetcher = async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 60));
      return { client: 'stale-client' };
    };

    // 1. Start slow fetch in-flight
    const inFlightPromise = dedupeRequest('clients:slow', slowFetcher, { ttlMs: 10000 });

    // 2. While in flight, mutation occurs and invalidates cache
    await new Promise((resolve) => setTimeout(resolve, 10));
    invalidateCache('clients:');

    // 3. Wait for slow fetch to finish
    await inFlightPromise;

    // 4. Cache should NOT contain the invalidated slow result
    const stats = getCacheStats();
    assert.equal(stats.keys.includes('clients:slow'), false, 'Stale data must not be written to cache after invalidation');

    // 5. Next call must execute fresh fetcher
    const freshFetcher = async () => {
      callCount++;
      return { client: 'fresh-client' };
    };
    const freshResult = await dedupeRequest('clients:slow', freshFetcher, { ttlMs: 10000 });
    assert.equal(freshResult.client, 'fresh-client');
    assert.equal(callCount, 2);
  });
});
