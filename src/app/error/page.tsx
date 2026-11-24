'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ErrorView, type ErrorStatusCode } from '@/components/ui/error-view';
import { Loader2 } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get('code');
  const parsedCode = rawCode ? parseInt(rawCode, 10) : 400;

  const validCode: ErrorStatusCode =
    parsedCode === 400 || parsedCode === 404 || parsedCode === 500
      ? parsedCode
      : 400;

  return <ErrorView statusCode={validCode} />;
}

export default function ErrorRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-[#C89543]" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
