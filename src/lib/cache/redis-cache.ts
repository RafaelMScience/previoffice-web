/**
 * Redis & Edge Distributed Cache Provider
 * Supports Upstash Redis REST API and standard Redis with seamless In-Memory fallback.
 * Enforces strict multi-tenant key namespacing to prevent cross-tenant cache bleeding.
 */

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  delPrefix(prefix: string): Promise<void>;
}

interface MemoryCacheEntry {
  val: any;
  expiresAt: number;
}

class InMemoryCacheProvider implements CacheProvider {
  private store: Map<string, MemoryCacheEntry> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.val as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      val: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delPrefix(prefix: string): Promise<void> {
    for (const k of Array.from(this.store.keys())) {
      if (k === prefix || k.startsWith(prefix)) {
        this.store.delete(k);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

class UpstashRedisRestProvider implements CacheProvider {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, '');
    this.token = token;
  }

  private async command(...args: (string | number)[]): Promise<any> {
    try {
      const res = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.result;
    } catch {
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const res = await this.command('GET', key);
    if (!res) return null;
    try {
      return typeof res === 'string' ? JSON.parse(res) : res;
    } catch {
      return res as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.command('SETEX', key, ttlSeconds, serialized);
  }

  async del(key: string): Promise<void> {
    await this.command('DEL', key);
  }

  async delPrefix(prefix: string): Promise<void> {
    const keys = await this.command('KEYS', `${prefix}*`);
    if (Array.isArray(keys) && keys.length > 0) {
      await this.command('DEL', ...keys);
    }
  }
}

let activeProvider: CacheProvider | null = null;

export function getCacheProvider(): CacheProvider {
  if (activeProvider) return activeProvider;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    activeProvider = new UpstashRedisRestProvider(upstashUrl, upstashToken);
  } else {
    activeProvider = new InMemoryCacheProvider();
  }

  return activeProvider;
}

export function setCustomCacheProvider(provider: CacheProvider | null): void {
  activeProvider = provider;
}

/**
 * Generates an isolated multi-tenant cache key.
 * Example: `tenant:office_123:contracts:list`
 */
export function buildTenantCacheKey(tenantId: string, domain: string, identifier?: string): string {
  if (!tenantId) {
    throw new Error('Tenant ID é obrigatório para isolamento do cache.');
  }
  return identifier ? `tenant:${tenantId}:${domain}:${identifier}` : `tenant:${tenantId}:${domain}`;
}

/**
 * Queries cache; if missing, executes fetcher, caches result for ttlSeconds, and returns it.
 */
export async function cachedRead<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const provider = getCacheProvider();
  const cached = await provider.get<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const freshData = await fetcher();
  if (freshData !== null && freshData !== undefined) {
    await provider.set(key, freshData, ttlSeconds);
  }
  return freshData;
}

/**
 * Invalidates cache for a tenant domain immediately upon write/mutation.
 */
export async function invalidateTenantCache(tenantId: string, domain: string): Promise<void> {
  const provider = getCacheProvider();
  const prefix = `tenant:${tenantId}:${domain}`;
  await provider.delPrefix(prefix);
}
