'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card3D } from './Card3D';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  highlight?: boolean;
  accent?: 'teal' | 'emerald' | 'sky' | 'indigo' | 'amber';
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  highlight,
  accent = 'teal',
  className = '',
}: StatCardProps) {
  const accentConfigs = {
    teal: {
      border: 'border-teal-500/30 hover:border-teal-500/60 dark:border-[#16CFFF]/40 dark:hover:border-[#16CFFF]/70',
      bg: 'bg-gradient-to-br from-teal-50/70 via-white to-sky-50/50 dark:from-[#06162D] dark:via-[#0A203B] dark:to-[#040D1A]',
      iconBg: 'bg-teal-600 text-white shadow-md shadow-teal-500/20 dark:bg-gradient-to-tr dark:from-[#00BFA6] dark:to-[#16CFFF] dark:text-[#020817] dark:shadow-[0_0_15px_rgba(22,207,255,0.4)]',
      subtextColor: 'text-teal-700 dark:text-[#00E5D4]',
      glow: 'shadow-[0_8px_30px_rgba(13,148,136,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(22,207,255,0.12)]',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60 dark:border-emerald-500/40 dark:hover:border-emerald-400/70',
      bg: 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-[#051C1A] dark:via-[#082824] dark:to-[#040D1A]',
      iconBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 dark:bg-gradient-to-tr dark:from-emerald-600 dark:to-emerald-400 dark:text-[#020817] dark:shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      subtextColor: 'text-emerald-700 dark:text-emerald-300',
      glow: 'shadow-[0_8px_30px_rgba(16,185,129,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.12)]',
    },
    sky: {
      border: 'border-sky-500/30 hover:border-sky-500/60 dark:border-sky-500/40 dark:hover:border-sky-400/70',
      bg: 'bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 dark:from-[#06192E] dark:via-[#09223F] dark:to-[#040D1A]',
      iconBg: 'bg-sky-600 text-white shadow-md shadow-sky-500/20 dark:bg-gradient-to-tr dark:from-sky-600 dark:to-sky-400 dark:text-[#020817] dark:shadow-[0_0_15px_rgba(14,165,233,0.4)]',
      subtextColor: 'text-sky-700 dark:text-sky-300',
      glow: 'shadow-[0_8px_30px_rgba(14,165,233,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(14,165,233,0.12)]',
    },
    indigo: {
      border: 'border-indigo-500/30 hover:border-indigo-500/60 dark:border-cyan-500/40 dark:hover:border-cyan-400/70',
      bg: 'bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/50 dark:from-[#071630] dark:via-[#0A2244] dark:to-[#040D1A]',
      iconBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-gradient-to-tr dark:from-[#007F83] dark:via-[#00C9C0] dark:to-[#16CFFF] dark:text-[#020817] dark:shadow-[0_0_15px_rgba(0,245,212,0.4)]',
      subtextColor: 'text-indigo-700 dark:text-cyan-300',
      glow: 'shadow-[0_8px_30px_rgba(99,102,241,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(0,245,212,0.12)]',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60 dark:border-amber-500/40 dark:hover:border-amber-400/70',
      bg: 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 dark:from-[#1C1708] dark:via-[#2A200B] dark:to-[#040D1A]',
      iconBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/20 dark:bg-gradient-to-tr dark:from-amber-600 dark:to-amber-400 dark:text-[#020817] dark:shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      subtextColor: 'text-amber-700 dark:text-amber-300',
      glow: 'shadow-[0_8px_30px_rgba(245,158,11,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.12)]',
    },
  }[accent];

  return (
    <Card3D maxTilt={4} glare highlightBorder={highlight} className="h-full">
      <div
        className={`h-full rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group backdrop-blur-md preserve-3d ${
          highlight
            ? `${accentConfigs.border} ${accentConfigs.bg} ${accentConfigs.glow} ring-1 ring-teal-500/20 dark:ring-[#16CFFF]/30`
            : 'border-slate-200 bg-white dark:border-[#152744] dark:bg-[#06162D]/85 shadow-sm hover:border-teal-500/40 hover:shadow-md dark:shadow-[0_10px_35px_rgba(0,0,0,0.55)] dark:hover:border-[#16CFFF]/50 dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_24px_rgba(22,207,255,0.18)]'
        } ${className}`}
      >
        {/* Top luminous hairline beam on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500 dark:via-[#16CFFF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-center justify-between translate-z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#9CB4CC]">
            {label}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
              highlight
                ? accentConfigs.iconBg
                : 'bg-slate-100 text-teal-700 border border-slate-200 dark:bg-[#0A203B] dark:text-[#00E5D4] dark:border-[#152744] dark:group-hover:border-[#16CFFF]/40'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between gap-2 translate-z-20">
          <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono tabular-nums text-slate-900 dark:text-[#F4FAFF] drop-shadow-xs">
            {value}
          </div>
          {trend && (
            <span
              className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-md ${
                trend.positive
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/70 dark:border-emerald-800/60'
                  : 'text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-300 dark:bg-rose-950/70 dark:border-rose-800/60'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>

        {subtext && (
          <p
            className={`mt-2 text-xs leading-relaxed truncate translate-z-10 ${
              highlight ? accentConfigs.subtextColor : 'text-slate-500 dark:text-[#9CB4CC]'
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
    </Card3D>
  );
}
