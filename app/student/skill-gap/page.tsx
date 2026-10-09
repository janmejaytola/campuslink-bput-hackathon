'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Award,
  ChevronRight,
  BarChart2,
  Sliders,
  X,
  BookOpen,
  Code2,
  HelpCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  SkillGapAnalysis,
  SkillGapItem,
  SkillStatus,
  SkillPriority,
  RoleRequirement,
  SYNTHETIC_ROLE_BENCHMARKS,
  normalizeRoleId,
} from '@/types/skillGap';
import { skillGapService } from '@/lib/services/skillGapService';
import { studentService } from '@/lib/services/studentService';
import { StudentProfile } from '@/types/student';

export default function SkillGapPage() {
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calibration modal / drawer state
  const [calibratingSkill, setCalibratingSkill] = useState<SkillGapItem | null>(null);
  const [newProficiency, setNewProficiency] = useState<number>(50);
  const [isSavingProficiency, setIsSavingProficiency] = useState<boolean>(false);

  // Preparation modal state
  const [selectedPrepSkill, setSelectedPrepSkill] = useState<SkillGapItem | null>(null);

  // Optional AI explanation synthesis
  const fetchAiSummary = useCallback(async (currentAnalysis: SkillGapAnalysis) => {
    setIsAiLoading(true);
    try {
      const strongSkills = currentAnalysis.gaps
        .filter((g) => g.status === 'STRONG')
        .map((g) => g.skill);

      const res = await fetch('/api/skill-gap/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: currentAnalysis.targetRole,
          coverage: currentAnalysis.coverage,
          strongSkills,
          biggestOpportunities: currentAnalysis.biggestOpportunities,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.summary) {
        setAiSummary(data.summary);
      } else {
        // Deterministic fallback summary
        const topGap = currentAnalysis.biggestOpportunities[0];
        setAiSummary(
          `Your target-role skill coverage for ${currentAnalysis.targetRole} stands at ${currentAnalysis.coverage}%. ` +
          (strongSkills.length > 0
            ? `Your strongest technical competencies are ${strongSkills.slice(0, 3).join(', ')}. `
            : '') +
          (topGap
            ? `Focus on closing your ${topGap.priority} gap in ${topGap.skill} (gap of ${topGap.gap} pts) through project implementation and targeted assessment.`
            : 'Continue role-specific interview preparation and technical maintenance.')
        );
      }
    } catch (err) {
      console.warn('[Gemini Skill Gap Summary Notice - using deterministic fallback]:', err);
      const topGap = currentAnalysis.biggestOpportunities[0];
      setAiSummary(
        `Target-role skill coverage: ${currentAnalysis.coverage}%. Highest priority focus area: ${
          topGap ? `${topGap.skill} (${topGap.priority} priority, gap of ${topGap.gap} pts).` : 'Maintain current competencies.'
        }`
      );
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  // Compute or load skill gap analysis
  const loadSkillGap = useCallback(
    async (forceRecalculate = false) => {
      if (!currentUser?.uid) return;
      setErrorMessage(null);

      try {
        if (forceRecalculate) {
          setIsRecalculating(true);
        } else {
          setIsLoading(true);
        }

        const studentProf = await studentService.getStudentProfile(currentUser.uid);
        setProfile(studentProf);

        const targetRole = studentProf?.careerGoal?.targetRole || 'Software Engineer';
        const roleReq = await skillGapService.getRoleRequirement(targetRole);

        let currentAnalysis: SkillGapAnalysis | null = null;

        if (!forceRecalculate) {
          currentAnalysis = await skillGapService.getCurrentAnalysis(currentUser.uid);
        }

        if (!currentAnalysis) {
          currentAnalysis = await skillGapService.computeAndSaveSkillGap(currentUser.uid);
        }

        setAnalysis(currentAnalysis);
        fetchAiSummary(currentAnalysis);
      } catch (err: unknown) {
        console.error('[Skill Gap Load Error]:', err);
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to analyze skill gaps. Please check profile connection.'
        );
      } finally {
        setIsLoading(false);
        setIsRecalculating(false);
      }
    },
    [currentUser, fetchAiSummary]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        const studentProf = await studentService.getStudentProfile(currentUser.uid);
        if (!active) return;
        setProfile(studentProf);

        let currentAnalysis = await skillGapService.getCurrentAnalysis(currentUser.uid);
        if (!currentAnalysis) {
          currentAnalysis = await skillGapService.computeAndSaveSkillGap(currentUser.uid);
        }
        if (!active) return;
        setAnalysis(currentAnalysis);
        fetchAiSummary(currentAnalysis);
      } catch (err) {
        if (active) {
          console.error('[Skill Gap Init Error]:', err);
          setErrorMessage('Could not load skill gap intelligence.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser, fetchAiSummary]);

  // Handle proficiency calibration
  const handleSaveProficiency = async () => {
    if (!currentUser?.uid || !calibratingSkill) return;
    setIsSavingProficiency(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await skillGapService.updateSkillProficiency(
        currentUser.uid,
        calibratingSkill.skill,
        newProficiency
      );

      setSuccessMessage(`Updated proficiency for ${calibratingSkill.skill} to ${newProficiency}/100.`);
      setCalibratingSkill(null);

      // Recalculate deterministically
      await loadSkillGap(true);
    } catch (err) {
      console.error('[Update Proficiency Error]:', err);
      setErrorMessage('Failed to save skill proficiency.');
    } finally {
      setIsSavingProficiency(false);
    }
  };

  // Status visual badge helper
  const getStatusBadge = (status: SkillStatus) => {
    switch (status) {
      case 'STRONG':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            STRONG
          </span>
        );
      case 'DEVELOPING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            DEVELOPING
          </span>
        );
      case 'MISSING':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-800 border border-rose-200">
            <AlertCircle className="h-3 w-3 text-rose-600" />
            MISSING
          </span>
        );
    }
  };

  // Priority visual badge helper
  const getPriorityBadge = (priority: SkillPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-extrabold text-rose-900 border border-rose-300">
            <Flame className="h-3 w-3 text-rose-600" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Low
          </span>
        );
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
                  <Target className="h-3 w-3 text-teal-600" />
                  Target-Role Mapping Engine
                </span>
                <span className="text-[11px] font-medium text-slate-500">Market Benchmark Diagnostic</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                AI Skill Gap Intelligence
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                See which skills matter most for your target role and where to focus your preparation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadSkillGap(true)}
                disabled={isRecalculating || isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRecalculating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing skill gaps...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Recalculate Skill Gap</span>
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

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* CHECK TARGET ROLE OR SKILLS MISSING */}
          {!profile?.careerGoal?.targetRole && !isLoading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    Set a target role to see your personalized skill gap.
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 max-w-xl">
                    Skill gap analysis requires a destination career role so CAMPUSLINK can load benchmark requirements.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/student/profile"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      <span>Set Career Goal in Profile</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!profile?.skills || profile.skills.length === 0) && !isLoading && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-950">No skills have been added yet</h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Declare your programming languages, tools, and technical competencies to map your current proficiency.
                </p>
              </div>
              <Link
                href="/student/profile"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <span>Update My Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Evaluating candidate skill dossier against target role requirements...
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* TOP CARDS: ROLE, COVERAGE, CRITICAL GAPS, STRONG SKILLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Target Role Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Target Role</span>
                    <Target className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900">{analysis.targetRole}</h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200/60">
                        Synthetic role benchmark
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Total Benchmarks:</span>
                    <span className="font-semibold text-slate-700">{analysis.gaps.length} Skills</span>
                  </div>
                </div>

                {/* Target-Role Skill Coverage */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Target-Role Skill Coverage</span>
                    <BarChart2 className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{analysis.coverage}%</span>
                      <span className="text-xs font-medium text-slate-500">
                        ({analysis.strongCount}/{analysis.totalRequired} strong)
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all duration-500"
                        style={{ width: `${analysis.coverage}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Strong required skills ratio
                  </div>
                </div>

                {/* Critical Gaps Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Critical Priority Gaps</span>
                    <Flame className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-rose-600">{analysis.criticalCount}</span>
                    <p className="mt-1 text-xs text-slate-500">
                      Missing core competencies with required level ≥ 75
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-rose-700 font-medium">
                    {analysis.criticalCount > 0 ? 'Urgent focus recommended' : 'Zero critical deficits'}
                  </div>
                </div>

                {/* Strong Skills Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Strong Skills</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-emerald-600">{analysis.strongCount}</span>
                    <p className="mt-1 text-xs text-slate-500">
                      Skills meeting or surpassing role benchmark
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-medium">
                    Ready for technical interviews
                  </div>
                </div>
              </div>

              {/* YOUR BIGGEST OPPORTUNITIES (TOP HIGH-PRIORITY GAPS) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">Your Biggest Opportunities</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Ranked by severity and gap magnitude</span>
                </div>

                {analysis.biggestOpportunities.length === 0 ? (
                  <div className="rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Outstanding! You have no Critical or High priority skill gaps for your target role.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.biggestOpportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            {getPriorityBadge(opp.priority)}
                          </div>

                          <h4 className="text-xs font-bold text-slate-900">{opp.skill}</h4>
                          <div className="mt-2 flex items-baseline justify-between text-xs text-slate-600">
                            <span>Your Level: <strong className="text-slate-800">{opp.currentLevel}</strong></span>
                            <span>Required: <strong className="text-slate-800">{opp.requiredLevel}</strong></span>
                          </div>

                          <div className="mt-2 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200/60">
                            Skill Gap: +{opp.gap} pts
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setSelectedPrepSkill(opp)}
                            className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors cursor-pointer"
                          >
                            <span>Improve Skill</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI ADVISOR SUMMARY */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-700" />
                    <h3 className="text-xs font-bold text-slate-900">AI Skill Intelligence Summary</h3>
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-medium">
                    Strictly grounded in deterministic analysis
                  </span>
                </div>

                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-600 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                    <span>Synthesizing skill gap strategy...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {aiSummary ||
                      `Your target-role skill coverage for ${analysis.targetRole} is ${analysis.coverage}%. Prioritize closing high-severity gaps before scheduling campus interviews.`}
                  </p>
                )}
              </div>

              {/* DETAILED SKILL GAP TABLE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Detailed Skill Benchmark Matrix</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sorted deterministically: Critical → High → Medium → Low (Largest skill gap first)
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Click <strong>Calibrate</strong> to adjust your assessed proficiency
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="pb-2.5">Skill & Source</th>
                        <th className="pb-2.5">Your Level</th>
                        <th className="pb-2.5">Required</th>
                        <th className="pb-2.5">Gap</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5">Priority</th>
                        <th className="pb-2.5">Actionable Recommendation</th>
                        <th className="pb-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {analysis.gaps.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3">
                            <div className="font-bold text-slate-900">{item.skill}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {item.source === 'required' ? 'Mandatory Requirement' : 'Preferred Skill'}
                            </div>
                          </td>

                          <td className="py-3">
                            {item.assessed ? (
                              <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
                                <span>{item.currentLevel} / 100</span>
                              </div>
                            ) : (
                              <span className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 italic">
                                Proficiency not assessed
                              </span>
                            )}
                          </td>

                          <td className="py-3 font-mono font-semibold text-slate-800">
                            {item.requiredLevel} / 100
                          </td>

                          <td className="py-3">
                            {item.gap > 0 ? (
                              <span className="font-mono font-bold text-rose-600">+{item.gap}</span>
                            ) : (
                              <span className="font-mono text-emerald-600 font-bold">0</span>
                            )}
                          </td>

                          <td className="py-3">{getStatusBadge(item.status)}</td>

                          <td className="py-3">{getPriorityBadge(item.priority)}</td>

                          <td className="py-3 max-w-xs text-[11px] text-slate-600 leading-relaxed">
                            {item.recommendation}
                          </td>

                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setCalibratingSkill(item);
                                  setNewProficiency(item.currentLevel || 60);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Update self-assessed proficiency"
                              >
                                <Sliders className="h-3 w-3 text-slate-400" />
                                <span>Calibrate</span>
                              </button>

                              {item.status !== 'STRONG' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPrepSkill(item)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-500 transition-colors cursor-pointer"
                                >
                                  <span>Improve</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* EDUCATIONAL SECTION: HOW SKILL GAP ANALYSIS WORKS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <HelpCircle className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">How Skill Gap Analysis Works</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600 leading-relaxed">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-1">1. Target Role Benchmark</span>
                    CAMPUSLINK loads benchmark competencies for your selected target role (<code className="font-mono text-[10px] text-teal-700">{analysis.targetRole}</code>).
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-1">2. Competency Delta</span>
                    Your declared proficiency (0–100) is compared against requirements: <code className="font-mono text-[10px] text-teal-700">Gap = max(Required - Current, 0)</code>.
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-1">3. Status Classification</span>
                    Categorized as <strong>STRONG</strong> (Current ≥ Required), <strong>DEVELOPING</strong> (0 &lt; Current &lt; Required), or <strong>MISSING</strong> (Current = 0).
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-1">4. Deterministic Prioritization</span>
                    Ranked strictly as <strong>Critical</strong> (Missing ≥ 75), <strong>High</strong> (Gap ≥ 25), <strong>Medium</strong>, and <strong>Low</strong>.
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* CALIBRATE PROFICIENCY MODAL */}
          {calibratingSkill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Calibrate Skill Proficiency
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update your proficiency score for <strong className="text-slate-800">{calibratingSkill.skill}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCalibratingSkill(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Assessed Level (0–100)</span>
                      <span className="text-base font-bold text-teal-700 font-mono">
                        {newProficiency} / 100
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={newProficiency}
                      onChange={(e) => setNewProficiency(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0 (Novice / None)</span>
                      <span>50 (Intermediate)</span>
                      <span>75 (Proficient)</span>
                      <span>100 (Mastery)</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/80">
                    <div className="flex justify-between mb-1">
                      <span>Target Role Requirement:</span>
                      <strong className="text-slate-800 font-mono">{calibratingSkill.requiredLevel} / 100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Delta:</span>
                      <strong className="text-teal-700 font-mono">
                        {Math.max(calibratingSkill.requiredLevel - newProficiency, 0)} pts gap
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCalibratingSkill(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProficiency}
                      disabled={isSavingProficiency}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 disabled:opacity-50"
                    >
                      {isSavingProficiency ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save & Recalculate</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREPARATION / IMPROVE SKILL MODAL */}
          {selectedPrepSkill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Skill Preparation Plan: {selectedPrepSkill.skill}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPrepSkill(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase">Your Level</span>
                      <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                        {selectedPrepSkill.currentLevel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase">Required</span>
                      <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                        {selectedPrepSkill.requiredLevel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-3 border border-rose-200">
                      <span className="text-[10px] text-rose-700 uppercase">Skill Gap</span>
                      <p className="text-base font-bold text-rose-700 font-mono mt-0.5">
                        +{selectedPrepSkill.gap}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className="rounded-xl bg-teal-50/70 p-3.5 border border-teal-200">
                    <span className="font-bold text-teal-900 block mb-1">Recommended Action</span>
                    <p className="text-teal-800 leading-relaxed">
                      {selectedPrepSkill.recommendation}
                    </p>
                  </div>

                  {/* Practical Project & Assessment Suggestions */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800">Practical Next Steps</h5>
                    <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
                      <li>
                        <strong>Project Implementation:</strong> Build a feature or dedicated repository showcasing{' '}
                        {selectedPrepSkill.skill} to prove practical competency to campus recruiters.
                      </li>
                      <li>
                        <strong>Assessment Practice:</strong> Practice role-specific problem sets and code reviews focused on {selectedPrepSkill.skill}.
                      </li>
                      <li>
                        <strong>Profile Update:</strong> Once complete, calibrate your proficiency level to reflect your improved capability.
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedPrepSkill;
                        setSelectedPrepSkill(null);
                        setCalibratingSkill(target);
                        setNewProficiency(target.currentLevel || 60);
                      }}
                      className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500"
                    >
                      Calibrate Proficiency Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPrepSkill(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
