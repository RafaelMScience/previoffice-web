'use client';

import React, { useEffect } from 'react';
import { ErrorView } from '@/components/ui/error-view';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log safe error telemetry without exposing secrets to the client
    if (process.env.NODE_ENV === 'development') {
      console.error('[PreviOffice Application Error]:', error);
    }
  }, [error]);

  const safeRefCode = error.digest ? `ERR-${error.digest.slice(0, 8).toUpperCase()}` : undefined;

  return (
    <ErrorView
      statusCode={500}
      reset={reset}
      referenceCode={safeRefCode}
    />
  );
}
