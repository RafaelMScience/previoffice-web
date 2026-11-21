import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyDatabaseLatency, benchmarkDatabaseQuery } from './latency-benchmark.ts';

describe('Item 19: Aproxime o Servidor do Banco de Dados (Latency Benchmark & Regions)', () => {
  it('correctly classifies ultra-low latency (< 25ms) as same region co-location', () => {
    const report = classifyDatabaseLatency(4.2);
    assert.equal(report.status, 'EXCELLENT_SAME_REGION');
    assert.ok(report.message.includes('Excelente'));
  });

  it('correctly identifies cross-region latency mismatch (> 80ms) and recommends alignment', () => {
    const report = classifyDatabaseLatency(142.5);
    assert.equal(report.status, 'CROSS_REGION_MISMATCH');
    assert.ok(report.message.includes('Alerta de Latência'));
    assert.ok(report.recommendation.includes('gru1'));
  });

  it('benchmarks async queries and computes accurate duration', async () => {
    const fakeQuery = async () => {
      await new Promise((r) => setTimeout(r, 15));
      return [{ id: 1 }];
    };

    const report = await benchmarkDatabaseQuery(fakeQuery);
    assert.ok(report.durationMs >= 14, `Duration should be ~15ms, got ${report.durationMs}`);
    assert.equal(report.status, 'EXCELLENT_SAME_REGION');
  });
});
