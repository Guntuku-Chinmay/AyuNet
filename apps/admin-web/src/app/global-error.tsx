'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center antialiased dark:bg-slate-950">
        <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <ShieldAlert className="h-12 w-12 animate-pulse" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Fatal Application Error
        </h1>
        <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
          A critical system error prevented the interface from loading. Try refreshing the app.
        </p>
        <div className="mt-6">
          <Button onClick={reset} className="bg-rose-600 hover:bg-rose-700">
            <RefreshCw className="mr-1.5 h-4 w-4" /> Reset Portal Layout
          </Button>
        </div>
      </body>
    </html>
  );
}
