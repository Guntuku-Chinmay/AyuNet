'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Logged Page Error boundary capture:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <ShieldAlert className="h-10 w-10 animate-bounce" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
        A system error has occurred
      </h2>
      <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
        We encountered a temporary application error. Our operations team has been notified.
      </p>
      <div className="mt-6 flex justify-center space-x-3">
        <Button onClick={reset} className="bg-rose-600 hover:bg-rose-700">
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
}
