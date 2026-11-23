/**
 * Next.js Server Instrumentation (Item 18)
 * Runs once at server start to register telemetry, OpenTelemetry hooks, and diagnostics.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { globalTracer } = await import('./lib/telemetry/tracer');
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otlpEndpoint) {
      globalTracer.setOtlpEndpoint(otlpEndpoint);
      console.log(`[OpenTelemetry] Telemetry initialized pointing to collector: ${otlpEndpoint}`);
    }
  }
}
