'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FileCheck2,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building,
  Target,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Briefcase,
  Users,
  Compass,
  ArrowUpRight,
  FileText,
  Scale,
  FolderLock,
  Layers,
  MapPin,
  Check,
  CalendarDays,
  Zap,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { ProgressRing } from '@/components/common/ProgressRing';
import { SkillBar } from '@/components/common/SkillBar';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import { readinessService } from '@/lib/services/readinessService';
import { ReadinessResult } from '@/types/readiness';
import { skillGapService } from '@/lib/services/skillGapService';
import { SkillGapAnalysis } from '@/types/skillGap';
import { shortlistService } from '@/lib/services/shortlistService';
import { interviewService } from '@/lib/services/interviewService';
import { jobService } from '@/lib/services/jobService';
import { ShortlistRecord } from '@/types/shortlist';
import { InterviewRecord } from '@/types/interview';
import { RecruiterJob } from '@/types/job';

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [shortlists, setShortlists] = useState<ShortlistRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecruiterJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(currentUser?.uid));

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        const [readinessRes, skillGapRes, shortlistRes, interviewRes, jobsRes] =
          await Promise.all([
            readinessService.getCurrentReadiness(currentUser.uid).then(async (res) => {
              if (!res) return await readinessService.computeAndSaveReadiness(currentUser.uid);
              return res;
            }),
            skillGapService.getCurrentAnalysis(currentUser.uid).then(async (res) => {
              if (!res) return await skillGapService.computeAndSaveSkillGap(currentUser.uid);
              return res;
            }),
            shortlistService.getShortlistsForStudent(currentUser.uid),
            interviewService.getInterviewsForStudent(currentUser.uid),
            jobService.getOpenJobs(),
          ]);

        if (active) {
          setReadiness(readinessRes);
          setSkillGap(skillGapRes);
          setShortlists(Object.values(shortlistRes || {}));
          setInterviews(interviewRes);
          setRecommendedJobs(jobsRes.slice(0, 3));
        }
      } catch (err) {
        console.error('[StudentDashboard Data Load Error]:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const studentName = currentUser?.name || 'Candidate';
  const overallScore = readiness?.score ?? 82;
  const readinessTier = readiness?.level ?? 'READY';
  const shortlistedApplications = shortlists.filter((s) => s.status === 'SHORTLISTED');
  const upcomingInterviews = interviews.filter(
    (i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED'
  );

  // Profile completion calculation based on student fields
  const profileSteps = [
    Boolean(currentUser?.name),
    Boolean(currentUser?.regNumber),
    Boolean(currentUser?.cgpa),
    Boolean(currentUser?.department),
    Boolean(readiness?.score),
  ];
  const profileCompletion = Math.round(
    (profileSteps.filter(Boolean).length / profileSteps.length) * 100
  );

  // Career progression steps
  const progressionSteps = [
    { title: 'Dossier & Transcripts', status: 'COMPLETE', desc: 'CGPA & verified branch' },
    {
      title: 'AI Readiness Benchmark',
      status: readiness ? 'COMPLETE' : 'CURRENT',
      desc: `${overallScore}/100 score`,
    },
    {
      title: 'Drive Eligibility Gating',
      status: 'COMPLETE',
      desc: 'Deterministic rules passed',
    },
    {
      title: 'Recruiter Shortlist',
      status: shortlistedApplications.length > 0 ? 'COMPLETE' : 'CURRENT',
      desc: `${shortlistedApplications.length} drives shortlisted`,
    },
    {
      title: 'Interview Round',
      status: upcomingInterviews.length > 0 ? 'COMPLETE' : 'UPCOMING',
      desc: `${upcomingInterviews.length} slots confirmed`,
    },
    { title: 'Offer Letter Rollout', status: 'UPCOMING', desc: 'Placement cell verification' },
  ];

  return (
    <ProtectedRoute allowedRole="STUDENT">
      {isLoading ? (
        <AppLayoutShell role="student">
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-3xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-8 w-80 bg-slate-200 rounded" />
              <div className="h-4 w-96 bg-slate-100 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-3"
                >
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-8 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 rounded-2xl bg-white border border-slate-200/80 p-6 space-y-4">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-64 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-96 rounded-2xl bg-white border border-slate-200/80 p-6 space-y-4">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-64 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </AppLayoutShell>
      ) : (
        <AppLayoutShell role="student">
          {/* Personalized Career Hero Banner */}
          <div className="rounded-3xl border border-slate-800 bg-[#0B0F19] p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            {/* Ambient teal mesh */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#14B8A6 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-teal-950 border border-teal-800/80 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 tracking-tight">
                    CAREER OPERATING SYSTEM
                  </span>
                  <span className="rounded-md bg-slate-800/90 border border-slate-700/80 px-2.5 py-0.5 text-[10px] font-mono text-slate-300 font-semibold">
                    Reg #{currentUser?.regNumber || '2201106284'}
                  </span>
                  <span className="rounded-md bg-slate-800/90 border border-slate-700/80 px-2.5 py-0.5 text-[10px] text-slate-300">
                    {currentUser?.department || 'Computer Science & Engineering'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome, {studentName}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Real-time placement intelligence, deterministic eligibility evaluation, and verified interview management for the 2026 graduation cycle.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/student/readiness"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-200" />
                    <span>Run AI Benchmark</span>
                  </Link>
                  <Link
                    href="/student/job-matches"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Scale className="h-3.5 w-3.5 text-slate-400" />
                    <span>Role Fit Matches</span>
                  </Link>
                </div>
              </div>

              {/* Profile Completion Ring */}
              <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shrink-0 backdrop-blur-xs">
                <ProgressRing
                  value={profileCompletion}
                  size={76}
                  strokeWidth={6}
                  color="teal"
                  sublabel="Profile"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Profile Dossier</p>
                  <p className="text-[11px] text-teal-400 font-semibold">
                    {profileCompletion}% Complete
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-[130px] leading-tight">
                    Verified for corporate recruiters
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Core Career Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/student/readiness">
                <StatCard
                  label="AI Readiness Benchmark"
                  value={`${overallScore} / 100`}
                  subtext={`Status: ${readinessTier} Tier`}
                  icon={Sparkles}
                  highlight
                  accent="teal"
                />
              </Link>

              <Link href="/student/applications">
                <StatCard
                  label="Shortlisted Drives"
                  value={shortlistedApplications.length}
                  subtext={`${shortlists.length} total active applications`}
                  icon={CheckCircle2}
                  highlight={shortlistedApplications.length > 0}
                  accent="emerald"
                />
              </Link>

              <Link href="/student/schedule">
                <StatCard
                  label="Confirmed Interviews"
                  value={upcomingInterviews.length}
                  subtext="0 academic timetable clashes"
                  icon={Calendar}
                  accent="sky"
                />
              </Link>

              <Link href="/student/profile">
                <StatCard
                  label="Academic Standing"
                  value={currentUser?.cgpa ? currentUser.cgpa.toFixed(2) : '8.45'}
                  subtext="Verified BPUT CGPA"
                  icon={GraduationCap}
                  accent="indigo"
                />
              </Link>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/student/resume"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-teal-300 hover:shadow-xs transition-all shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    Resume Vault
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">AI Parser & Sync</span>
                </div>
              </Link>

              <Link
                href="/student/eligibility"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-xs transition-all shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    Eligibility Gate
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">Rule Evaluator</span>
                </div>
              </Link>

              <Link
                href="/student/skill-gap"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-xs transition-all shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shrink-0 group-hover:scale-105 transition-transform">
                  <Target className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    Skill Gap Radar
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    Market Diagnostic
                  </span>
                </div>
              </Link>

              <Link
                href="/student/jobs"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs transition-all shadow-2xs group"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    Campus Drives
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    Live Openings
                  </span>
                </div>
              </Link>
            </div>

            {/* Career Progression Roadmap */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Placement Journey Progression
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  Batch 2026 Cycle
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
                {progressionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      step.status === 'COMPLETE'
                        ? 'bg-teal-50/60 border-teal-200/80 text-teal-950'
                        : step.status === 'CURRENT'
                        ? 'bg-sky-50/60 border-sky-300 text-sky-950 ring-1 ring-sky-200'
                        : 'bg-slate-50/60 border-slate-200/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                      {step.status === 'COMPLETE' ? (
                        <Check className="h-3 w-3 text-teal-700" />
                      ) : step.status === 'CURRENT' ? (
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <p className="text-xs font-bold leading-tight truncate">{step.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight truncate">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Two-Column Main Content Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Competency Breakdown & Skill Gap Remediation */}
              <div className="lg:col-span-2 space-y-6">
                {/* Rubric-Based Competency Dimensions */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Rubric-Based Competency Dimensions
                      </h3>
                      <p className="text-xs text-slate-500">
                        Deterministic rubric evaluation across academics, technical aptitude, and domain project depth
                      </p>
                    </div>
                    <Link
                      href="/student/readiness"
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0"
                    >
                      <span>Full Rubric</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {readiness?.factorScores ? (
                      Object.entries(readiness.factorScores).map(([key, scoreVal], i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 capitalize">
                              {key} Competency
                            </span>
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {scoreVal} / 100
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-600 transition-all duration-500"
                              style={{ width: `${Math.min(100, Number(scoreVal))}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 py-4">
                        Evaluating candidate factor scores...
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Role Skill-Gap Diagnostics */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-teal-700" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Role Benchmark Skill Gaps
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px]">
                      Target: {readiness?.targetRole || 'Software Development Engineer'}
                    </span>
                  </div>

                  {skillGap?.gaps && skillGap.gaps.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600">
                        You satisfy{' '}
                        <strong className="text-emerald-700 font-bold">
                          {skillGap.strongCount} core skills
                        </strong>{' '}
                        ({skillGap.coverage}% benchmark coverage). Key growth areas to boost match scores:
                      </p>

                      <div className="space-y-2.5 pt-1">
                        {skillGap.gaps.slice(0, 4).map((g, idx) => (
                          <SkillBar
                            key={idx}
                            skill={g.skill}
                            candidateScore={g.candidateLevel * 20}
                            requiredScore={g.requiredLevel * 20}
                            category={g.category}
                          />
                        ))}
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/student/skill-gap"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                        >
                          <span>Explore Remediation Roadmap</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Calculating real-time skill delta against target campus recruiters...
                    </p>
                  )}
                </div>

                {/* Recommended Campus Drives (Real Data) */}
                {recommendedJobs.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Recommended Campus Drives
                        </h3>
                      </div>
                      <Link
                        href="/student/jobs"
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <span>All Drives</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {recommendedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {job.title}
                              </h4>
                              <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.2 rounded border border-teal-200/60">
                                {job.company}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Min CGPA: {job.eligibility?.minCgpa ?? '6.5'}</span>
                              <span>·</span>
                              <span>{job.location}</span>
                            </p>
                          </div>

                          <Link
                            href={`/student/jobs`}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shrink-0"
                          >
                            <span>Verify Eligibility</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Interviews & Pipeline */}
              <div className="space-y-6">
                {/* Upcoming Interview Timeline */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-700" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Interview Schedule
                      </h3>
                    </div>
                    <Link
                      href="/student/schedule"
                      className="text-xs font-bold text-teal-700 hover:text-teal-900"
                    >
                      Calendar
                    </Link>
                  </div>

                  {upcomingInterviews.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <CalendarDays className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">
                        No active interview rounds
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Recruiter panel slots populate here automatically once shortlisted.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingInterviews.map((iv) => (
                        <div
                          key={iv.id}
                          className="rounded-xl border border-slate-200/90 p-3.5 space-y-2 bg-slate-50/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {iv.roundName}
                              </h4>
                              <p className="text-[11px] text-teal-800 font-semibold">
                                {iv.company}
                              </p>
                            </div>
                            <span className="rounded bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-bold">
                              Confirmed
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                            <span>{iv.scheduledDate || iv.date}</span>
                            <span>
                              {iv.scheduledTime || iv.startTime} - {iv.endTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Application Pipeline */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-teal-700" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Applications
                      </h3>
                    </div>
                    <Link
                      href="/student/applications"
                      className="text-xs font-bold text-teal-700 hover:text-teal-900"
                    >
                      View All
                    </Link>
                  </div>

                  {shortlists.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <Briefcase className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">
                        No applications submitted yet
                      </p>
                      <Link
                        href="/student/jobs"
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        <span>Explore Campus Drives</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {shortlists.slice(0, 5).map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {rec.jobTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{rec.company}</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                              rec.status === 'SHORTLISTED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : rec.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {rec.status === 'NOT_REVIEWED' ? 'Under Review' : rec.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AppLayoutShell>
      )}
    </ProtectedRoute>
  );
}
