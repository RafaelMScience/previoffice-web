import { dedupeRequest } from '../cache/request-cache.ts';
import { fetchClientByIdFromDb } from './client-service.ts';
import { fetchContractsFromDb } from './contract-service.ts';

/**
 * Client Data Prefetching Service (Item 29)
 * 
 * Preloads the next screen's data on mouse hover (onMouseEnter) or focus,
 * allowing target pages (like Client Details and Contracts) to load instantaneously (0ms) on click.
 */

export function prefetchClientDetails(clientId: string, tenantId: string): void {
  if (!clientId || !tenantId) return;
  // Fire-and-forget background prefetch into dedupeRequest/cache with 30s TTL
  dedupeRequest(`clients:dossier:${tenantId}:${clientId}`, () => fetchClientByIdFromDb(clientId, tenantId), {
    ttlMs: 30000,
  }).catch(() => {
    // Background prefetch error is non-fatal
  });
}

export function prefetchContracts(tenantId: string): void {
  if (!tenantId) return;
  dedupeRequest(`contracts:list:${tenantId}`, () => fetchContractsFromDb(tenantId), {
    ttlMs: 30000,
  }).catch(() => {
    // Non-fatal
  });
}
