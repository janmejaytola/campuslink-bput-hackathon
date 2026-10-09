import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/90 pb-5 ${className}`}
    >
      <div className="space-y-1">
        {badge && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
          {children}
        </div>
      )}
    </div>
  );
}
