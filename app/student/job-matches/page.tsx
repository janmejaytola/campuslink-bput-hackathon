'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-teal-700">Placement Intelligence</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">Role Compatibility</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                My Job Matches & Placement Compatibility
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Deterministic matching based on verified skills, projects, and career goal alignment.
              </p>
            </div>

            <Link
              href="/student/eligibility"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>Full Eligibility Gate</span>
            </Link>
          </div>

          {/* Core Concept Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <strong className="text-slate-900 font-bold block">
                How Match Scores Work
              </strong>
              <p className="text-slate-600 leading-relaxed">
                <strong>Eligibility</strong> determines whether you meet mandatory requirements (CGPA cutoff, backlogs, branch, graduation year). 
                <strong>Match Score</strong> estimates how strongly your profile aligns with the role across technical competencies, showcase projects, and internships.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Open Positions ({matches.length})
            </button>
            <button
              onClick={() => setFilterMode('ELIGIBLE_ONLY')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'ELIGIBLE_ONLY'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Eligible Only ({matches.filter((m) => m.eligible).length})
            </button>
            <button
              onClick={() => setFilterMode('HIGH_MATCH')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'HIGH_MATCH'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              High Match (80%+) ({matches.filter((m) => m.eligible && m.score >= 80).length})
            </button>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
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
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-400 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            ELIGIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-800 border border-rose-200">
                            <AlertCircle className="h-3 w-3" />
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
                            <span className="text-xl font-extrabold text-teal-800 font-mono">
                              {candMatch.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? 'bg-teal-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${candMatch.score}%` }}
                            />
                          </div>

                          <p className="text-[11px] text-slate-600 italic">
                            {candMatch.strengths[0] || 'Strong match based on verified technical skills and projects.'}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-800 space-y-1">
                          <strong className="font-bold block">Mandatory Criterion Barrier</strong>
                          <p className="text-[11px] leading-relaxed">
                            {candMatch.reason || 'You do not meet one or more mandatory eligibility requirements.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Evaluated {new Date(candMatch.evaluatedAt).toLocaleDateString()}
                      </span>

                      <button
                        onClick={() => setSelectedMatch(candMatch)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        <span>View Breakdown</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MATCH DETAIL MODAL */}
          {selectedMatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedMatch.jobTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedMatch.company} · Role Compatibility
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="p-1 rounded text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Match Score</span>
                  <span className="text-2xl font-extrabold text-teal-800 font-mono">
                    {selectedMatch.score} / 100
                  </span>
                </div>

                {/* Dimensions list */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Dimension Evaluation
                  </span>
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {Object.entries(selectedMatch.breakdown).map(([k, item]) => (
                      <div key={k} className="p-2.5 flex items-center justify-between bg-white">
                        <span className="capitalize text-slate-700 font-medium">
                          {k.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="font-mono text-right">
                          {item.status === 'APPLICABLE' ? (
                            <span className="font-bold text-teal-800">{item.score}%</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">N/A</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                {selectedMatch.strengths.length > 0 && (
                  <div className="space-y-1 text-xs text-emerald-950 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <strong className="font-bold text-emerald-900 block">Why you match:</strong>
                    <ul className="space-y-1">
                      {selectedMatch.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
