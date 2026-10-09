'use client';

import React, { useEffect, useState } from 'react';

interface SkillBarProps {
  skill: string;
  candidateScore: number; // 0 - 100
  requiredScore?: number; // 0 - 100
  category?: string;
  className?: string;
}

export function SkillBar({
  skill,
  candidateScore,
  requiredScore = 80,
  category,
  className = '',
}: SkillBarProps) {
  const current = Math.min(100, Math.max(0, candidateScore));
  const target = Math.min(100, Math.max(0, requiredScore));
  const delta = current - target;
  const isSatisfied = current >= target;

  const [animatedWidth, setAnimatedWidth] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(current);
    }, 80);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-bold text-[#F4FAFF] truncate">{skill}</span>
          {category && (
            <span className="text-[10px] text-[#9CB4CC] font-mono hidden sm:inline">
              · {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono tabular-nums">
          <span className="font-black text-[#00E5D4] drop-shadow-[0_0_6px_rgba(0,229,212,0.4)]">
            {current}%
          </span>
          <span className="text-slate-400">/ req {target}%</span>
          <span
            className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
              isSatisfied
                ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-800/60'
                : 'text-amber-300 bg-amber-950/70 border border-amber-800/60'
            }`}
          >
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
      </div>

      {/* Progress track with 3D inset depth and target indicator */}
      <div className="relative h-2.5 w-full rounded-full bg-[#081B34] overflow-hidden border border-[#152744] shadow-inner">
        {/* Animated Fill Bar with luminous neon gradient */}
        <div
          className={`h-full rounded-full transition-all duration-800 ease-out relative ${
            isSatisfied
              ? 'bg-gradient-to-r from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] shadow-[0_0_12px_rgba(22,207,255,0.5)]'
              : 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
          }`}
          style={{ width: `${animatedWidth}%` }}
        >
          {/* Subtle light sweep reflection */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-light-sweep" />
        </div>

        {/* Target Benchmark Notch Line */}
        {requiredScore > 0 && requiredScore < 100 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_6px_rgba(255,255,255,0.9)] opacity-90"
            style={{ left: `${target}%` }}
            title={`Required minimum target: ${target}%`}
          />
        )}
      </div>
    </div>
  );
}
