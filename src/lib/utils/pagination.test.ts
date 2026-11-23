import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePagination,
  buildPaginationMeta,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from './pagination.ts';

describe('Pagination Utility (sanitizePagination & buildPaginationMeta)', () => {
  it('should use default page and limit when input is empty or invalid', () => {
    const params = sanitizePagination(null, null);

    assert.equal(params.page, 1);
    assert.equal(params.limit, DEFAULT_PAGE_LIMIT);
    assert.equal(params.offset, 0);
    assert.equal(params.from, 0);
    assert.equal(params.to, DEFAULT_PAGE_LIMIT - 1);
  });

  it('should enforce positive integers and clamp negative or zero page to 1', () => {
    const params = sanitizePagination('-5', '0');

    assert.equal(params.page, 1);
    assert.equal(params.limit, 1, 'Limit must be clamped to minimum 1');
    assert.equal(params.from, 0);
    assert.equal(params.to, 0);
  });

  it('should clamp excessive limits to MAX_PAGE_LIMIT (100) to protect database', () => {
    const params = sanitizePagination(1, 5000);

    assert.equal(params.limit, MAX_PAGE_LIMIT);
    assert.equal(params.from, 0);
    assert.equal(params.to, 99);
  });

  it('should calculate correct SQL range boundaries for subsequent pages', () => {
    // Page 3 with limit 25 -> items 50 to 74
    const page3 = sanitizePagination(3, 25);

    assert.equal(page3.page, 3);
    assert.equal(page3.limit, 25);
    assert.equal(page3.offset, 50);
    assert.equal(page3.from, 50);
    assert.equal(page3.to, 74);
  });

  it('should build accurate pagination metadata with hasMore indicator', () => {
    // 55 items with limit 20 -> 3 pages
    const page1Meta = buildPaginationMeta(55, 1, 20);
    assert.equal(page1Meta.total, 55);
    assert.equal(page1Meta.totalPages, 3);
    assert.equal(page1Meta.hasMore, true);

    const page3Meta = buildPaginationMeta(55, 3, 20);
    assert.equal(page3Meta.page, 3);
    assert.equal(page3Meta.hasMore, false, 'Last page hasMore must be false');
  });

  it('should handle zero total records gracefully', () => {
    const zeroMeta = buildPaginationMeta(0, 1, 20);
    assert.equal(zeroMeta.total, 0);
    assert.equal(zeroMeta.totalPages, 1);
    assert.equal(zeroMeta.hasMore, false);
  });
});
