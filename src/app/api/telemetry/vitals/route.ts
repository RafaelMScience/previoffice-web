import { NextRequest, NextResponse } from 'next/server';
import {
  globalVitalsStore,
  classifyVitalMetric,
  isValidMetricName,
  MetricPayload,
  MetricName,
} from '@/lib/telemetry/vitals';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MetricPayload;

    if (
      !body ||
      !isValidMetricName(body.name) ||
      typeof body.value !== 'number' ||
      !Number.isFinite(body.value) ||
      body.value < 0
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
  } catch {
    return NextResponse.json({ error: 'Failed to process web vital metric' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
