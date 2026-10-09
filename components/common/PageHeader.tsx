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
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#152744] pb-5 ${className}`}
    >
      <div className="space-y-1">
        {badge && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00F5D4] bg-[#00C9C0]/15 border border-[#00C9C0]/40 px-2.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(0,201,192,0.15)]">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
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
