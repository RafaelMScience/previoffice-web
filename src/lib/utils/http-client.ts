/**
 * Resilient HTTP Client with Configurable Timeout, Exponential Backoff Retries,
 * and Clear User-Friendly Error Messages in Portuguese.
 */

export interface HttpClientOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  retryStatusCodes?: number[];
  forceRetry?: boolean;
}

export class HttpTimeoutError extends Error {
  public readonly timeoutMs: number;
  public readonly isTimeout = true;

  constructor(timeoutMs: number, url?: string) {
    const urlContext = url ? ` ao acessar "${url}"` : '';
    super(
      `A solicitação${urlContext} excedeu o tempo limite de ${(timeoutMs / 1000).toFixed(1)} segundos. O serviço pode estar indisponível ou sua conexão lenta.`
    );
    this.name = 'HttpTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class HttpNetworkError extends Error {
  public readonly isNetworkError = true;

  constructor(originalMessage: string, url?: string) {
    const urlContext = url ? ` ao comunicar com "${url}"` : '';
    super(
      `Falha de comunicação com o servidor${urlContext}. Verifique sua conexão e tente novamente. (${originalMessage})`
    );
    this.name = 'HttpNetworkError';
  }
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRY_DELAY_MS = 300;
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Resilient fetch wrapper with timeout and exponential backoff retry.
 */
export async function fetchWithTimeout(
  input: string | URL | Request,
  init?: RequestInit & HttpClientOptions
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryStatusCodes = RETRYABLE_STATUS_CODES,
    forceRetry = false,
    ...fetchInit
  } = init || {};

  const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = (fetchInit.method || 'GET').toUpperCase();
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(method);
  const maxRetries = retries !== undefined ? retries : isIdempotent || forceRetry ? 2 : 0;

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    let timeoutTriggered = false;

    // Chain external signal if provided
    let externalAbortCleanup: (() => void) | null = null;
    if (fetchInit.signal) {
      if (fetchInit.signal.aborted) {
        controller.abort(fetchInit.signal.reason);
      } else {
        const onAbort = () => controller.abort(fetchInit.signal?.reason);
        fetchInit.signal.addEventListener('abort', onAbort, { once: true });
        externalAbortCleanup = () => fetchInit.signal?.removeEventListener('abort', onAbort);
      }
    }

    const timer = setTimeout(() => {
      timeoutTriggered = true;
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(input, {
        ...fetchInit,
        signal: controller.signal,
      });

      clearTimeout(timer);
      if (externalAbortCleanup) externalAbortCleanup();

      if (
        attempt < maxRetries &&
        retryStatusCodes.includes(response.status) &&
        (isIdempotent || forceRetry)
      ) {
        attempt++;
        const backoff = retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, backoff));
        continue;
      }

      return response;
    } catch (err: any) {
      clearTimeout(timer);
      if (externalAbortCleanup) externalAbortCleanup();

      if (timeoutTriggered || err.name === 'TimeoutError') {
        lastError = new HttpTimeoutError(timeoutMs, urlString);
      } else if (err.name === 'AbortError') {
        // User aborted
        throw err;
      } else {
        lastError = new HttpNetworkError(err?.message || 'Falha de rede', urlString);
      }

      if (attempt < maxRetries && (isIdempotent || forceRetry)) {
        attempt++;
        const backoff = retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, backoff));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

/**
 * Convenient JSON fetch helper with timeout and error extraction.
 */
export async function fetchJsonWithTimeout<T = any>(
  url: string,
  options?: RequestInit & HttpClientOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.error || errorJson.message || `Erro no servidor (código ${response.status})`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}
