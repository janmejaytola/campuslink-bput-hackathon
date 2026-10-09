import React from 'react';
import { LucideIcon } from 'lucide-react';

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
      border: 'border-[#00C9C0]/40',
      bg: 'bg-[#08223E]/90',
      iconBg: 'bg-[#007F83] text-[#00F5D4] shadow-[0_0_12px_rgba(0,201,192,0.3)]',
      subtextColor: 'text-[#00C9C0]',
    },
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-[#062426]/90',
      iconBg: 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      subtextColor: 'text-emerald-400',
    },
    sky: {
      border: 'border-sky-500/40',
      bg: 'bg-[#08233C]/90',
      iconBg: 'bg-sky-600 text-white shadow-[0_0_12px_rgba(14,165,233,0.3)]',
      subtextColor: 'text-sky-400',
    },
    indigo: {
      border: 'border-cyan-500/40',
      bg: 'bg-[#0A1F3D]/90',
      iconBg: 'bg-[#0A3D62] text-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.3)]',
      subtextColor: 'text-cyan-300',
    },
    amber: {
      border: 'border-amber-500/40',
      bg: 'bg-[#261E0A]/90',
      iconBg: 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      subtextColor: 'text-amber-400',
    },
  }[accent];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group ${
        highlight
          ? `${accentConfigs.border} ${accentConfigs.bg} shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-[#00C9C0]/30`
          : 'border-[#172D4D] bg-[#081B34]/85 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-[#00C9C0]/50 hover:shadow-[0_0_20px_rgba(0,201,192,0.15)] backdrop-blur-md'
      } ${className}`}
    >
      {/* Top turquoise neon glow bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C9C0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
            highlight ? accentConfigs.iconBg : 'bg-[#0B2242] text-[#00C9C0] border border-[#172D4D]'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl md:text-3xl font-black tracking-tight font-mono tabular-nums text-white drop-shadow-sm">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${
              trend.positive
                ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-800/60'
                : 'text-rose-400 bg-rose-950/70 border border-rose-800/60'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p
          className={`mt-1.5 text-xs leading-relaxed truncate ${
            highlight ? accentConfigs.subtextColor : 'text-slate-400'
          }`}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
