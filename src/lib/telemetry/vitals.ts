/**
 * Core Web Vitals Real User Monitoring (RUM) & Alerting System (Item 31)
 *
 * Captures real user performance metrics (LCP, INP, CLS, FCP, TTFB),
 * classifies them according to Google's official Core Web Vitals thresholds,
 * calculates the 75th percentile (p75), and triggers alerts when p75 leaves the "good" band.
 */

export type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
export type VitalsRating = 'good' | 'needs-improvement' | 'poor';

export const VALID_CORE_WEB_VITALS: readonly MetricName[] = [
  'CLS',
  'FCP',
  'FID',
  'INP',
  'LCP',
  'TTFB',
] as const;

export function isValidMetricName(name: unknown): name is MetricName {
  return typeof name === 'string' && VALID_CORE_WEB_VITALS.includes(name as MetricName);
}

export interface MetricPayload {
  id: string;
  name: MetricName;
  value: number;
  rating?: VitalsRating;
  delta?: number;
  navigationType?: string;
  pathname?: string;
  timestamp?: number;
}

export interface ThresholdConfig {
  good: number;
  needsImprovement: number;
}

/**
 * Official Google Core Web Vitals thresholds (75th percentile of page loads)
 */
export const CORE_WEB_VITALS_THRESHOLDS: Record<MetricName, ThresholdConfig> = {
  // Largest Contentful Paint (ms)
  LCP: { good: 2500, needsImprovement: 4000 },
  // Interaction to Next Paint (ms)
  INP: { good: 200, needsImprovement: 500 },
  // Cumulative Layout Shift (unitless score)
  CLS: { good: 0.1, needsImprovement: 0.25 },
  // First Contentful Paint (ms)
  FCP: { good: 1800, needsImprovement: 3000 },
  // First Input Delay (ms, legacy predecessor of INP)
  FID: { good: 100, needsImprovement: 300 },
  // Time to First Byte (ms)
  TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Classifies an individual metric observation into 'good', 'needs-improvement', or 'poor'
 */
export function classifyVitalMetric(name: MetricName, value: number): VitalsRating {
  const threshold = CORE_WEB_VITALS_THRESHOLDS[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) {
    return 'good';
  }
  if (value <= threshold.needsImprovement) {
    return 'needs-improvement';
  }
  return 'poor';
}

/**
 * Calculates the specified percentile (e.g., p75) from a collection of numbers
 */
export function calculatePercentile(values: number[], percentile = 75): number {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  const clampedIndex = Math.max(0, Math.min(sorted.length - 1, index));
  return Math.round(sorted[clampedIndex] * 1000) / 1000;
}

export interface VitalsSummary {
  name: MetricName;
  count: number;
  p75: number;
  rating: VitalsRating;
  alertTriggered: boolean;
  message: string;
}

/**
 * Evaluates the 75th percentile of a metric and triggers an alert if p75 is outside 'good'
 */
export function evaluateVitalsAlert(name: MetricName, values: number[]): VitalsSummary {
  if (!values || values.length === 0) {
    return {
      name,
      count: 0,
      p75: 0,
      rating: 'good',
      alertTriggered: false,
      message: `Sem dados suficientes para ${name}.`,
    };
  }

  const p75 = calculatePercentile(values, 75);
  const rating = classifyVitalMetric(name, p75);
  const alertTriggered = rating !== 'good';

  let message = `P75 de ${name} está Excelente (${p75}).`;
  if (rating === 'needs-improvement') {
    message = `ALERTA AMARELO: P75 de ${name} está em ${p75} (Precisa Melhorar).`;
  } else if (rating === 'poor') {
    message = `ALERTA VERMELHO CRÍTICO: P75 de ${name} está em ${p75} (Ruim). Ação imediata recomendada.`;
  }

  return {
    name,
    count: values.length,
    p75,
    rating,
    alertTriggered,
    message,
  };
}

/**
 * Real User Monitoring telemetry in-memory buffer (stores recent samples per metric)
 */
export class WebVitalsStore {
  private samples: Map<MetricName, number[]> = new Map();
  private maxSamplesPerMetric = 200;

  constructor(maxSamples = 200) {
    this.maxSamplesPerMetric = maxSamples;
  }

  public record(name: MetricName, value: number): void {
    if (!isValidMetricName(name) || typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return;
    }
    const current = this.samples.get(name) || [];
    this.samples.set(name, [...current, value].slice(-this.maxSamplesPerMetric));
  }

  public getSummary(name: MetricName): VitalsSummary {
    const list = this.samples.get(name) || [];
    return evaluateVitalsAlert(name, list);
  }

  public getAllSummaries(): Record<MetricName, VitalsSummary> {
    const names: MetricName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB', 'FID'];
    const result = {} as Record<MetricName, VitalsSummary>;
    for (const name of names) {
      result[name] = this.getSummary(name);
    }
    return result;
  }

  public clear(): void {
    this.samples.clear();
  }
}

// Global singleton store for the runtime
export const globalVitalsStore = new WebVitalsStore();

/**
 * Non-blocking client-side sender using navigator.sendBeacon or fetch keepalive
 */
export function sendVitalToAnalytics(metric: MetricPayload, endpoint = '/api/telemetry/vitals'): void {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    ...metric,
    rating: metric.rating || classifyVitalMetric(metric.name, metric.value),
    timestamp: metric.timestamp || Date.now(),
  });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(endpoint, blob)) return;
    } catch {
      // Fall back to fetch keepalive if sendBeacon is blocked by CSP or browser policy
    }
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Silently avoid breaking user experience if telemetry endpoint is unreachable
  });
}
