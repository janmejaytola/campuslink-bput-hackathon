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
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/90 bg-white/80 p-8 md:p-12 text-center shadow-2xs backdrop-blur-xs ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 mb-4 shadow-2xs">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm md:text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs cursor-pointer"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
