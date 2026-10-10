import React from 'react';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'brand';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, variant = 'neutral', size = 'sm' }: StatusBadgeProps) {
  const badgeStyles: Record<StatusVariant, { dot: string; text: string; bg: string }> = {
    success: {
      dot: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      text: 'text-emerald-800 dark:text-emerald-300',
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/70 dark:border-emerald-800/60 shadow-2xs dark:shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    },
    warning: {
      dot: 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      text: 'text-amber-800 dark:text-amber-300',
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/70 dark:border-amber-800/60 shadow-2xs dark:shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    },
    danger: {
      dot: 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      text: 'text-rose-800 dark:text-rose-300',
      bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/70 dark:border-rose-800/60 shadow-2xs dark:shadow-[0_0_12px_rgba(244,63,94,0.15)]',
    },
    info: {
      dot: 'bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      text: 'text-sky-800 dark:text-sky-300',
      bg: 'bg-sky-50 border-sky-200 dark:bg-sky-950/70 dark:border-sky-800/60 shadow-2xs dark:shadow-[0_0_12px_rgba(14,165,233,0.15)]',
    },
    neutral: {
      dot: 'bg-slate-500 dark:bg-slate-400',
      text: 'text-slate-700 dark:text-slate-300',
      bg: 'bg-slate-100 border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/60',
    },
    brand: {
      dot: 'bg-teal-600 dark:bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.6)]',
      text: 'text-teal-800 dark:text-[#00F5D4]',
      bg: 'bg-teal-50 border-teal-200 dark:bg-[#007F83]/30 dark:border-[#00C9C0]/40 shadow-2xs dark:shadow-[0_0_12px_rgba(0,201,192,0.2)]',
    },
  };

  const current = badgeStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap rounded-lg border px-2.5 py-0.5 ${current.bg} ${current.text} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{status}</span>
    </span>
  );
}
