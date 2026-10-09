'use client';

import React from 'react';

interface ProgressRingProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: 'teal' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'sky' | 'turquoise' | 'white';
  className?: string;
  textColorOverride?: string;
}

export function ProgressRing({
  value,
  size = 84,
  strokeWidth = 7,
  label,
  sublabel,
  color = 'turquoise',
  className = '',
  textColorOverride,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const colorStyles = {
    turquoise: {
      stroke: 'stroke-[#00C9C0]',
      text: 'text-[#00C9C0]',
      track: 'stroke-[#152744]',
      glow: 'drop-shadow-[0_0_8px_rgba(0,201,192,0.35)]',
    },
    white: {
      stroke: 'stroke-[#00C9C0]',
      text: 'text-white',
      track: 'stroke-white/15',
      glow: 'drop-shadow-[0_0_8px_rgba(0,201,192,0.4)]',
    },
    teal: {
      stroke: 'stroke-[#007F83]',
      text: 'text-[#0B1B32]',
      track: 'stroke-slate-100',
      glow: 'drop-shadow-[0_0_6px_rgba(0,127,131,0.25)]',
    },
    emerald: {
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-950',
      track: 'stroke-emerald-100',
      glow: 'drop-shadow-[0_0_6px_rgba(16,185,129,0.25)]',
    },
    indigo: {
      stroke: 'stroke-indigo-600',
      text: 'text-indigo-950',
      track: 'stroke-indigo-100',
      glow: 'drop-shadow-[0_0_6px_rgba(79,70,229,0.25)]',
    },
    sky: {
      stroke: 'stroke-sky-500',
      text: 'text-sky-950',
      track: 'stroke-sky-100',
      glow: 'drop-shadow-[0_0_6px_rgba(14,165,233,0.25)]',
    },
    amber: {
      stroke: 'stroke-amber-500',
      text: 'text-amber-950',
      track: 'stroke-amber-100',
      glow: 'drop-shadow-[0_0_6px_rgba(245,158,11,0.25)]',
    },
    rose: {
      stroke: 'stroke-rose-500',
      text: 'text-rose-950',
      track: 'stroke-rose-100',
      glow: 'drop-shadow-[0_0_6px_rgba(244,63,94,0.25)]',
    },
  }[color];

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorStyles.track} transition-all duration-300`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Fill Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorStyles.stroke} ${colorStyles.glow} transition-all duration-700 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-sm md:text-base font-black font-mono tabular-nums leading-none ${textColorOverride || colorStyles.text}`}>
            {Math.round(clampedValue)}%
          </span>
          {sublabel && (
            <span className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider leading-none">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-700 text-center">
          {label}
        </span>
      )}
    </div>
  );
}
