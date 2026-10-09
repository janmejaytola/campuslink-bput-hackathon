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
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge && (
            <span className="text-xs font-semibold text-teal-700 font-mono tracking-wide">
              [{badge}]
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
