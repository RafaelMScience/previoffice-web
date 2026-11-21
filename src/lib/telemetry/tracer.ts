/**
 * OpenTelemetry Lightweight Tracing & Slow Request Profiler (Item 18)
 * 
 * - Profiles HTTP routes, database queries, and external API calls.
 * - Flags requests taking > 1000ms as slow (`isSlow: true`).
 * - Captures step-by-step breakdown (durations for each stage).
 * - Generates W3C Server-Timing headers for DevTools inspection.
 * - Supports exporting spans to OpenTelemetry OTLP Collectors via HTTP.
 */

export const SLOW_REQUEST_THRESHOLD_MS = 1000;

export interface TraceStep {
  name: string;
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  name: string;
  route?: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  isSlow: boolean;
  steps: TraceStep[];
  attributes: Record<string, unknown>;
  status: 'OK' | 'ERROR';
  error?: string;
}

function generateId(length = 16): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export class TelemetryTracer {
  private activeSpans: Map<string, TraceSpan> = new Map();
  private finishedSpans: TraceSpan[] = [];
  private otlpEndpoint: string | null = null;

  constructor(otlpEndpoint?: string) {
    this.otlpEndpoint = otlpEndpoint || process.env.OTEL_EXPORTER_OTLP_ENDPOINT || null;
  }

  public setOtlpEndpoint(endpoint: string | null): void {
    this.otlpEndpoint = endpoint;
  }

  /**
   * Starts a new trace span (e.g. for an HTTP route)
   */
  public startSpan(name: string, attributes: Record<string, unknown> = {}): TraceSpan {
    const span: TraceSpan = {
      traceId: (attributes.traceId as string) || generateId(32),
      spanId: generateId(16),
      name,
      startTime: performance.now(),
      isSlow: false,
      steps: [],
      attributes: { ...attributes },
      status: 'OK',
    };

    this.activeSpans.set(span.spanId, span);
    return span;
  }

  /**
   * Records a granular sub-step inside an active span (e.g. 'db:query', 'auth:verify')
   */
  public async traceStep<T>(
    span: TraceSpan,
    stepName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      span.steps.push({
        name: stepName,
        durationMs,
        metadata,
      });
    }
  }

  /**
   * Synchronous step recording
   */
  public traceStepSync<T>(
    span: TraceSpan,
    stepName: string,
    operation: () => T,
    metadata?: Record<string, unknown>
  ): T {
    const start = performance.now();
    try {
      return operation();
    } finally {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      span.steps.push({
        name: stepName,
        durationMs,
        metadata,
      });
    }
  }

  /**
   * Finishes an active span, checks if slow (> 1000ms), and dispatches to collector
   */
  public finishSpan(span: TraceSpan, error?: Error): TraceSpan {
    span.endTime = performance.now();
    span.durationMs = Math.round((span.endTime - span.startTime) * 100) / 100;

    if (error) {
      span.status = 'ERROR';
      span.error = error.message;
    }

    if (span.durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
      span.isSlow = true;
      span.attributes['telemetry.slow_request'] = true;
      span.attributes['telemetry.slow_threshold_ms'] = SLOW_REQUEST_THRESHOLD_MS;
    }

    this.activeSpans.delete(span.spanId);
    this.finishedSpans.push(span);

    // Keep memory clean (limit to 1000 in-memory spans)
    if (this.finishedSpans.length > 1000) {
      this.finishedSpans.shift();
    }

    // Export asynchronously if collector is configured
    if (this.otlpEndpoint) {
      this.exportToCollector(span).catch(() => {
        // Silent catch to prevent telemetry failure from impacting requests
      });
    }

    return span;
  }

  /**
   * Builds W3C Server-Timing header string for DevTools inspection
   * e.g.: total;dur=1250, db_query;dur=850, auth;dur=15
   */
  public buildServerTimingHeader(span: TraceSpan): string {
    const parts: string[] = [];
    if (span.durationMs !== undefined) {
      parts.push(`total;dur=${span.durationMs};desc="${span.name}"`);
    }

    for (const step of span.steps) {
      // Normalize name for header compliance
      const cleanName = step.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      parts.push(`${cleanName};dur=${step.durationMs}`);
    }

    return parts.join(', ');
  }

  public getFinishedSpans(): TraceSpan[] {
    return [...this.finishedSpans];
  }

  public getSlowSpans(): TraceSpan[] {
    return this.finishedSpans.filter((s) => s.isSlow);
  }

  public clear(): void {
    this.activeSpans.clear();
    this.finishedSpans = [];
  }

  private async exportToCollector(span: TraceSpan): Promise<void> {
    if (!this.otlpEndpoint) return;

    try {
      const payload = {
        resourceSpans: [
          {
            resource: {
              attributes: [
                { key: 'service.name', value: { stringValue: 'previoffice-web' } },
                { key: 'service.version', value: { stringValue: '1.0.0' } },
              ],
            },
            scopeSpans: [
              {
                spans: [
                  {
                    traceId: span.traceId,
                    spanId: span.spanId,
                    name: span.name,
                    startTimeUnixNano: Math.floor(span.startTime * 1_000_000),
                    endTimeUnixNano: Math.floor((span.endTime || performance.now()) * 1_000_000),
                    attributes: Object.entries(span.attributes).map(([key, value]) => ({
                      key,
                      value: { stringValue: String(value) },
                    })),
                    status: {
                      code: span.status === 'OK' ? 1 : 2,
                      message: span.error,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      await fetch(this.otlpEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Background export error non-fatal
    }
  }
}

// Global default tracer instance
export const globalTracer = new TelemetryTracer();
