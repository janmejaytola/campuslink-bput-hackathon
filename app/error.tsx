'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-100">
      <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-[#06162D] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-[#152744]">
        <h2 className="text-3xl font-extrabold text-red-600 dark:text-rose-400">Error</h2>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Something went wrong</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          An unexpected issue occurred while loading this page.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-[#0A203B] hover:bg-slate-200 dark:hover:bg-[#102442] text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
