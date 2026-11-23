import { NextRequest, NextResponse } from 'next/server';
import {
  globalVitalsStore,
  classifyVitalMetric,
  isValidMetricName,
  MetricPayload,
  MetricName,
} from '@/lib/telemetry/vitals';
import { checkRateLimit } from '@/lib/security/admin-guard';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 0. Rate limiting: max 60 vital submissions per minute per IP
    const rateLimit = checkRateLimit(ip, 'telemetry-vitals-post', 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many telemetry requests' }, { status: 429 });
    }

    // 1. Content size validation: reject payloads > 16KB
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 16384) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    let body: MetricPayload | null = null;
    try {
      body = (await req.json()) as MetricPayload;
    } catch {
      try {
        const rawText = await req.text();
        if (rawText) {
          body = JSON.parse(rawText) as MetricPayload;
        }
      } catch {
        body = null;
      }
    }

    if (
      !body ||
      !isValidMetricName(body.name) ||
      typeof body.value !== 'number' ||
      !Number.isFinite(body.value) ||
      body.value < 0 ||
      body.value > 120_000 // Max 2 minutes realistic ceiling for browser Web Vitals
    ) {
      return NextResponse.json({ error: 'Invalid metric payload' }, { status: 400 });
    }

    const rating = classifyVitalMetric(body.name, body.value);
    globalVitalsStore.record(body.name, body.value);

    const summary = globalVitalsStore.getSummary(body.name);

    return NextResponse.json({
      received: true,
      name: body.name,
      value: body.value,
      rating,
      p75: summary.p75,
      alertTriggered: summary.alertTriggered,
    });
  } catch (err) {
    console.error('[Telemetry Vitals API Error]:', err);
    return NextResponse.json({ error: 'Failed to process web vital metric' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = checkRateLimit(ip, 'telemetry-vitals-get', 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many telemetry read requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const metric = searchParams.get('metric') as MetricName | null;

  if (metric) {
    if (!isValidMetricName(metric)) {
      return NextResponse.json({ error: 'Unsupported or invalid metric parameter' }, { status: 400 });
    }
    const summary = globalVitalsStore.getSummary(metric);
    return NextResponse.json(summary);
  }

  const all = globalVitalsStore.getAllSummaries();
  const alertsActive = Object.values(all).filter((s) => s.alertTriggered);

  return NextResponse.json({
    status: alertsActive.length === 0 ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    metrics: all,
    activeAlertsCount: alertsActive.length,
    alerts: alertsActive.map((a) => a.message),
  });
}
