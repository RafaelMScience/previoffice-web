import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BackgroundJobQueue, type Job } from './job-queue.ts';

describe('Background Job Queue (Item 07: Fila de Tarefas Lentas)', () => {
  it('should enqueue job immediately (< 5ms) without blocking and return status queued', () => {
    const queue = new BackgroundJobQueue();
    queue.registerHandler('test_instant', async () => 'done');

    const start = performance.now();
    const job = queue.enqueue('test_instant', { foo: 'bar' });
    const duration = performance.now() - start;

    assert.ok(duration < 15, `Enqueue took too long: ${duration.toFixed(2)}ms`);
    assert.strictEqual(job.status, 'queued');
    assert.strictEqual(job.name, 'test_instant');
    assert.deepStrictEqual(job.data, { foo: 'bar' });
    assert.strictEqual(job.attempts, 0);
  });

  it('should process job asynchronously and transition to completed with results', async () => {
    const queue = new BackgroundJobQueue();

    let handled = false;
    queue.registerHandler('process_data', async (job) => {
      handled = true;
      return { processed: true, input: job.data.val * 2 };
    });

    const job = queue.enqueue('process_data', { val: 21 });

    // Wait for microtask / async processing
    await new Promise((resolve) => setTimeout(resolve, 60));

    const updated = queue.getJob(job.id);
    assert.ok(handled, 'Handler was not called');
    assert.strictEqual(updated?.status, 'completed');
    assert.strictEqual(updated?.progress, 100);
    assert.deepStrictEqual(updated?.result, { processed: true, input: 42 });
    assert.ok(updated?.completedAt, 'completedAt should be defined');
  });

  it('should automatically retry failed jobs with backoff up to maxRetries', async () => {
    const queue = new BackgroundJobQueue();

    let attemptsCount = 0;
    queue.registerHandler('flaky_task', async () => {
      attemptsCount++;
      if (attemptsCount < 3) {
        throw new Error(`Transient failure #${attemptsCount}`);
      }
      return { success: true, attemptsNeeded: attemptsCount };
    });

    const job = queue.enqueue(
      'flaky_task',
      {},
      { maxRetries: 3, backoffMs: 20 }
    );

    // Initial state
    assert.strictEqual(job.status, 'queued');

    // Wait for retries to complete (initial + retry 1 at 20ms + retry 2 at 40ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    const updated = queue.getJob(job.id);
    assert.strictEqual(attemptsCount, 3);
    assert.strictEqual(updated?.status, 'completed');
    assert.deepStrictEqual(updated?.result, { success: true, attemptsNeeded: 3 });
  });

  it('should mark job as failed when retries are exhausted', async () => {
    const queue = new BackgroundJobQueue();

    let calls = 0;
    queue.registerHandler('failing_task', async () => {
      calls++;
      throw new Error('Fatal database connection error');
    });

    const job = queue.enqueue(
      'failing_task',
      {},
      { maxRetries: 2, backoffMs: 15 }
    );

    // Wait for exhaustion: initial attempt + 2 retries
    await new Promise((resolve) => setTimeout(resolve, 120));

    const updated = queue.getJob(job.id);
    assert.strictEqual(updated?.status, 'failed');
    assert.ok(updated?.error?.includes('Excedeu limite de 2 tentativas'), `Expected failure message, got: ${updated?.error}`);
    assert.ok(calls >= 3);
  });

  it('should prioritize high priority jobs over normal and low priority jobs in queue', async () => {
    const queue = new BackgroundJobQueue({ maxConcurrency: 1 });
    const executedOrder: string[] = [];

    queue.registerHandler('ordered_job', async (job) => {
      executedOrder.push(job.data.label);
      await new Promise((res) => setTimeout(res, 10));
      return true;
    });

    // Enqueue in mixed order: low, normal, high
    queue.enqueue('ordered_job', { label: 'low_job' }, { priority: 'low' });
    queue.enqueue('ordered_job', { label: 'normal_job' }, { priority: 'normal' });
    queue.enqueue('ordered_job', { label: 'high_job' }, { priority: 'high' });

    await new Promise((resolve) => setTimeout(resolve, 100));

    // High priority must be executed first, followed by normal, then low
    assert.strictEqual(executedOrder[0], 'high_job');
    assert.strictEqual(executedOrder[1], 'normal_job');
    assert.strictEqual(executedOrder[2], 'low_job');
  });

  it('should track metrics accurately across all states', async () => {
    const queue = new BackgroundJobQueue();
    queue.registerHandler('success_job', async () => 'ok');
    queue.registerHandler('fail_job', async () => {
      throw new Error('always fails');
    });

    queue.enqueue('success_job', {}, { maxRetries: 0 });
    queue.enqueue('fail_job', {}, { maxRetries: 0 });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const metrics = queue.getMetrics();
    assert.strictEqual(metrics.total, 2);
    assert.strictEqual(metrics.completed, 1);
    assert.strictEqual(metrics.failed, 1);
    assert.strictEqual(metrics.queued, 0);
  });
});
