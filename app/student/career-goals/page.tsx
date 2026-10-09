'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Target,
  Briefcase,
  MapPin,
  Building,
  DollarSign,
  Heart,
  ChevronRight,
  RefreshCw,
  Loader2,
  Sliders,
  Check,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  CareerGoal,
  TARGET_ROLE_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  LOCATION_OPTIONS,
  CAREER_INTERESTS_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLE_FOCUS_AREAS,
} from '@/types/careerGoal';
import { careerGoalService } from '@/lib/services/careerGoalService';
import { studentService } from '@/lib/services/studentService';
import { readinessService } from '@/lib/services/readinessService';
import { skillGapService } from '@/lib/services/skillGapService';
import { ReadinessResult } from '@/types/readiness';
import { SkillGapAnalysis } from '@/types/skillGap';
import { StudentProfile } from '@/types/student';

export default function CareerGoalsPage() {
  const { currentUser } = useAuth();

  // Loading & state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Form State
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [customRole, setCustomRole] = useState<string>('');
  const [alternativeRoles, setAlternativeRoles] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>(['Full-time']);
  const [workModes, setWorkModes] = useState<string[]>(['Hybrid']);
  const [preferredLocations, setPreferredLocations] = useState<string[]>(['Bhubaneswar', 'Bengaluru']);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [minSalary, setMinSalary] = useState<number>(6);
  const [maxSalary, setMaxSalary] = useState<number>(10);
  const [openToMarket, setOpenToMarket] = useState<boolean>(false);
  const [interests, setInterests] = useState<string[]>(['Software Engineering', 'Web Development']);
  const [customInterest, setCustomInterest] = useState<string>('');
  const [industries, setIndustries] = useState<string[]>(['Product Companies', 'SaaS']);

  // Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [targetRoleChanged, setTargetRoleChanged] = useState<boolean>(false);

  // Fetch optional AI guidance
  const fetchAiGuidance = useCallback(
    async (
      activeRole: string,
      altRoles: string[],
      activeInterests: string[],
      readinessData: ReadinessResult | null,
      gapData: SkillGapAnalysis | null,
      currentSkills: string[]
    ) => {
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/career-goals/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetRole: activeRole,
            alternativeRoles: altRoles,
            interests: activeInterests,
            readinessScore: readinessData?.score ?? 0,
            readinessLevel: readinessData?.level ?? 'Developing',
            skillCoverage: gapData?.coverage ?? 0,
            criticalGaps: gapData?.criticalCount ?? 0,
            declaredSkills: currentSkills,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.guidance) {
          setAiGuidance(data.guidance);
        } else {
          // Deterministic fallback
          setAiGuidance(
            `Targeting ${activeRole} aligns with your declared interests in ${activeInterests.slice(0, 2).join(' & ')}. ` +
            (gapData && gapData.coverage > 0
              ? `Your target-role skill coverage is currently ${gapData.coverage}%. `
              : '') +
            `Focus on closing your highest-priority technical gap to maximize competitiveness in campus drives.`
          );
        }
      } catch (err) {
        console.warn('[AI Guidance Warning - using deterministic fallback]:', err);
        setAiGuidance(
          `Your goal of ${activeRole} is actively connected to your placement dossier. Review your skill gaps and readiness indicators to guide your weekly interview preparation.`
        );
      } finally {
        setIsAiLoading(false);
      }
    },
    []
  );

  // Initial Data Fetch
  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        const [prof, goal, readData, gapData] = await Promise.all([
          studentService.getStudentProfile(currentUser.uid),
          careerGoalService.getCareerGoal(currentUser.uid),
          readinessService.getCurrentReadiness(currentUser.uid),
          skillGapService.getCurrentAnalysis(currentUser.uid),
        ]);

        if (!active) return;
        setProfile(prof);
        setReadiness(readData);
        setSkillGap(gapData);

        if (goal) {
          setCareerGoal(goal);
          if (TARGET_ROLE_OPTIONS.includes(goal.targetRole)) {
            setTargetRole(goal.targetRole);
          } else {
            setTargetRole('Other');
            setCustomRole(goal.targetRole);
          }
          setAlternativeRoles(goal.alternativeRoles || []);
          if (goal.jobTypes?.length) setJobTypes(goal.jobTypes);
          if (goal.workModes?.length) setWorkModes(goal.workModes);
          if (goal.preferredLocations?.length) setPreferredLocations(goal.preferredLocations);
          if (goal.salaryPreference) {
            setMinSalary(goal.salaryPreference.minimum ?? 6);
            setMaxSalary(goal.salaryPreference.maximum ?? 10);
            setOpenToMarket(Boolean(goal.salaryPreference.openToMarketRange));
          }
          if (goal.interests?.length) setInterests(goal.interests);
          if (goal.industries?.length) setIndustries(goal.industries);

          fetchAiGuidance(
            goal.targetRole,
            goal.alternativeRoles || [],
            goal.interests || [],
            readData,
            gapData,
            prof?.skills || []
          );
        } else if (prof?.careerGoal?.targetRole) {
          // Fallback to basic profile careerGoal
          setTargetRole(prof.careerGoal.targetRole);
        }
      } catch (err) {
        console.error('[Career Goals Load Error]:', err);
        if (active) setErrorMessage('Failed to load career goals.');
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser, fetchAiGuidance]);

  // Form toggles
  const toggleSelection = (item: string, currentList: string[], setter: (val: string[]) => void) => {
    if (currentList.includes(item)) {
      setter(currentList.filter((x) => x !== item));
    } else {
      setter([...currentList, item]);
    }
  };

  const toggleAlternativeRole = (role: string) => {
    if (role === targetRole) return;
    if (alternativeRoles.includes(role)) {
      setAlternativeRoles(alternativeRoles.filter((r) => r !== role));
    } else {
      if (alternativeRoles.length >= 3) {
        setErrorMessage('You can select a maximum of 3 alternative roles.');
        return;
      }
      setErrorMessage(null);
      setAlternativeRoles([...alternativeRoles, role]);
    }
  };

  // Add custom interest
  const handleAddCustomInterest = () => {
    if (!customInterest.trim()) return;
    const trimmed = customInterest.trim();
    if (!interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setCustomInterest('');
  };

  // Add custom location
  const handleAddCustomLocation = () => {
    if (!customLocation.trim()) return;
    const trimmed = customLocation.trim();
    if (!preferredLocations.includes(trimmed)) {
      setPreferredLocations([...preferredLocations, trimmed]);
    }
    setCustomLocation('');
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const resolvedTarget = targetRole === 'Other' ? customRole.trim() : targetRole;
    if (!resolvedTarget) {
      setErrorMessage('Please specify your primary target role.');
      return;
    }

    if (!openToMarket && minSalary < 0) {
      setErrorMessage('Minimum expected CTC cannot be negative.');
      return;
    }

    if (!openToMarket && maxSalary < minSalary) {
      setErrorMessage('Maximum expected CTC must be greater than or equal to minimum CTC.');
      return;
    }

    setIsSaving(true);

    try {
      const cleanAlternativeRoles = alternativeRoles.filter((r) => r !== resolvedTarget);

      const goalData: CareerGoal = {
        targetRole: resolvedTarget,
        alternativeRoles: cleanAlternativeRoles,
        jobTypes: jobTypes.length > 0 ? jobTypes : ['Full-time'],
        workModes: workModes.length > 0 ? workModes : ['Hybrid'],
        preferredLocations: preferredLocations.length > 0 ? preferredLocations : ['Bhubaneswar'],
        salaryPreference: {
          minimum: openToMarket ? 0 : minSalary,
          maximum: openToMarket ? 0 : maxSalary,
          openToMarketRange: openToMarket,
        },
        interests,
        industries,
        customRole: targetRole === 'Other' ? customRole : '',
      };

      await careerGoalService.saveCareerGoal(currentUser.uid, goalData);
      setCareerGoal(goalData);
      setSuccessMessage('Career goals saved successfully! Your placement direction is synchronized.');

      if (careerGoal && careerGoal.targetRole !== resolvedTarget) {
        setTargetRoleChanged(true);
      }

      fetchAiGuidance(
        resolvedTarget,
        cleanAlternativeRoles,
        interests,
        readiness,
        skillGap,
        profile?.skills || []
      );
    } catch (err: unknown) {
      console.error('[Save Career Goals Error]:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save career goals.');
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveTargetRole = targetRole === 'Other' ? customRole || 'Other' : targetRole;
  const suggestedFocus = ROLE_FOCUS_AREAS[effectiveTargetRole] || ROLE_FOCUS_AREAS['Software Engineer'];

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/60">
                  <Award className="h-3 w-3 text-teal-600" />
                  Career Intelligence Vector
                </span>
                <span className="text-[11px] text-slate-400">Step 7: Placement Goals</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Career Goals
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Define where you want to go. CAMPUSLINK will use your goals to personalize preparation and future placement opportunities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/student/skill-gap"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <span>Skill Gap Intelligence</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
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

          {targetRoleChanged && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  You changed your primary target role to <strong>{effectiveTargetRole}</strong>. Recalculate your Skill Gap to refresh role benchmarks!
                </span>
              </div>
              <Link
                href="/student/skill-gap"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900 shrink-0"
              >
                <span>Recalculate Skill Gap</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Loading candidate career aspirations and alignment data...
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: GOAL ALIGNMENT METRICS SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Career Goal Identity */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Target Role</span>
                    <Target className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900">{effectiveTargetRole}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Primary placement vector for campus drives
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Alternative Options:</span>
                    <span className="font-semibold text-slate-700">
                      {alternativeRoles.length > 0 ? alternativeRoles.join(', ') : 'None selected'}
                    </span>
                  </div>
                </div>

                {/* Placement Readiness Connection */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Overall Placement Readiness</span>
                    <Sparkles className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        {readiness ? `${readiness.score}` : '--'}
                      </span>
                      <span className="text-xs font-bold text-teal-700">
                        {readiness ? readiness.level : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Deterministic multi-factor score from profile
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <Link
                      href="/student/readiness"
                      className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      View Readiness Diagnostics <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Skill Gap Alignment Connection */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Target-Role Skill Coverage</span>
                    <TrendingUp className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        {skillGap ? `${skillGap.coverage}%` : '--%'}
                      </span>
                      <span className="text-xs font-semibold text-rose-700">
                        {skillGap ? `${skillGap.criticalCount} Critical Gaps` : ''}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Verified alignment against role benchmarks
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <Link
                      href="/student/skill-gap"
                      className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      View Skill Gap Analysis <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* AI CAREER GUIDANCE ADVISOR */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-700" />
                    <h3 className="text-xs font-bold text-slate-900">AI Career Strategy Guidance</h3>
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-medium">
                    Synthesized from verified goals & metrics
                  </span>
                </div>

                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-600 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                    <span>Synthesizing career trajectory advisory notes with Gemini...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {aiGuidance ||
                      `Targeting ${effectiveTargetRole} aligns with your engineering preparation. Complete the career preferences below to refine your placement profile.`}
                  </p>
                )}
              </div>

              {/* SECTION 2: CAREER GOAL FORM */}
              <form onSubmit={handleSave} className="space-y-6">
                {/* Target Role & Alternatives */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Target className="h-4 w-4 text-teal-600" />
                      1. Target Role & Alternative Options
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select your primary target role and up to 3 compatible alternative roles.
                    </p>
                  </div>

                  {/* Primary Target Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Primary Target Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full sm:w-80 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden bg-white shadow-2xs font-medium"
                    >
                      {TARGET_ROLE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {targetRole === 'Other' && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Specify Custom Target Role <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          placeholder="e.g. Embedded Systems Engineer"
                          className="w-full sm:w-80 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                          required
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Notice: Changing your primary target role will update your benchmark requirements and Skill Gap analysis.
                    </p>
                  </div>

                  {/* Secondary / Alternative Roles */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        Alternative Roles (Select up to 3)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {alternativeRoles.length}/3 selected
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {TARGET_ROLE_OPTIONS.filter((r) => r !== 'Other' && r !== targetRole).map((role) => {
                        const isSelected = alternativeRoles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleAlternativeRole(role)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                            <span>{role}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Job Type & Work Mode */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-teal-600" />
                      2. Job Type & Work Mode Preferences
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Indicate the employment structures and work configurations you are open to.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Job Types */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        Preferred Job Type (Multiple selections allowed)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {JOB_TYPE_OPTIONS.map((type) => {
                          const isSelected = jobTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleSelection(type, jobTypes, setJobTypes)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Work Modes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        Preferred Work Mode (Multiple selections allowed)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {WORK_MODE_OPTIONS.map((mode) => {
                          const isSelected = workModes.includes(mode);
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => toggleSelection(mode, workModes, setWorkModes)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                              <span>{mode}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferred Locations */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      3. Preferred Work Locations
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select major IT recruitment hubs in India or specify a custom destination.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {LOCATION_OPTIONS.map((loc) => {
                      const isSelected = preferredLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => toggleSelection(loc, preferredLocations, setPreferredLocations)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                          <span>{loc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Location input */}
                  <div className="pt-2 flex items-center gap-2 max-w-sm">
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomLocation();
                        }
                      }}
                      placeholder="Add another location (e.g. Cuttack)..."
                      className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomLocation}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Expected Salary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-teal-600" />
                      4. Expected Compensation (CTC in LPA)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Specify realistic target salary expectations in Lakhs Per Annum (INR).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="open-market"
                      checked={openToMarket}
                      onChange={(e) => setOpenToMarket(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="open-market" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Open to market range / Standard institutional placement bracket
                    </label>
                  </div>

                  {!openToMarket && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Minimum Expected CTC (₹ LPA)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="50"
                          value={minSalary}
                          onChange={(e) => setMinSalary(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Maximum Expected CTC (₹ LPA)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="50"
                          value={maxSalary}
                          onChange={(e) => setMaxSalary(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 italic">
                    Disclaimer: Expected CTC is used strictly for preference matching and recruiter recommendations. Does not constitute a salary guarantee.
                  </p>
                </div>

                {/* Career Interests & Industry Preferences */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-teal-600" />
                      5. Interests & Target Industries
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Highlight the technical domains and commercial sectors that excite you most.
                    </p>
                  </div>

                  {/* Areas of Interest */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Areas of Interest
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CAREER_INTERESTS_OPTIONS.map((interest) => {
                        const isSelected = interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleSelection(interest, interests, setInterests)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                            <span>{interest}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom interest */}
                    <div className="mt-3 flex items-center gap-2 max-w-sm">
                      <input
                        type="text"
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomInterest();
                          }
                        }}
                        placeholder="Add another interest (e.g. Distributed Systems)..."
                        className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomInterest}
                        className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Preferred Industries */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Preferred Industry Sectors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRY_OPTIONS.map((ind) => {
                        const isSelected = industries.includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => toggleSelection(ind, industries, setIndustries)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                            <span>{ind}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Saving updates your student career dossier at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">students/{currentUser?.uid}.careerGoal</code>.
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Career Goals...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Save Career Goals</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SECTION 3: ROLE FOCUS SUGGESTIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Suggested Focus Areas for {effectiveTargetRole}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Institutional curriculum alignment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {suggestedFocus.map((focus, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 flex items-start gap-2.5 text-xs font-medium text-slate-800"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 leading-snug">{focus}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-slate-400 italic">
                  Note: Suggested focus areas represent recommended engineering disciplines. Detailed skill deltas are measured in Skill Gap Intelligence.
                </p>
              </div>

              {/* SECTION 4: HOW CAREER GOALS CONNECT */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <HelpCircle className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">How Career Goals Power Placement Intelligence</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <strong className="text-slate-900 block mb-1">1. Skill Gap Benchmarking</strong>
                    Your primary role selects the baseline required and preferred skills. Any deficit receives prioritized learning guidance.
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <strong className="text-slate-900 block mb-1">2. Placement Readiness Context</strong>
                    Your academic, coding, and internship factors are contextualized against industry standards for your target role.
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <strong className="text-slate-900 block mb-1">3. Future Recruiter Drives</strong>
                    When placement officers release verified jobs, your role, location, and salary preferences guide eligibility recommendations.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
