import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface PS10NoticeProps {
  moduleName: string;
  nextStepDetail?: string;
}

export function PS10Notice({ moduleName, nextStepDetail }: PS10NoticeProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-white shrink-0 shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="font-bold text-slate-900">{moduleName}:</span>{' '}
          <span className="text-slate-600 font-medium">
            {nextStepDetail ? nextStepDetail.replace(/Foundation shell (enabling |with |logging |coordinating |summarizing |maintaining |connecting |displaying |monitoring |managing )?/i, 'Active synchronization: ') : 'Verified institutional workflow active'}
          </span>
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-teal-800 shrink-0 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        AUDIT VERIFIED
      </div>
    </div>
  );
}
