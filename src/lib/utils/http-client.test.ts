import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import {
  fetchWithTimeout,
  fetchJsonWithTimeout,
  HttpTimeoutError,
} from './http-client.ts';

describe('Item 12: Timeout em APIs Externas, Retries & Mensagens Claras', () => {
  it('should complete successfully when server responds within timeout', async () => {
    const server = http.createServer((_, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', data: 123 }));
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const url = `http://127.0.0.1:${port}/test`;

    try {
      const data = await fetchJsonWithTimeout(url, { timeoutMs: 1500 });
      assert.deepStrictEqual(data, { status: 'ok', data: 123 });
    } finally {
      server.close();
    }
  });

  it('should abort and throw HttpTimeoutError with clear message in Portuguese when service hangs', async () => {
    // Hanging server that never replies
    const server = http.createServer(() => {
      // Intentionally do nothing
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const url = `http://127.0.0.1:${port}/hang`;

    const start = performance.now();
    try {
      await fetchWithTimeout(url, { timeoutMs: 80, retries: 0 });
      assert.fail('Should have timed out');
    } catch (err: any) {
      const duration = performance.now() - start;
      assert.ok(err instanceof HttpTimeoutError);
      assert.ok(err.isTimeout === true);
      assert.ok(err.message.includes('excedeu o tempo limite de 0.1 segundos'));
      assert.ok(duration >= 70 && duration < 350, `Expected duration in 70-350ms, got ${duration}ms`);
    } finally {
      server.close();
    }
  });

  it('should automatically retry transient 503 errors for GET requests with backoff', async () => {
    let attempts = 0;
    const server = http.createServer((_, res) => {
      attempts++;
      if (attempts < 3) {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Temporarily Unavailable');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ recovered: true }));
      }
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const url = `http://127.0.0.1:${port}/flaky`;

    try {
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        retries: 2,
        retryDelayMs: 20,
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(attempts, 3);
      const json = await res.json();
      assert.strictEqual(json.recovered, true);
    } finally {
      server.close();
    }
  });

  it('should NOT retry non-idempotent POST requests by default to avoid duplicate state mutations', async () => {
    let attempts = 0;
    const server = http.createServer((_, res) => {
      attempts++;
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const url = `http://127.0.0.1:${port}/post`;

    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({ transfer: 100 }),
      });
      assert.strictEqual(res.status, 500);
      assert.strictEqual(attempts, 1, 'POST must not retry by default');
    } finally {
      server.close();
    }
  });

  it('should retry POST requests when forceRetry: true is explicitly requested', async () => {
    let attempts = 0;
    const server = http.createServer((_, res) => {
      attempts++;
      if (attempts === 1) {
        res.writeHead(502);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ forceRetrySuccess: true }));
      }
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const url = `http://127.0.0.1:${port}/safe-post`;

    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        forceRetry: true,
        retries: 1,
        retryDelayMs: 15,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(attempts, 2);
    } finally {
      server.close();
    }
  });
});
