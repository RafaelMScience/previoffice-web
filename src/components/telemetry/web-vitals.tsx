'use client';

import { useReportWebVitals } from 'next/web-vitals';
import {
  sendVitalToAnalytics,
  isValidMetricName,
  MetricName,
  VitalsRating,
} from '@/lib/telemetry/vitals';

/**
 * WebVitalsReporter (Item 31)
 *
 * Automatically captures real user performance metrics (LCP, INP, CLS, FCP, TTFB)
 * as users navigate through the PreviOffice SaaS and transmits them to /api/telemetry/vitals.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Only forward recognized Core Web Vitals, filtering out Next.js internal routing/hydration metrics
    if (!isValidMetricName(metric.name)) return;

    const roundedValue =
      metric.name === 'CLS'
        ? Math.round(metric.value * 10000) / 10000
        : Math.round(metric.value * 100) / 100;

    sendVitalToAnalytics({
      id: metric.id,
      name: metric.name as MetricName,
      value: roundedValue,
      rating: metric.rating as VitalsRating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      timestamp: Date.now(),
    });
  });

  return null;
}
