import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-[#1E375C] bg-white dark:bg-[#081B34]/70 p-8 md:p-12 text-center shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-md ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-[#007F83]/20 border border-teal-200 dark:border-[#00C9C0]/30 text-teal-700 dark:text-[#00F5D4] mb-4 shadow-xs dark:shadow-[0_0_15px_rgba(0,201,192,0.2)]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00A89E] hover:from-[#00A89E] hover:to-[#00C9C0] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-[#007F83]/30 cursor-pointer"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
