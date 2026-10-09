'use client';

import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: 'teal' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'sky' | 'turquoise' | 'white';
  className?: string;
  textColorOverride?: string;
  animateCount?: boolean;
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
  animateCount = true,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (clampedValue / 100) * circumference;

  const [displayValue, setDisplayValue] = useState<number>(0);
  const [animatedOffset, setAnimatedOffset] = useState<number>(circumference);

  useEffect(() => {
    // Initial stroke animation trigger
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 50);

    if (!animateCount) {
      return () => clearTimeout(timer);
    }

    // Smooth counter animation
    let startTimestamp: number | null = null;
    const duration = 900;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(clampedValue * easeProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [clampedValue, targetOffset, animateCount]);

  const currentDisplay = animateCount ? displayValue : clampedValue;

  const colorStyles = {
    turquoise: {
      stroke: 'stroke-[#00E5D4]',
      text: 'text-[#00E5D4]',
      track: 'stroke-[#10243E]',
      glow: 'drop-shadow-[0_0_10px_rgba(0,229,212,0.5)]',
    },
    white: {
      stroke: 'stroke-[#16CFFF]',
      text: 'text-white',
      track: 'stroke-white/15',
      glow: 'drop-shadow-[0_0_10px_rgba(22,207,255,0.5)]',
    },
    teal: {
      stroke: 'stroke-[#00BFA6]',
      text: 'text-[#00E5D4]',
      track: 'stroke-[#0D243B]',
      glow: 'drop-shadow-[0_0_8px_rgba(0,191,166,0.45)]',
    },
    emerald: {
      stroke: 'stroke-emerald-400',
      text: 'text-emerald-300',
      track: 'stroke-emerald-950/60',
      glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]',
    },
    indigo: {
      stroke: 'stroke-indigo-400',
      text: 'text-indigo-300',
      track: 'stroke-indigo-950/60',
      glow: 'drop-shadow-[0_0_8px_rgba(99,102,241,0.45)]',
    },
    sky: {
      stroke: 'stroke-sky-400',
      text: 'text-sky-300',
      track: 'stroke-sky-950/60',
      glow: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]',
    },
    amber: {
      stroke: 'stroke-amber-400',
      text: 'text-amber-300',
      track: 'stroke-amber-950/60',
      glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]',
    },
    rose: {
      stroke: 'stroke-rose-400',
      text: 'text-rose-300',
      track: 'stroke-rose-950/60',
      glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.45)]',
    },
  }[color];

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Subtle radial ambient backglow */}
        <div
          className="absolute inset-2 rounded-full opacity-30 blur-md pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 229, 212, 0.4) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track with subtle bevel */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorStyles.track} transition-all duration-300`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Fill Ring with glowing neon drop shadow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorStyles.stroke} ${colorStyles.glow} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset || circumference}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text with Tabular Numerals */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className={`text-sm md:text-base font-black font-mono tabular-nums leading-none tracking-tight ${textColorOverride || colorStyles.text}`}>
            {currentDisplay}%
          </span>
          {sublabel && (
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider leading-none">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-2 text-xs font-bold text-slate-300 text-center tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
