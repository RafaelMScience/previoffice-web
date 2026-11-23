import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TelemetryTracer, SLOW_REQUEST_THRESHOLD_MS } from './tracer.ts';

describe('Item 18: Rastreamento de Requisições com OpenTelemetry & Alerta de Lenteza (> 1s)', () => {
  let tracer: TelemetryTracer;

  beforeEach(() => {
    tracer = new TelemetryTracer();
    tracer.clear();
  });

  it('tracks span lifecycle with steps and duration', async () => {
    const span = tracer.startSpan('GET /api/clients', { tenantId: 'tenant-123' });

    await tracer.traceStep(span, 'auth:verify_session', async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    await tracer.traceStep(span, 'db:fetch_clients', async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    const finished = tracer.finishSpan(span);

    assert.equal(finished.name, 'GET /api/clients');
    assert.equal(finished.steps.length, 2);
    assert.equal(finished.steps[0].name, 'auth:verify_session');
    assert.equal(finished.steps[1].name, 'db:fetch_clients');
    assert.ok((finished.durationMs || 0) >= 25, 'Total duration should reflect steps');
    assert.equal(finished.isSlow, false, 'Should not be marked as slow if under 1000ms');
  });

  it('flags requests exceeding 1000ms as slow (isSlow: true)', () => {
    const span = tracer.startSpan('POST /api/documents/upload');

    // Simulate duration > 1000ms
    span.startTime = performance.now() - 1050;

    const finished = tracer.finishSpan(span);

    assert.equal(finished.isSlow, true, 'Must flag span as slow when duration exceeds 1000ms');
    assert.equal(finished.attributes['telemetry.slow_request'], true);
    assert.equal(finished.attributes['telemetry.slow_threshold_ms'], SLOW_REQUEST_THRESHOLD_MS);

    const slowSpans = tracer.getSlowSpans();
    assert.equal(slowSpans.length, 1);
    assert.equal(slowSpans[0].spanId, span.spanId);
  });

  it('generates compliant W3C Server-Timing header for browser DevTools', () => {
    const span = tracer.startSpan('GET /api/dashboard');
    span.steps.push({ name: 'db_query', durationMs: 120 });
    span.steps.push({ name: 'cache_check', durationMs: 5 });

    const finished = tracer.finishSpan(span);
    const header = tracer.buildServerTimingHeader(finished);

    assert.ok(header.includes('total;dur='), 'Must include total duration');
    assert.ok(header.includes('db_query;dur=120'), 'Must include db_query step');
    assert.ok(header.includes('cache_check;dur=5'), 'Must include cache_check step');
  });

  it('handles error status and captures exception message in span', () => {
    const span = tracer.startSpan('GET /api/failing_endpoint');
    const err = new Error('Database connection failed');

    const finished = tracer.finishSpan(span, err);

    assert.equal(finished.status, 'ERROR');
    assert.equal(finished.error, 'Database connection failed');
  });
});
