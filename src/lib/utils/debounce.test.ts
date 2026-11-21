import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { debounce, createCancellableSearch } from './debounce.ts';

describe('Debounce Utility (debounce)', () => {
  it('should wait 300ms and execute only once after rapid invocations', async () => {
    let callCount = 0;
    let lastQuery = '';

    const debouncedFn = debounce((query: string) => {
      callCount++;
      lastQuery = query;
    }, 50);

    // Simulate typing "ALEXANDRE" letter by letter rapidly
    const word = 'ALEXANDRE';
    for (let i = 1; i <= word.length; i++) {
      debouncedFn(word.slice(0, i));
    }

    assert.equal(callCount, 0, 'Must not execute synchronously while user is typing');

    // Wait for debounce timer to fire
    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(callCount, 1, 'Must execute exactly once at the end');
    assert.equal(lastQuery, 'ALEXANDRE', 'Must receive final accumulated search term');
  });

  it('should allow manual cancellation before execution', async () => {
    let called = false;
    const debouncedFn = debounce(() => {
      called = true;
    }, 50);

    debouncedFn();
    debouncedFn.cancel();

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(called, false, 'Cancelled debounce must never execute');
  });

  it('should flush pending call immediately when requested', () => {
    let executedValue = '';
    const debouncedFn = debounce((val: string) => {
      executedValue = val;
    }, 500);

    debouncedFn('instant');
    debouncedFn.flush();

    assert.equal(executedValue, 'instant');
  });
});

describe('Cancellable Search & Autocomplete Controller', () => {
  it('should abort in-flight search request when a new keystroke occurs', async () => {
    const executedQueries: string[] = [];
    const abortedQueries: string[] = [];
    const successfulResults: string[] = [];

    const mockSearchApi = async (query: string, signal: AbortSignal) => {
      executedQueries.push(query);
      return new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve(`results for ${query}`);
        }, 60);

        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          abortedQueries.push(query);
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    };

    const controller = createCancellableSearch(mockSearchApi, {
      delayMs: 30,
      onSuccess: (data) => {
        successfulResults.push(data);
      },
    });

    // 1. User types "Silva"
    controller.search('Silva');
    // Wait enough for search timer to trigger searchApi (30ms), so request is in-flight
    await new Promise((resolve) => setTimeout(resolve, 40));

    // 2. User quickly adds " Sauro" -> cancels previous in-flight request for "Silva"
    controller.search('Silva Sauro');

    // Wait for second request to finish (30ms debounce + 60ms fetch)
    await new Promise((resolve) => setTimeout(resolve, 120));

    assert.equal(abortedQueries.includes('Silva'), true, 'Previous in-flight query must be aborted');
    assert.deepEqual(successfulResults, ['results for Silva Sauro'], 'Only the final search query produces results');
  });
});
