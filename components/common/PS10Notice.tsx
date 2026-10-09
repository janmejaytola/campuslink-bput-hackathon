import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface PS10NoticeProps {
  moduleName: string;
  nextStepDetail?: string;
}

export function PS10Notice({ moduleName, nextStepDetail }: PS10NoticeProps) {
  return (
    <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 text-xs text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-white shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <span className="font-semibold text-teal-900">PS10 Architecture Shell:</span>{' '}
          <span className="text-teal-800">{moduleName}</span>
          {nextStepDetail && (
            <p className="mt-0.5 text-teal-700 font-normal">{nextStepDetail}</p>
          )}
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded bg-teal-100/70 border border-teal-200 px-2 py-1 text-[11px] font-medium text-teal-900 shrink-0">
        <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
        BPUT Hackathon 2026
      </div>
    </div>
  );
}
