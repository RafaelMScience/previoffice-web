'use client';

import React from 'react';
import { ErrorView } from '@/components/ui/error-view';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const safeRefCode = error.digest ? `SYS-${error.digest.slice(0, 8).toUpperCase()}` : undefined;

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 antialiased font-sans">
        <ErrorView
          statusCode={500}
          reset={reset}
          referenceCode={safeRefCode}
        />
      </body>
    </html>
  );
}
