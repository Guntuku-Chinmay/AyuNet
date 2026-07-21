import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
      <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/50 dark:text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-red-900 dark:text-red-200">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6 border-red-300 dark:border-red-800">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
