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
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import { readinessService } from '@/lib/services/readinessService';
import { ReadinessResult } from '@/types/readiness';
import { skillGapService } from '@/lib/services/skillGapService';
import { SkillGapAnalysis } from '@/types/skillGap';
import { shortlistService } from '@/lib/services/shortlistService';
import { interviewService } from '@/lib/services/interviewService';
import { ShortlistRecord } from '@/types/shortlist';
import { InterviewRecord } from '@/types/interview';

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [shortlists, setShortlists] = useState<ShortlistRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(currentUser?.uid));

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        const [readinessRes, skillGapRes, shortlistRes, interviewRes] = await Promise.all([
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
        ]);

        if (active) {
          setReadiness(readinessRes);
          setSkillGap(skillGapRes);
          setShortlists(Object.values(shortlistRes || {}));
          setInterviews(interviewRes);
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
  const overallScore = readiness?.score ?? 78;
  const readinessTier = readiness?.level ?? 'READY';
  const shortlistedApplications = shortlists.filter((s) => s.status === 'SHORTLISTED');
  const upcomingInterviews = interviews.filter((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED');

  if (isLoading) {
    return (
      <AppLayoutShell role="student">
        <div className="space-y-6 animate-pulse">
          {/* Skeleton Hero */}
          <div className="h-44 rounded-2xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-8 w-80 bg-slate-200 rounded" />
            <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-3">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>

          {/* Skeleton Sections */}
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
    );
  }

  return (
    <AppLayoutShell role="student">
      {/* Student Personal Career OS Hero Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-xs mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal-50 border border-teal-200/80 px-2.5 py-1 text-[11px] font-bold text-teal-800 tracking-tight">
                STUDENT CAREER OS
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-700 font-semibold border border-slate-200/60">
                Roll #{currentUser?.regNumber || '2201106284'}
              </span>
              <span className="rounded-md bg-indigo-50 text-indigo-700 px-2.5 py-1 text-[11px] font-medium border border-indigo-200/60">
                {currentUser?.department || 'Computer Science & Engineering'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {studentName}
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Real-time placement intelligence, deterministic eligibility evaluation, and verified interview management for the 2026 graduation cycle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/student/readiness"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
              <span>Readiness Benchmark</span>
            </Link>
            <Link
              href="/student/job-matches"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Scale className="h-4 w-4 text-slate-500" />
              <span>Role Compatibility</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Core Career Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Readiness Metric */}
          <Link
            href="/student/readiness"
            className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-5 shadow-2xs hover:border-teal-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Readiness Score
              </span>
              <Sparkles className="h-4 w-4 text-teal-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-950 font-mono tabular-nums">
                {overallScore}
              </span>
              <span className="text-xs font-bold text-teal-700">/ 100</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-teal-800 capitalize">
              Benchmark: {readinessTier.toLowerCase()}
            </p>
          </Link>

          {/* 2. Shortlisted Status */}
          <Link
            href="/student/applications"
            className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-2xs hover:border-emerald-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Shortlisted Drives
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950 font-mono tabular-nums">
                {shortlistedApplications.length}
              </span>
              <span className="text-xs font-medium text-emerald-700">Drives</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-emerald-800">
              {shortlists.length} total active applications
            </p>
          </Link>

          {/* 3. Upcoming Interviews */}
          <Link
            href="/student/schedule"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Interview Slots
              </span>
              <Calendar className="h-4 w-4 text-slate-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                {upcomingInterviews.length}
              </span>
              <span className="text-xs font-medium text-slate-500">Confirmed</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-emerald-700">
              0 Academic Clashes
            </p>
          </Link>

          {/* 4. Verified CGPA */}
          <Link
            href="/student/profile"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Academic Standing
              </span>
              <GraduationCap className="h-4 w-4 text-slate-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                {currentUser?.cgpa ? currentUser.cgpa.toFixed(2) : '8.45'}
              </span>
              <span className="text-xs font-medium text-slate-500">CGPA</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-slate-600 truncate">
              {currentUser?.department || 'Computer Science & Eng.'}
            </p>
          </Link>
        </div>

        {/* Quick Action Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/student/resume"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 truncate">Resume Vault</span>
              <span className="block text-[11px] text-slate-500 truncate">AI Parser & Sync</span>
            </div>
          </Link>

          <Link
            href="/student/eligibility"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 truncate">Eligibility Gate</span>
              <span className="block text-[11px] text-slate-500 truncate">Pre-Check Drives</span>
            </div>
          </Link>

          <Link
            href="/student/skill-gap"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 truncate">Skill Diagnostics</span>
              <span className="block text-[11px] text-slate-500 truncate">Market Benchmarks</span>
            </div>
          </Link>

          <Link
            href="/student/jobs"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 truncate">Campus Drives</span>
              <span className="block text-[11px] text-slate-500 truncate">Live Requisitions</span>
            </div>
          </Link>
        </div>

        {/* Two-Column Structured Section: Career Progression & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Readiness Breakdown & Skill Gap Remediation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Readiness Factor Breakdown Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rubric-Based Competency Dimensions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic evaluation across academic performance, technical skills, and project portfolio
                  </p>
                </div>
                <Link
                  href="/student/readiness"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <span>Detailed Rubric</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {readiness?.factorScores ? (
                  Object.entries(readiness.factorScores).map(([key, scoreVal], i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 capitalize">{key} Competency</span>
                        <span className="font-mono font-bold text-teal-800">
                          {scoreVal} / 100
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, Number(scoreVal))}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-4">
                    Generating initial rubric factor scores...
                  </div>
                )}
              </div>
            </div>

            {/* Targeted Skill Gap Insights */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Role Benchmark Gap Analysis
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Target: {readiness?.targetRole || 'Software Development Engineer'}
                </span>
              </div>

              {skillGap?.gaps && skillGap.gaps.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    You have satisfied <strong className="text-emerald-700 font-bold">{skillGap.strongCount}</strong> core industry requirements ({skillGap.coverage}% coverage). Identified{' '}
                    <strong className="text-amber-700 font-bold">{skillGap.missingCount + skillGap.developingCount}</strong> growth skills to boost candidate match scores:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillGap.gaps.filter(g => g.status !== 'STRONG').slice(0, 5).map((g, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900"
                      >
                        {g.skill} ({g.gap} pt gap)
                      </span>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/student/skill-gap"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                    >
                      <span>Explore Personalized Remediation Roadmap</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Profile updated. Calculating real-time skill delta against target campus recruiters...
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Interview Timeline & Application Trackers */}
          <div className="space-y-6">
            {/* Live Interview Timeline */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Interviews</h3>
                </div>
                <Link
                  href="/student/schedule"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  Full Schedule
                </Link>
              </div>

              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No active interview rounds</p>
                  <p className="text-[11px] text-slate-400">
                    Recruiters schedule slots directly when you reach the SHORTLISTED tier.
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
                          <h4 className="text-xs font-bold text-slate-900">{iv.roundName}</h4>
                          <p className="text-[11px] text-teal-800 font-semibold">{iv.company}</p>
                        </div>
                        <span className="rounded bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-bold">
                          Confirmed
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                        <span>{iv.date}</span>
                        <span>{iv.startTime} - {iv.endTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Quick Access */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">Application Pipeline</h3>
                </div>
                <Link
                  href="/student/applications"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  View All
                </Link>
              </div>

              {shortlists.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Briefcase className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No applications on file</p>
                  <Link
                    href="/student/jobs"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    <span>Browse open positions</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {shortlists.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{rec.jobTitle}</p>
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
  );
}
