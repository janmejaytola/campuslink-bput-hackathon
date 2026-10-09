'use client';

import React from 'react';

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

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-bold text-white truncate">{skill}</span>
          {category && (
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              · {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0 text-[11px] font-mono tabular-nums">
          <span className="font-bold text-[#00F5D4]">{current}%</span>
          <span className="text-slate-400">/ req {target}%</span>
          <span
            className={`font-semibold ${
              isSatisfied ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
      </div>

      {/* Progress track with target indicator */}
      <div className="relative h-2 w-full rounded-full bg-[#0E2442] overflow-hidden border border-[#172D4D]">
        {/* Candidate Fill Bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isSatisfied
              ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] shadow-[0_0_8px_rgba(0,201,192,0.4)]'
              : 'bg-amber-500'
          }`}
          style={{ width: `${current}%` }}
        />
        {/* Target Benchmark Line */}
        {requiredScore > 0 && requiredScore < 100 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10 opacity-70"
            style={{ left: `${target}%` }}
            title={`Required: ${target}%`}
          />
        )}
      </div>
    </div>
  );
}
