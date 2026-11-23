import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyVitalMetric,
  calculatePercentile,
  evaluateVitalsAlert,
  isValidMetricName,
  WebVitalsStore,
  CORE_WEB_VITALS_THRESHOLDS,
} from './vitals.ts';

describe('Item 31: Monitoramento do Core Web Vitals no Mundo Real (RUM & Alertas)', () => {
  let store: WebVitalsStore;

  beforeEach(() => {
    store = new WebVitalsStore();
  });

  it('correctly classifies LCP (Largest Contentful Paint) metrics into good, needs-improvement, and poor', () => {
    // LCP: Good <= 2500ms, Needs Improvement <= 4000ms, Poor > 4000ms
    assert.equal(classifyVitalMetric('LCP', 1200), 'good');
    assert.equal(classifyVitalMetric('LCP', 2500), 'good');
    assert.equal(classifyVitalMetric('LCP', 2800), 'needs-improvement');
    assert.equal(classifyVitalMetric('LCP', 4000), 'needs-improvement');
    assert.equal(classifyVitalMetric('LCP', 4200), 'poor');
  });

  it('correctly classifies INP (Interaction to Next Paint) metrics', () => {
    // INP: Good <= 200ms, Needs Improvement <= 500ms, Poor > 500ms
    assert.equal(classifyVitalMetric('INP', 80), 'good');
    assert.equal(classifyVitalMetric('INP', 200), 'good');
    assert.equal(classifyVitalMetric('INP', 350), 'needs-improvement');
    assert.equal(classifyVitalMetric('INP', 550), 'poor');
  });

  it('correctly classifies CLS (Cumulative Layout Shift) metrics', () => {
    // CLS: Good <= 0.1, Needs Improvement <= 0.25, Poor > 0.25
    assert.equal(classifyVitalMetric('CLS', 0.02), 'good');
    assert.equal(classifyVitalMetric('CLS', 0.1), 'good');
    assert.equal(classifyVitalMetric('CLS', 0.18), 'needs-improvement');
    assert.equal(classifyVitalMetric('CLS', 0.32), 'poor');
  });

  it('calculates the 75th percentile (p75) accurately across multiple observations', () => {
    // Array of 10 values
    const latencies = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const p75 = calculatePercentile(latencies, 75);
    // Index 8 of 10 is 800
    assert.equal(p75, 800);

    // Empty list fallback
    assert.equal(calculatePercentile([], 75), 0);
  });

  it('evaluates alerts when p75 leaves the "good" threshold band', () => {
    // Good samples for LCP (all <= 2500ms)
    const healthyLcpSamples = [1100, 1400, 1800, 2100, 2200];
    const healthySummary = evaluateVitalsAlert('LCP', healthyLcpSamples);
    assert.equal(healthySummary.alertTriggered, false);
    assert.equal(healthySummary.rating, 'good');

    // Degraded samples where p75 exceeds 2500ms
    const degradedLcpSamples = [1500, 2000, 2400, 3100, 3500];
    const degradedSummary = evaluateVitalsAlert('LCP', degradedLcpSamples);
    assert.equal(degradedSummary.alertTriggered, true);
    assert.equal(degradedSummary.rating, 'needs-improvement');
    assert.ok(degradedSummary.message.includes('ALERTA AMARELO'));

    // Critical poor samples where p75 exceeds 4000ms
    const criticalLcpSamples = [2000, 3000, 4200, 5000, 6000];
    const criticalSummary = evaluateVitalsAlert('LCP', criticalLcpSamples);
    assert.equal(criticalSummary.alertTriggered, true);
    assert.equal(criticalSummary.rating, 'poor');
    assert.ok(criticalSummary.message.includes('ALERTA VERMELHO CRÍTICO'));
  });

  it('records samples in WebVitalsStore and generates full telemetry report', () => {
    store.record('LCP', 1800);
    store.record('LCP', 2100);
    store.record('INP', 95);
    store.record('CLS', 0.04);

    const lcpSummary = store.getSummary('LCP');
    assert.equal(lcpSummary.count, 2);
    assert.equal(lcpSummary.rating, 'good');

    const all = store.getAllSummaries();
    assert.ok('LCP' in all);
    assert.ok('INP' in all);
    assert.ok('CLS' in all);
    assert.equal(all.INP.rating, 'good');
    assert.equal(all.CLS.rating, 'good');
  });

  it('rejects invalid, NaN, Infinity, and negative values from corrupting metrics store', () => {
    store.record('LCP', NaN);
    store.record('LCP', Infinity);
    store.record('LCP', -500);
    // @ts-expect-error test unknown metric injection
    store.record('MALICIOUS_KEY', 100);

    const summary = store.getSummary('LCP');
    assert.equal(summary.count, 0);
    assert.equal(summary.alertTriggered, false);
  });

  it('validates supported Core Web Vitals metric names correctly', () => {
    assert.equal(isValidMetricName('LCP'), true);
    assert.equal(isValidMetricName('INP'), true);
    assert.equal(isValidMetricName('CLS'), true);
    assert.equal(isValidMetricName('FCP'), true);
    assert.equal(isValidMetricName('TTFB'), true);
    assert.equal(isValidMetricName('FID'), true);
    assert.equal(isValidMetricName('Next.js-hydration'), false);
    assert.equal(isValidMetricName('random_string'), false);
    assert.equal(isValidMetricName(null), false);
    assert.equal(isValidMetricName(undefined), false);
  });

  it('correctly classifies TTFB, FCP, and FID thresholds', () => {
    // TTFB: good <= 800, needs-improvement <= 1800, poor > 1800
    assert.equal(classifyVitalMetric('TTFB', 350), 'good');
    assert.equal(classifyVitalMetric('TTFB', 1200), 'needs-improvement');
    assert.equal(classifyVitalMetric('TTFB', 2200), 'poor');

    // FCP: good <= 1800, needs-improvement <= 3000, poor > 3000
    assert.equal(classifyVitalMetric('FCP', 1100), 'good');
    assert.equal(classifyVitalMetric('FCP', 2200), 'needs-improvement');
    assert.equal(classifyVitalMetric('FCP', 3600), 'poor');

    // FID: good <= 100, needs-improvement <= 300, poor > 300
    assert.equal(classifyVitalMetric('FID', 50), 'good');
    assert.equal(classifyVitalMetric('FID', 150), 'needs-improvement');
    assert.equal(classifyVitalMetric('FID', 400), 'poor');
  });

  it('enforces ring buffer eviction capped at maxSamplesPerMetric (200)', () => {
    for (let i = 1; i <= 250; i++) {
      store.record('LCP', i * 10);
    }
    const summary = store.getSummary('LCP');
    assert.equal(summary.count, 200);
    // Values 1..50 should have been evicted; p75 of 510..2500 is calculated correctly
    assert.ok(summary.p75 >= 2000);
  });
});
