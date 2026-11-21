'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { sendVitalToAnalytics, MetricName, VitalsRating } from '@/lib/telemetry/vitals';

/**
 * WebVitalsReporter (Item 31)
 *
 * Automatically captures real user performance metrics (LCP, INP, CLS, FCP, TTFB)
 * as users navigate through the PreviOffice SaaS and transmits them to /api/telemetry/vitals.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    sendVitalToAnalytics({
      id: metric.id,
      name: metric.name as MetricName,
      value: Math.round(metric.value * 100) / 100,
      rating: metric.rating as VitalsRating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      timestamp: Date.now(),
    });
  });

  return null;
}
