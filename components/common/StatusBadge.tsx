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
  const dotStyles: Record<StatusVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    brand: 'bg-teal-500',
  };

  const textStyles: Record<StatusVariant, string> = {
    success: 'text-emerald-800',
    warning: 'text-amber-800',
    danger: 'text-rose-800',
    info: 'text-sky-800',
    neutral: 'text-slate-700',
    brand: 'text-teal-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium font-sans ${textStyles[variant]} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} />
      <span>{status}</span>
    </span>
  );
}
