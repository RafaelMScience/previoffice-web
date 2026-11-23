/**
 * Debounce & Cancellable Search Utility.
 * 
 * Provides debounce timer management and AbortController cancellation for
 * API searches and autocomplete fields.
 */

/**
 * Standard debounce wrapper that delays execution by `delayMs` and collapses rapid calls.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      lastArgs = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer);
      timer = null;
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  return debounced;
}

export interface CancellableSearchOptions<T> {
  delayMs?: number;
  onSuccess: (data: T, query: string) => void;
  onError?: (error: Error, query: string) => void;
}

/**
 * Creates an autocomplete/search controller that waits 300ms without typing
 * before calling the async search function and automatically cancels (aborts)
 * any previous pending HTTP request when a new search starts.
 */
export function createCancellableSearch<T>(
  searchFn: (query: string, signal: AbortSignal) => Promise<T>,
  options: CancellableSearchOptions<T>
): {
  search: (query: string) => void;
  cancel: () => void;
} {
  const { delayMs = 300, onSuccess, onError } = options;
  let abortController: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  const search = (query: string) => {
    // 1. Cancel previous timer and abort in-flight HTTP request
    cancel();

    // 2. Schedule new search after delay
    timer = setTimeout(async () => {
      timer = null;
      const controller = new AbortController();
      abortController = controller;

      try {
        const data = await searchFn(query, controller.signal);
        if (!controller.signal.aborted) {
          onSuccess(data, query);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          // Gracefully ignore aborted requests
          return;
        }
        if (onError) {
          onError(err, query);
        }
      } finally {
        if (abortController === controller) {
          abortController = null;
        }
      }
    }, delayMs);
  };

  return { search, cancel };
}
