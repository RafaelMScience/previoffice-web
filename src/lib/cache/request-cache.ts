/**
 * Client-side in-flight request deduplication and short-lived caching utility.
 * 
 * Prevents identical concurrent or rapid-fire network requests (e.g., on route changes,
 * tab switches, or multiple components mounting simultaneously) from hitting Supabase or APIs
 * multiple times.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export interface DedupeOptions {
  /** Time to live in milliseconds. Defaults to 5000ms (5 seconds). */
  ttlMs?: number;
  /** Force bypass of cache and trigger fresh fetcher call. */
  force?: boolean;
}

interface InFlightRecord<T> {
  promise: Promise<T>;
  id: symbol;
}

const inFlightMap = new Map<string, InFlightRecord<any>>();
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Deduplicates concurrent calls to the same key and returns cached results if within TTL.
 * 
 * @param key Unique identifier for the request (e.g., 'clients:count:tenant1')
 * @param fetcher Async function that performs the actual network request
 * @param options DedupeOptions (ttlMs, force)
 */
export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: DedupeOptions = {}
): Promise<T> {
  const { ttlMs = 5000, force = false } = options;

  // 1. Check existing fresh cache if not forced
  if (!force) {
    const cached = cacheStore.get(key);
    if (cached) {
      const isFresh = Date.now() - cached.timestamp < cached.ttlMs;
      if (isFresh) {
        return cached.data as T;
      }
      cacheStore.delete(key);
    }
  }

  // 2. Check if identical request is already in-flight
  const existing = inFlightMap.get(key);
  if (existing) {
    return existing.promise as Promise<T>;
  }

  const requestId = Symbol(key);

  // 3. Initiate request, store promise in inFlightMap
  const promise = (async () => {
    try {
      const data = await fetcher();
      // Only cache if this in-flight request was not invalidated while fetch was in progress
      if (ttlMs > 0 && inFlightMap.get(key)?.id === requestId) {
        // Auto-prune stale entries if store grows past 100 items
        if (cacheStore.size > 100) {
          const now = Date.now();
          for (const [k, v] of cacheStore.entries()) {
            if (now - v.timestamp >= v.ttlMs) {
              cacheStore.delete(k);
            }
          }
        }

        cacheStore.set(key, {
          data,
          timestamp: Date.now(),
          ttlMs,
        });
      }
      return data;
    } finally {
      if (inFlightMap.get(key)?.id === requestId) {
        inFlightMap.delete(key);
      }
    }
  })();

  inFlightMap.set(key, { promise, id: requestId });
  return promise;
}

/**
 * Invalidates cache by exact key, key prefix, or clears entire cache if no key provided.
 */
export function invalidateCache(keyOrPrefix?: string): void {
  if (!keyOrPrefix) {
    cacheStore.clear();
    inFlightMap.clear();
    return;
  }

  for (const key of Array.from(cacheStore.keys())) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      cacheStore.delete(key);
    }
  }

  for (const key of Array.from(inFlightMap.keys())) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      inFlightMap.delete(key);
    }
  }
}

/**
 * Clears all cached items and in-flight tracking (useful for testing or full logout).
 */
export function clearCache(): void {
  cacheStore.clear();
  inFlightMap.clear();
}

/**
 * Inspection utility for monitoring and diagnostics.
 */
export function getCacheStats(): { size: number; inFlight: number; keys: string[] } {
  return {
    size: cacheStore.size,
    inFlight: inFlightMap.size,
    keys: Array.from(cacheStore.keys()),
  };
}
