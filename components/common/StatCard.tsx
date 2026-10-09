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
      border: 'border-[#16CFFF]/40 hover:border-[#16CFFF]/70',
      bg: 'bg-gradient-to-br from-[#06162D] via-[#0A203B] to-[#040D1A]',
      iconBg: 'bg-gradient-to-tr from-[#00BFA6] to-[#16CFFF] text-[#020817] shadow-[0_0_15px_rgba(22,207,255,0.4)]',
      subtextColor: 'text-[#00E5D4]',
      glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(22,207,255,0.12)]',
    },
    emerald: {
      border: 'border-emerald-500/40 hover:border-emerald-400/70',
      bg: 'bg-gradient-to-br from-[#051C1A] via-[#082824] to-[#040D1A]',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-[#020817] shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      subtextColor: 'text-emerald-300',
      glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.12)]',
    },
    sky: {
      border: 'border-sky-500/40 hover:border-sky-400/70',
      bg: 'bg-gradient-to-br from-[#06192E] via-[#09223F] to-[#040D1A]',
      iconBg: 'bg-gradient-to-tr from-sky-600 to-sky-400 text-[#020817] shadow-[0_0_15px_rgba(14,165,233,0.4)]',
      subtextColor: 'text-sky-300',
      glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(14,165,233,0.12)]',
    },
    indigo: {
      border: 'border-cyan-500/40 hover:border-cyan-400/70',
      bg: 'bg-gradient-to-br from-[#071630] via-[#0A2244] to-[#040D1A]',
      iconBg: 'bg-gradient-to-tr from-[#007F83] via-[#00C9C0] to-[#16CFFF] text-[#020817] shadow-[0_0_15px_rgba(0,245,212,0.4)]',
      subtextColor: 'text-cyan-300',
      glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(0,245,212,0.12)]',
    },
    amber: {
      border: 'border-amber-500/40 hover:border-amber-400/70',
      bg: 'bg-gradient-to-br from-[#1C1708] via-[#2A200B] to-[#040D1A]',
      iconBg: 'bg-gradient-to-tr from-amber-600 to-amber-400 text-[#020817] shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      subtextColor: 'text-amber-300',
      glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.12)]',
    },
  }[accent];

  return (
    <Card3D maxTilt={4} glare highlightBorder={highlight} className="h-full">
      <div
        className={`h-full rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group backdrop-blur-md preserve-3d ${
          highlight
            ? `${accentConfigs.border} ${accentConfigs.bg} ${accentConfigs.glow} ring-1 ring-[#16CFFF]/30`
            : 'border-[#152744] bg-[#06162D]/85 text-white shadow-[0_10px_35px_rgba(0,0,0,0.55)] hover:border-[#16CFFF]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_24px_rgba(22,207,255,0.18)]'
        } ${className}`}
      >
        {/* Top luminous hairline beam on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#16CFFF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-center justify-between translate-z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9CB4CC]">
            {label}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
              highlight
                ? accentConfigs.iconBg
                : 'bg-[#0A203B] text-[#00E5D4] border border-[#152744] group-hover:border-[#16CFFF]/40'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between gap-2 translate-z-20">
          <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono tabular-nums text-[#F4FAFF] drop-shadow-sm">
            {value}
          </div>
          {trend && (
            <span
              className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-md ${
                trend.positive
                  ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-800/60'
                  : 'text-rose-300 bg-rose-950/70 border border-rose-800/60'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>

        {subtext && (
          <p
            className={`mt-2 text-xs leading-relaxed truncate translate-z-10 ${
              highlight ? accentConfigs.subtextColor : 'text-[#9CB4CC]'
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
    </Card3D>
  );
}
