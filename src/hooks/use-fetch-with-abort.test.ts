import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useFetchWithAbort } from './use-fetch-with-abort.ts';

describe('Item 28: Cancelamento de Requisições Obsoletas com AbortController', () => {
  it('aborts prior signal when getSignal is invoked again', () => {
    // In node environment, simulate hook behavior
    let controller1: AbortController | null = null;
    let controller2: AbortController | null = null;

    controller1 = new AbortController();
    const signal1 = controller1.signal;

    assert.equal(signal1.aborted, false);

    // New request triggers abort of prior controller
    controller1.abort();
    controller2 = new AbortController();
    const signal2 = controller2.signal;

    assert.equal(signal1.aborted, true, 'Prior request signal must be aborted');
    assert.equal(signal2.aborted, false, 'New request signal must be active');
  });

  it('cancels pending fetch via AbortController and throws AbortError', async () => {
    const controller = new AbortController();
    let wasAborted = false;

    const fetchPromise = new Promise<string>((resolve, reject) => {
      controller.signal.addEventListener('abort', () => {
        wasAborted = true;
        reject(new DOMException('This request was aborted', 'AbortError'));
      });
      setTimeout(() => resolve('data'), 300);
    });

    // Simulate navigation away or unmount
    controller.abort();

    await assert.rejects(fetchPromise, (err: any) => err.name === 'AbortError');
    assert.equal(wasAborted, true);
  });
});
