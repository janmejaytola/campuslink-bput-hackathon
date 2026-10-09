import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, badge, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
      <div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              {badge}
            </span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
}
