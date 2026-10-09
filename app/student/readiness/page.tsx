'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Award,
  BarChart2,
  Target,
  RefreshCw,
  BookOpen,
  Code2,
  Briefcase,
  GraduationCap,
  MessageSquare,
  FileCheck2,
  TrendingUp,
  Loader2,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { ProgressRing } from '@/components/common/ProgressRing';
import { useAuth } from '@/context/AuthContext';
import { ReadinessResult, ReadinessLevel, FACTOR_CONFIG, READINESS_WEIGHTS } from '@/types/readiness';
import { readinessService } from '@/lib/services/readinessService';

export default function StudentReadinessPage() {
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request optional Gemini explanation based strictly on calculated factors
  const fetchAiExplanation = useCallback(async (result: ReadinessResult) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/readiness/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: result.score,
          level: result.level,
          factorScores: result.factorScores,
          targetRole: result.targetRole,
          strengths: result.strengths,
          improvementAreas: result.improvementAreas,
          recommendations: result.recommendations,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        // Deterministic fallback explanation
        setAiExplanation(
          `Your placement preparation for ${result.targetRole} stands at ${result.score}/100 (${result.level}). ` +
          (result.strengths.length > 0
            ? `Your standout strengths are ${result.strengths.join(', ')}. `
            : '') +
          (result.improvementAreas.length > 0
            ? `Prioritize strengthening your ${result.improvementAreas.join(', ')} to boost your competitive standing.`
            : 'Continue regular interview practice and assessment preparation.')
        );
      }
    } catch (err) {
      console.warn('[Gemini Explanation Warning - using deterministic fallback]:', err);
      setAiExplanation(
        `AI explanation is temporarily unavailable. Your readiness score was calculated using the CAMPUSLINK deterministic readiness engine. Top recommendation: ${result.recommendations[0] || 'Continue targeted preparation.'}`
      );
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  // Fetch or calculate readiness
  const loadReadiness = useCallback(async (forceRecalculate = false) => {
    if (!currentUser?.uid) return;
    setErrorMessage(null);

    try {
      if (forceRecalculate) {
        setIsRecalculating(true);
      } else {
        setIsLoading(true);
      }

      let result: ReadinessResult | null = null;

      if (!forceRecalculate) {
        // Try to load cached current readiness from Firestore
        result = await readinessService.getCurrentReadiness(currentUser.uid);
      }

      // If not cached or explicitly refreshing, compute deterministically from profile & subcollections
      if (!result) {
        result = await readinessService.computeAndSaveReadiness(currentUser.uid);
      }

      setReadiness(result);

      // Fetch AI explanation based strictly on calculated factors
      fetchAiExplanation(result);
    } catch (err: unknown) {
      console.error('[Readiness Load Error]:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to evaluate placement readiness. Please verify your profile data.'
      );
    } finally {
      setIsLoading(false);
      setIsRecalculating(false);
    }
  }, [currentUser, fetchAiExplanation]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        let result = await readinessService.getCurrentReadiness(currentUser.uid);
        if (!result) {
          result = await readinessService.computeAndSaveReadiness(currentUser.uid);
        }
        if (!active) return;
        setReadiness(result);
        fetchAiExplanation(result);
      } catch (err) {
        if (active) {
          console.error('[Readiness Init Error]:', err);
          setErrorMessage('Could not load placement readiness data.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser, fetchAiExplanation]);

  // Styling helper for readiness level
  const getLevelBadge = (level: ReadinessLevel) => {
    switch (level) {
      case 'HIGHLY EMPLOYABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          text: 'HIGHLY EMPLOYABLE',
          desc: 'High competitive standing across academic and technical benchmarks.',
        };
      case 'READY':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          text: 'READY',
          desc: 'Eligible and prepared for primary campus recruitment drives.',
        };
      case 'DEVELOPING':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          text: 'DEVELOPING',
          desc: 'Progressing well with clear opportunities for strengthening key competencies.',
        };
      case 'NOT READY':
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          text: 'NOT READY',
          desc: 'Additional preparation recommended before active placement drives.',
        };
    }
  };

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/60">
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  Deterministic Placement Intelligence
                </span>
                <span className="text-[11px] font-medium text-slate-500">7-Factor Competency Benchmark</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                AI Placement Readiness
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Understand your current placement preparation and what to improve next.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {readiness?.targetRole && (
                <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
                  <Target className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-slate-500">Target Role:</span>
                  <strong className="text-slate-800">{readiness.targetRole}</strong>
                </div>
              )}

              <button
                type="button"
                onClick={() => loadReadiness(true)}
                disabled={isRecalculating || isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRecalculating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing your placement readiness...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Recalculate Readiness</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Evaluating student dossier and calculating deterministic factor scores...
              </p>
            </div>
          ) : readiness ? (
            <>
              {/* TOP HERO: OVERALL READINESS SCORE CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Score Display */}
                  <div className="flex items-center gap-6">
                    <div className="shrink-0">
                      <ProgressRing
                        value={readiness.score}
                        size={88}
                        strokeWidth={7}
                        color="teal"
                        sublabel="Index"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold border ${
                            getLevelBadge(readiness.level).bg
                          }`}
                        >
                          {readiness.level}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Evaluated: {new Date(readiness.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900">Overall Placement Readiness Index</h2>
                      <p className="text-xs text-slate-500 max-w-xl mt-0.5 leading-relaxed">
                        Calculated from your current profile, skills, projects, experience, certifications and assessment data.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5 italic">
                        Notice: This is a placement-readiness indicator derived from your profile dossier, not a prediction or guarantee of employment.
                      </p>
                    </div>
                  </div>

                  {/* Right Target Role info */}
                  <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 border border-slate-200/80 min-w-64">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Target Role Context
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{readiness.targetRole}</span>
                      <Link
                        href="/student/profile"
                        className="text-[11px] font-medium text-teal-700 hover:underline flex items-center gap-0.5"
                      >
                        Edit Profile <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Factor weights are aligned with entry-level engineering recruitment standards.
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span>Readiness Thresholds</span>
                    <span className="font-bold text-slate-800">{readiness.score}%</span>
                  </div>
                  <div
                    className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={readiness.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Overall placement readiness score: ${readiness.score} out of 100`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        readiness.score >= 80
                          ? 'bg-emerald-600'
                          : readiness.score >= 60
                          ? 'bg-teal-600'
                          : readiness.score >= 40
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${readiness.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 (Not Ready)</span>
                    <span>40 (Developing)</span>
                    <span>60 (Ready)</span>
                    <span>80 (Highly Employable)</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* PROFILE COMPLETENESS WARNING (IF ANY DATA IS MISSING) */}
              {readiness.missingInputs.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-amber-900">
                        Your readiness result is based on incomplete profile information.
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        The CAMPUSLINK readiness engine deterministically scores missing inputs as zero rather than assuming unearned competency. Update the following fields in your profile to improve your score:
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {readiness.missingInputs.map((missing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-300 shadow-2xs"
                          >
                            <span>⚠ {missing}</span>
                          </span>
                        ))}
                      </div>

                      <div className="mt-3">
                        <Link
                          href="/student/profile"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-900 hover:underline"
                        >
                          Complete these items in your Student Profile
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI ADVISOR EXPLANATION SECTION */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-700" />
                    <h3 className="text-xs font-bold text-slate-900">AI Placement Intelligence Advisor</h3>
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-medium">
                    Synthesized from verified factors
                  </span>
                </div>

                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-600 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                    <span>Synthesizing personalized placement advisory notes with Gemini...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {aiExplanation ||
                      `Your placement preparation for ${readiness.targetRole} stands at ${readiness.score}/100 (${readiness.level}). Review the factor breakdowns below to see where to invest your interview preparation effort.`}
                  </p>
                )}
              </div>

              {/* SEVEN FACTOR BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-teal-600" />
                    Readiness Factor Breakdown (7 Core Vectors)
                  </h2>
                  <span className="text-xs text-slate-500">Deterministic scoring per reference rubrics</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FACTOR_CONFIG.map((factor) => {
                    const score = readiness.factorScores[factor.key];
                    const contribution = readiness.factorContributions[factor.key];

                    return (
                      <div
                        key={factor.key}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{factor.label}</h4>
                              <p className="text-[11px] text-slate-500">{factor.description}</p>
                            </div>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {factor.weightPercent}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mt-3 mb-1">
                            <span className="text-xl font-bold text-slate-900">{score}</span>
                            <span className="text-xs font-semibold text-teal-700">
                              +{contribution} pts
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div
                            className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
                            role="progressbar"
                            aria-valuenow={score}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${factor.label}: ${score} out of 100`}
                          >
                            <div
                              className={`h-full rounded-full ${
                                score >= 75
                                  ? 'bg-emerald-600'
                                  : score >= 55
                                  ? 'bg-teal-600'
                                  : score >= 35
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] flex justify-between items-center text-slate-500">
                          <span>
                            {score >= 75 ? '✓ Strong area' : score < 55 ? '⚠ Opportunity to strengthen' : 'Moderate foundation'}
                          </span>
                          <span className="font-mono text-[10px]">
                            {score} × {factor.weight} = {contribution}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WEIGHTED CONTRIBUTION EXPLAINABILITY TABLE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Weighted Contribution & Formula Transparency
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      How your final readiness score of <strong className="text-slate-800">{readiness.score} / 100</strong> was derived.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="pb-2">Factor</th>
                        <th className="pb-2">Raw Score</th>
                        <th className="pb-2">Reference Weight</th>
                        <th className="pb-2 text-right">Contribution to Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2.5 font-medium">Academic Performance (CGPA)</td>
                        <td className="py-2.5">{readiness.factorScores.academic} / 100</td>
                        <td className="py-2.5">20% (0.20)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.academic} pts
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Technical Skills (Declared Competencies)</td>
                        <td className="py-2.5">{readiness.factorScores.technical} / 100</td>
                        <td className="py-2.5">30% (0.30)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.technical} pts
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Showcase Projects (Implementation)</td>
                        <td className="py-2.5">{readiness.factorScores.projects} / 100</td>
                        <td className="py-2.5">15% (0.15)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.projects} pts
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Experience & Internships</td>
                        <td className="py-2.5">{readiness.factorScores.experience} / 100</td>
                        <td className="py-2.5">10% (0.10)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.experience} pts
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Industry Certifications</td>
                        <td className="py-2.5">{readiness.factorScores.certifications} / 100</td>
                        <td className="py-2.5">5% (0.05)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.certifications} pts
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Aptitude & Technical Assessments</td>
                        <td className="py-2.5">{readiness.factorScores.assessments} / 100</td>
                        <td className="py-2.5">10% (0.10)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.assessments} pts
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Communication & Presentation</td>
                        <td className="py-2.5">{readiness.factorScores.communication} / 100</td>
                        <td className="py-2.5">10% (0.10)</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                          {readiness.factorContributions.communication} pts
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-bold text-slate-900">
                        <td className="pt-3">Final Normalized Readiness Index</td>
                        <td className="pt-3" colSpan={2}>
                          Sum of Weighted Vector Contributions
                        </td>
                        <td className="pt-3 text-right font-mono text-sm text-teal-700">
                          {readiness.score} / 100 ({readiness.level})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* STRENGTHS & IMPROVEMENT AREAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900">Your Standout Strengths</h3>
                    <span className="text-[10px] text-slate-400">(Factors ≥ 75)</span>
                  </div>

                  {readiness.strengths.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No factor has reached the 75-point benchmark yet. Continue building profile inputs to establish clear strengths.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {readiness.strengths.map((str, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 rounded-xl bg-emerald-50/70 p-2.5 border border-emerald-200/70 text-xs font-medium text-emerald-900"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Areas to Improve Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-900">Opportunities to Strengthen</h3>
                    <span className="text-[10px] text-slate-400">(Factors &lt; 55)</span>
                  </div>

                  {readiness.improvementAreas.length === 0 ? (
                    <div className="rounded-xl bg-emerald-50/60 p-3 text-xs text-emerald-800 border border-emerald-200">
                      Great job! All seven core factors currently meet or exceed the 55-point foundational threshold.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {readiness.improvementAreas.map((area, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/70 text-xs font-medium text-amber-900"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                            !
                          </span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DETERMINISTIC RECOMMENDATIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Target className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recommended High-Impact Next Steps
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {readiness.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-white transition-colors"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-slate-800 font-medium leading-relaxed pt-0.5">
                        {rec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EDUCATIONAL SECTION: HOW YOUR SCORE IS CALCULATED */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <HelpCircle className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">How Your Score is Calculated</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                  <div>
                    <strong className="text-slate-800">1. Academic (20%):</strong> Normalized directly from your official BPUT CGPA using <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">(CGPA / 10) * 100</code>.
                  </div>
                  <div>
                    <strong className="text-slate-800">2. Technical Skills (30%):</strong> Calculated from declared structured skills and verified technical diagnostics.
                  </div>
                  <div>
                    <strong className="text-slate-800">3. Projects (15%):</strong> Evaluates practical implementation depth. Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">number of projects × 25</code>, clamped at 100.
                  </div>
                  <div>
                    <strong className="text-slate-800">4. Experience (10%):</strong> Industrial attachments and corporate internships. Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">internships × 50</code>, clamped at 100.
                  </div>
                  <div>
                    <strong className="text-slate-800">5. Certifications (5%):</strong> Professional credentials and verified certifications. Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">certifications × 25</code>, clamped at 100.
                  </div>
                  <div>
                    <strong className="text-slate-800">6. Assessments (10%):</strong> Average of quantitative aptitude and technical test performance declared in placement inputs.
                  </div>
                  <div className="md:col-span-2">
                    <strong className="text-slate-800">7. Communication (10%):</strong> Behavioral, verbal articulation, and collaborative readiness normalized to 100.
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
