/**
 * Standard API & Database Pagination Utility.
 * 
 * Enforces safe default and maximum page limits across API endpoints and Supabase queries
 * to prevent unbounded database memory allocation and excessive payload sizes.
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  from: number;
  to: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/**
 * Parses and sanitizes page and limit parameters, guaranteeing safe range boundaries.
 * 
 * @param rawPage Raw page number string or number (defaults to 1)
 * @param rawLimit Raw limit number string or number (defaults to defaultLimit)
 * @param defaultLimit Default limit if unspecified (defaults to 20)
 * @param maxLimit Maximum allowable limit (defaults to 100)
 */
export function sanitizePagination(
  rawPage?: string | number | null,
  rawLimit?: string | number | null,
  defaultLimit: number = DEFAULT_PAGE_LIMIT,
  maxLimit: number = MAX_PAGE_LIMIT
): PaginationParams {
  const parsedPage =
    typeof rawPage === 'number'
      ? (Number.isFinite(rawPage) ? Math.trunc(rawPage) : 1)
      : parseInt(String(rawPage || '1'), 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const parsedLimit =
    typeof rawLimit === 'number'
      ? (Number.isFinite(rawLimit) ? Math.trunc(rawLimit) : defaultLimit)
      : parseInt(String(rawLimit || defaultLimit), 10);
  const fallbackLimit = isNaN(parsedLimit) ? defaultLimit : parsedLimit;
  const limit = Math.min(Math.max(1, fallbackLimit), maxLimit);

  const offset = (page - 1) * limit;
  const from = offset;
  const to = offset + limit - 1;

  return {
    page,
    limit,
    offset,
    from,
    to,
  };
}

/**
 * Builds structured pagination metadata for API responses.
 */
export function buildPaginationMeta(
  totalCount: number,
  page: number,
  limit: number
) {
  const total = Number.isFinite(totalCount) ? Math.max(0, totalCount) : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasMore = page < totalPages;

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore,
  };
}
