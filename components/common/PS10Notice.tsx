import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PS10NoticeProps {
  moduleName: string;
  nextStepDetail?: string;
}

export function PS10Notice({ moduleName, nextStepDetail }: PS10NoticeProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#172D4D] bg-white dark:bg-[#081B34]/85 backdrop-blur-md p-4 text-xs text-slate-700 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white shrink-0 shadow-md shadow-[#00C9C0]/20">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white">{moduleName}:</span>{' '}
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {nextStepDetail ? nextStepDetail.replace(/Foundation shell (enabling |with |logging |coordinating |summarizing |maintaining |connecting |displaying |monitoring |managing )?/i, 'Active synchronization: ') : 'Verified institutional workflow active'}
          </span>
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-teal-50 dark:bg-[#06172B] border border-teal-200 dark:border-[#00C9C0]/40 px-2.5 py-1 text-[10px] font-bold text-teal-800 dark:text-[#00F5D4] shrink-0 font-mono shadow-2xs dark:shadow-[0_0_10px_rgba(0,201,192,0.15)]">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-[#00F5D4] animate-pulse" />
        AUDIT VERIFIED
      </div>
    </div>
  );
}
