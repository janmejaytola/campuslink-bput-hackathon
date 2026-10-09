'use client';

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
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#152744] pb-5 relative ${className}`}
    >
      <div className="space-y-1.5">
        {badge && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00E5D4] bg-[#00E5D4]/15 border border-[#00E5D4]/40 px-2.5 py-0.5 rounded-md shadow-[0_0_12px_rgba(0,229,212,0.2)] font-mono">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F4FAFF] drop-shadow-sm">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#9CB4CC] leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
          {children}
        </div>
      )}

      {/* Subtle bottom neon sweep highlight line */}
      <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-gradient-to-r from-[#16CFFF] to-transparent pointer-events-none" />
    </div>
  );
}
