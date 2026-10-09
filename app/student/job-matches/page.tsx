'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Info,
  ChevronRight,
  Award,
  Layers,
  X,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import { CandidateMatchResult } from '@/types/matching';
import { matchingService } from '@/lib/services/matchingService';

export default function StudentJobMatchesPage() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<CandidateMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMatch, setSelectedMatch] = useState<CandidateMatchResult | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ELIGIBLE_ONLY' | 'HIGH_MATCH'>('ALL');

  useEffect(() => {
    let active = true;

    (async () => {
      const uid = currentUser?.uid;
      if (!uid) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await matchingService.getStudentMatches(uid);
        if (!active) return;
        setMatches(data);
      } catch (err) {
        if (!active) return;
        console.error('[Error loading student job matches]:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  const filteredMatches = matches.filter((m) => {
    if (filterMode === 'ELIGIBLE_ONLY') return m.eligible;
    if (filterMode === 'HIGH_MATCH') return m.eligible && m.score >= 80;
    return true;
  });

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <div className="space-y-6 pb-16 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-indigo-700 font-bold">Placement Intelligence</span>
                <span aria-hidden="true" className="text-slate-300">/</span>
                <span>Role Compatibility</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">
                Role Fit Matches & Compatibility
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Deterministic matching based on verified skills, projects, and career goal alignment.
              </p>
            </div>

            <Link
              href="/student/eligibility"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>Full Eligibility Gate</span>
            </Link>
          </div>

          {/* Core Concept Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <strong className="text-slate-900 font-bold block">
                How Compatibility & Eligibility Differ
              </strong>
              <p className="text-slate-600 leading-relaxed">
                <strong>Eligibility</strong> verifies whether you pass mandatory cutoffs (CGPA threshold, backlogs, branch, graduation batch). 
                <strong>Match Score</strong> evaluates alignment with the role across technical competencies, coursework, and internship records.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl max-w-fit">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Open Positions ({matches.length})
            </button>
            <button
              onClick={() => setFilterMode('ELIGIBLE_ONLY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterMode === 'ELIGIBLE_ONLY'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligible Only ({matches.filter((m) => m.eligible).length})
            </button>
            <button
              onClick={() => setFilterMode('HIGH_MATCH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterMode === 'HIGH_MATCH'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Match (80%+) ({matches.filter((m) => m.eligible && m.score >= 80).length})
            </button>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Evaluating role compatibility against verified academic transcript...
              </p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <p className="text-xs text-slate-500">No jobs match the selected filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMatches.map((candMatch) => {
                const isEligible = candMatch.eligible;
                const isHigh = candMatch.score >= 80;

                return (
                  <div
                    key={candMatch.jobId}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-300 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Status */}
                      <div className="flex items-center justify-between gap-2">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ELIGIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                            NOT ELIGIBLE
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {candMatch.company}
                        </span>
                      </div>

                      {/* Job Title & Company */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {candMatch.jobTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {candMatch.company}
                        </p>
                      </div>

                      {/* Match Score Display */}
                      {isEligible ? (
                        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase">
                              Role Compatibility
                            </span>
                            <span className="text-xl font-black text-indigo-900 font-mono tabular-nums">
                              {candMatch.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${candMatch.score}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Required Skills: {candMatch.breakdown?.requiredSkills?.score ?? candMatch.score}%</span>
                            <span>Projects: {candMatch.breakdown?.projects?.score ?? 80}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-rose-50/50 p-3.5 border border-rose-100 text-xs text-rose-800 space-y-1">
                          <span className="font-bold block">Eligibility Threshold Not Satisfied</span>
                          <p className="text-[11px] text-rose-700">
                            {candMatch.reason || 'Profile does not meet minimum CGPA, backlog, or branch requirements.'}
                          </p>
                        </div>
                      )}

                      {/* Strengths List */}
                      {candMatch.strengths && candMatch.strengths.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Key Profile Strengths
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {candMatch.strengths.slice(0, 3).map((str, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60"
                              >
                                {str}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedMatch(candMatch)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Inspect Breakdown & Rubric
                      </button>

                      {isEligible && (
                        <Link
                          href="/student/jobs"
                          className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
                        >
                          <span>Apply</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Breakdown Modal */}
          {selectedMatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Match Breakdown Dossier
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedMatch.jobTitle}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedMatch.company}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700 block">Overall Fit Score</span>
                      <span className="text-[11px] text-slate-400">Weighted evaluation rubric</span>
                    </div>
                    <span className="font-mono text-2xl font-black text-indigo-950 tabular-nums">
                      {selectedMatch.score} / 100
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block">Evaluation Strengths</span>
                    <ul className="space-y-1.5 text-slate-600">
                      {selectedMatch.strengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedMatch.gaps && selectedMatch.gaps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800 block">Identified Technical Gaps</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.gaps.map((sk, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
