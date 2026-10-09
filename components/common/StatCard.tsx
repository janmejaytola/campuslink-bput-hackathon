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
      border: 'border-teal-200/90',
      bg: 'bg-teal-50/40',
      iconBg: 'bg-teal-600 text-white shadow-xs',
      valueColor: 'text-teal-950',
      subtextColor: 'text-teal-800',
    },
    emerald: {
      border: 'border-emerald-200/90',
      bg: 'bg-emerald-50/40',
      iconBg: 'bg-emerald-600 text-white shadow-xs',
      valueColor: 'text-emerald-950',
      subtextColor: 'text-emerald-800',
    },
    sky: {
      border: 'border-sky-200/90',
      bg: 'bg-sky-50/40',
      iconBg: 'bg-sky-600 text-white shadow-xs',
      valueColor: 'text-sky-950',
      subtextColor: 'text-sky-800',
    },
    indigo: {
      border: 'border-indigo-200/90',
      bg: 'bg-indigo-50/40',
      iconBg: 'bg-indigo-600 text-white shadow-xs',
      valueColor: 'text-indigo-950',
      subtextColor: 'text-indigo-800',
    },
    amber: {
      border: 'border-amber-200/90',
      bg: 'bg-amber-50/40',
      iconBg: 'bg-amber-600 text-white shadow-xs',
      valueColor: 'text-amber-950',
      subtextColor: 'text-amber-800',
    },
  }[accent];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden group ${
        highlight
          ? `${accentConfigs.border} ${accentConfigs.bg} shadow-xs ring-1 ring-teal-300/40`
          : 'border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs'
      } ${className}`}
    >
      {/* Subtle top sheen */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
            highlight ? accentConfigs.iconBg : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div
          className={`text-2xl md:text-3xl font-black tracking-tight font-mono tabular-nums ${
            highlight ? accentConfigs.valueColor : 'text-slate-900'
          }`}
        >
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold tabular-nums ${
              trend.positive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p
          className={`mt-1 text-xs leading-relaxed truncate ${
            highlight ? accentConfigs.subtextColor : 'text-slate-500'
          }`}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
