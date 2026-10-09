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
}

export function StatCard({ label, value, subtext, icon: Icon, trend, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 transition-shadow bg-white ${
        highlight
          ? 'border-teal-300 ring-1 ring-teal-200/50 shadow-xs'
          : 'border-slate-200/80 shadow-xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
