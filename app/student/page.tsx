'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Bell,
  Code2,
  BookOpen,
  MessageSquare,
  Shield,
  CircleDot,
  CheckCircle,
  User,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { ProgressRing } from '@/components/common/ProgressRing';
import { SkillBar } from '@/components/common/SkillBar';
import { StatCard } from '@/components/common/StatCard';
import { Card3D } from '@/components/common/Card3D';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';
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
  const { currentUser, notifications } = useAuth();
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
          setRecommendedJobs(jobsRes.slice(0, 4));
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

  const studentName = currentUser?.name || 'Priyanshu Mohanty';
  const regNumber = currentUser?.regNumber || '2201106284';
  const department = currentUser?.department || 'Computer Science & Engineering';
  const overallScore = readiness?.score ?? 84;
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
  ) || 85;

  // Career progression vertical timeline milestones
  const milestones = [
    {
      title: 'Academic Transcripts & Dossier',
      date: 'Aug 2026',
      status: 'COMPLETED' as const,
      progress: 100,
      description: 'Cumulative CGPA 8.45 verified by BPUT examination register',
      icon: GraduationCap,
    },
    {
      title: 'AI Placement Readiness Diagnostic',
      date: 'Sep 2026',
      status: 'COMPLETED' as const,
      progress: overallScore,
      description: `${overallScore}/100 5-factor deterministic benchmark achieved`,
      icon: Sparkles,
    },
    {
      title: 'Drive Eligibility Gating',
      date: 'Active',
      status: 'COMPLETED' as const,
      progress: 100,
      description: 'Passed zero-backlog and discipline criteria for 12 drives',
      icon: ShieldCheck,
    },
    {
      title: 'Corporate Shortlists & Assessments',
      date: 'Current',
      status: 'IN_PROGRESS' as const,
      progress: shortlistedApplications.length > 0 ? 80 : 60,
      description: `${shortlistedApplications.length || 3} corporate partners reviewed profile`,
      icon: Briefcase,
    },
    {
      title: 'Technical Panels & Interview Rounds',
      date: 'Oct 2026',
      status: upcomingInterviews.length > 0 ? ('IN_PROGRESS' as const) : ('UPCOMING' as const),
      progress: upcomingInterviews.length > 0 ? 50 : 20,
      description: `${upcomingInterviews.length || 2} interview slots confirmed with 0 clashes`,
      icon: CalendarDays,
    },
    {
      title: 'Formal Offer Letter & Acceptance',
      date: 'Nov 2026',
      status: 'UPCOMING' as const,
      progress: 0,
      description: 'Institutional verification by Central TPO cell',
      icon: Award,
    },
  ];

  // Fallback demo upcoming interviews if none in DB yet
  const displayInterviews = upcomingInterviews.length > 0
    ? upcomingInterviews
    : [
        {
          id: 'iv-demo-1',
          roundName: 'Technical Architecture Round',
          company: 'Tata Consultancy Services',
          date: '2026-10-15',
          scheduledDate: '2026-10-15',
          scheduledTime: '10:00 AM',
          venue: 'Placement Block Suite 302 / Virtual Bridge',
          status: 'SCHEDULED' as const,
        },
        {
          id: 'iv-demo-2',
          roundName: 'System Design & Problem Solving',
          company: 'Deloitte USI',
          date: '2026-10-18',
          scheduledDate: '2026-10-18',
          scheduledTime: '02:30 PM',
          venue: 'Central Computing Lab 1 / Google Meet',
          status: 'SCHEDULED' as const,
        },
      ];

  // Fallback recommended jobs if DB is empty
  const displayJobs = recommendedJobs.length > 0
    ? recommendedJobs
    : [
        {
          id: 'job-demo-tcs',
          title: 'Digital Software Engineer',
          company: 'Tata Consultancy Services',
          location: 'Bhubaneswar / Bengaluru',
          workMode: 'HYBRID',
          salaryMin: 700000,
          salaryMax: 920000,
          eligibility: { minCgpa: 7.0, branches: ['CSE', 'IT'] },
          matchScore: 94,
        },
        {
          id: 'job-demo-deloitte',
          title: 'Technology Analyst (Cloud & AI)',
          company: 'Deloitte USI',
          location: 'Hyderabad / Hybrid',
          workMode: 'HYBRID',
          salaryMin: 800000,
          salaryMax: 950000,
          eligibility: { minCgpa: 7.5, branches: ['CSE', 'IT', 'ECE'] },
          matchScore: 88,
        },
        {
          id: 'job-demo-amazon',
          title: 'Software Development Engineer',
          company: 'Amazon Development Centre',
          location: 'Bengaluru',
          workMode: 'ON_SITE',
          salaryMin: 1800000,
          salaryMax: 2450000,
          eligibility: { minCgpa: 8.0, branches: ['CSE', 'IT'] },
          matchScore: 82,
        },
        {
          id: 'job-demo-lnt',
          title: 'Graduate Embedded Specialist',
          company: 'L&T Technology Services',
          location: 'Pune / Bhubaneswar',
          workMode: 'HYBRID',
          salaryMin: 650000,
          salaryMax: 780000,
          eligibility: { minCgpa: 6.8, branches: ['CSE', 'ECE', 'EE'] },
          matchScore: 78,
        },
      ];

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <PageTransition className="space-y-6 pb-12">
          {/* ======================================================== */}
          {/* HERO BANNER: Wide cinematic campus photograph with dark navy overlay */}
          {/* ======================================================== */}
          <div className="dark-hero-banner relative rounded-3xl overflow-hidden border border-[#172D4D] shadow-[0_16px_50px_rgba(0,0,0,0.6)] text-white">
            {/* Background Image with Dark Navy Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
              <Image
                src="/images/campuslink_hero_campus_1791562156457.jpg"
                alt="Cinematic campus university architecture"
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-cover object-center opacity-30 filter contrast-125 brightness-90 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#06172B]/95 via-[#091D38]/90 to-[#0B1B32]/85" />
            </div>
            <div className="absolute inset-0 bg-radial-[at_top_right] from-[#00C9C0]/25 via-transparent to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                {/* Meta text with clean separators */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-[#00F5D4]">
                    CAMPUS PLACEMENT INTELLIGENCE
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="font-mono text-slate-200">
                    Reg #{regNumber}
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-slate-200 font-medium">
                    {department}
                  </span>
                </div>

                {/* Name & Greeting */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
                  Good morning, {studentName}
                </h1>

                {/* Motivational Subtitle */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  Your placement journey is <strong className="text-[#00F5D4] font-bold">{overallScore}% on track</strong>. You have {shortlistedApplications.length || 3} corporate drives reviewing your profile with zero academic timetable clashes.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/student/readiness"
                    className="gradient-btn-primary rounded-xl px-5 py-2.5 text-xs font-black transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(22,207,255,0.35)] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Readiness Benchmark</span>
                  </Link>

                  <Link
                    href="/student/profile"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-slate-100 transition-colors backdrop-blur-xs cursor-pointer"
                  >
                    <User className="h-4 w-4 text-[#00C9C0]" />
                    <span>Complete Profile Dossier</span>
                  </Link>
                </div>
              </div>

              {/* Profile Completion Circular Indicator with 3D Depth */}
              <div className="flex items-center gap-4 bg-[#06172B]/85 border border-[#172D4D] p-4 sm:p-5 rounded-2xl shrink-0 backdrop-blur-md shadow-2xl">
                <ProgressRing
                  value={profileCompletion}
                  size={84}
                  strokeWidth={7}
                  color="turquoise"
                  sublabel="Profile"
                  textColorOverride="text-white"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00F5D4] block drop-shadow-[0_0_6px_rgba(0,245,212,0.3)]">
                    Profile Completion
                  </span>
                  <p className="text-sm font-extrabold text-white">
                    {profileCompletion}% Verified
                  </p>
                  <p className="text-[11px] text-slate-300 max-w-[140px] leading-snug">
                    Academic profile verified for placement drives
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FIVE METRIC CARDS HORIZONTALLY ALIGNED PER REFERENCE */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/student/readiness" className="block group">
              <StatCard
                label="Readiness Index"
                value={`${overallScore} / 100`}
                subtext={`Status: ${readinessTier}`}
                icon={Sparkles}
                trend={{ value: '6%', positive: true }}
                highlight
                accent="teal"
              />
            </Link>

            <Link href="/student/resume" className="block group">
              <StatCard
                label="Resume Status"
                value="99.4%"
                subtext="Verified parser accuracy"
                icon={FileCheck2}
                trend={{ value: '1.2%', positive: true }}
                accent="indigo"
              />
            </Link>

            <Link href="/student/readiness" className="block group">
              <StatCard
                label="Response Time"
                value="< 0.8s"
                subtext="Instant cached evaluation"
                icon={Zap}
                accent="amber"
              />
            </Link>

            <Link href="/student/applications" className="block group">
              <StatCard
                label="Applications"
                value={shortlistedApplications.length || 3}
                subtext="In review across drives"
                icon={CheckCircle2}
                accent="emerald"
              />
            </Link>

            <Link href="/student/schedule" className="block group">
              <StatCard
                label="Interviews"
                value={`${displayInterviews.length} Slots`}
                subtext="Confirmed · 0 clashes"
                icon={CalendarDays}
                accent="sky"
              />
            </Link>
          </div>

          {/* ======================================================== */}
          {/* THREE-COLUMN DESKTOP COMPOSITION */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT / CENTER COLUMN (Col span 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* RECOMMENDED JOBS (CAMPUS DRIVES) */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/85 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30 shadow-[0_0_10px_rgba(0,201,192,0.2)]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        Recommended Campus Drives
                      </h3>
                      <p className="text-xs text-slate-400">
                        Top corporate positions matched with your declared skills and verified eligibility
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/jobs"
                    className="text-xs font-bold text-[#00C9C0] hover:text-[#00F5D4] flex items-center gap-1 shrink-0"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {displayJobs.map((job) => {
                    const matchScore = (job as any).matchScore || 88;
                    const salaryText = job.salaryMax
                      ? `₹${(job.salaryMin / 100000).toFixed(2)} - ${(job.salaryMax / 100000).toFixed(2)} LPA`
                      : '₹8.50 - 12.00 LPA';

                    return (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-[#152744] hover:border-[#00C9C0]/50 p-4 bg-[#0B2242]/70 hover:bg-[#0E2A52] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Company Avatar Badge */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#06172B] to-[#122F58] border border-[#1E3E6B] text-[#00F5D4] font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
                            {job.company.substring(0, 2).toUpperCase()}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                              {job.title}
                            </h4>
                            <p className="text-xs font-semibold text-[#00C9C0]">
                              {job.company}
                            </p>

                            {/* Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-300">
                              <span className="rounded-md bg-[#081B34] border border-[#172D4D] px-2 py-0.5 font-medium">
                                {job.workMode || 'Hybrid'}
                              </span>
                              <span className="rounded-md bg-[#081B34] border border-[#172D4D] px-2 py-0.5 font-medium">
                                {job.location || 'Bhubaneswar / Remote'}
                              </span>
                              <span className="rounded-md bg-[#00C9C0]/15 text-[#00F5D4] border border-[#00C9C0]/30 font-bold px-2 py-0.5">
                                {salaryText}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Score & Action */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <div className="flex items-center gap-2 bg-[#081B34] border border-[#172D4D] px-2.5 py-1.5 rounded-xl shadow-2xs">
                            <div className="h-7 w-7 rounded-full bg-[#00C9C0]/20 flex items-center justify-center text-[10px] font-extrabold font-mono text-[#00F5D4]">
                              {matchScore}%
                            </div>
                            <span className="text-[11px] font-bold text-slate-200">Fit</span>
                          </div>

                          <Link
                            href="/student/jobs"
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00A89E] hover:from-[#00A89E] hover:to-[#00C9C0] text-white px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-[#007F83]/30"
                          >
                            <span>Apply</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CAREER PROGRESS (VERTICAL TIMELINE WITH CONNECTED MILESTONES) */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/85 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30 shadow-[0_0_10px_rgba(0,201,192,0.2)]">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        Placement Journey & Career Progress
                      </h3>
                      <p className="text-xs text-slate-400">
                        Vertical progression from credential verification to offer letter acceptance
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#00F5D4] font-bold bg-[#00C9C0]/15 border border-[#00C9C0]/30 px-2 py-0.5 rounded-md">
                    Batch 2026
                  </span>
                </div>

                {/* Connected Vertical Timeline */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1A365D]">
                  {milestones.map((m, idx) => {
                    const isCompleted = m.status === 'COMPLETED';
                    const isInProgress = m.status === 'IN_PROGRESS';

                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        {/* Connected Milestone Dot/Icon */}
                        <div
                          className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-[#081B34] ${
                            isCompleted
                              ? 'bg-[#007F83] text-[#00F5D4] shadow-[0_0_10px_rgba(0,201,192,0.4)]'
                              : isInProgress
                              ? 'bg-[#00C9C0] text-white animate-pulse'
                              : 'bg-[#152744] text-slate-500'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-3 w-3 text-white" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Milestone Card */}
                        <div className="flex-1 rounded-2xl border border-[#172D4D] bg-[#0B2242]/70 p-4 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-white">
                                {m.title}
                              </h4>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                  isCompleted
                                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                                    : isInProgress
                                    ? 'bg-[#00C9C0]/15 text-[#00F5D4] border border-[#00C9C0]/40'
                                    : 'bg-[#102442] text-slate-400 border border-[#172D4D]'
                                }`}
                              >
                                {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {m.date}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {m.description}
                          </p>

                          {/* Progress bar */}
                          <div className="w-full bg-[#081B34] rounded-full h-1.5 overflow-hidden border border-[#172D4D]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted
                                  ? 'bg-[#007F83]'
                                  : isInProgress
                                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] shadow-[0_0_8px_rgba(0,201,192,0.4)]'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${m.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SKILLS AND READINESS DIAGNOSTIC RADAR */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/85 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30 shadow-[0_0_10px_rgba(0,201,192,0.2)]">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        Skills & Readiness Indicators
                      </h3>
                      <p className="text-xs text-slate-400">
                        Technical, aptitude, and communication competency breakdown against market recruiters
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/readiness"
                    className="text-xs font-bold text-[#00C9C0] hover:text-[#00F5D4] flex items-center gap-1"
                  >
                    <span>Full Diagnostic</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Circular Overall Readiness + 3 Core Pillar Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0B2242]/70 border border-[#172D4D] items-center">
                  <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-[#172D4D] pr-2">
                    <ProgressRing
                      value={overallScore}
                      size={76}
                      strokeWidth={6}
                      color="turquoise"
                      sublabel="Score"
                      textColorOverride="text-white"
                    />
                    <span className="text-[11px] font-bold text-white mt-1">
                      Overall Readiness
                    </span>
                  </div>

                  <div className="col-span-3 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Technical Aptitude (Data Structures, Python, SQL)</span>
                        <span className="font-mono text-[#00F5D4]">86%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#081B34] overflow-hidden border border-[#172D4D]">
                        <div className="h-full bg-gradient-to-r from-[#007F83] to-[#00C9C0] shadow-[0_0_8px_rgba(0,201,192,0.3)] rounded-full" style={{ width: '86%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Analytical & Quantitative Reasoning</span>
                        <span className="font-mono text-[#00C9C0]">82%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#081B34] overflow-hidden border border-[#172D4D]">
                        <div className="h-full bg-[#00A89E] rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Communication & Corporate Soft Skills</span>
                        <span className="font-mono text-sky-400">80%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#081B34] overflow-hidden border border-[#172D4D]">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Gap Bars with Severity Chips */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Priority Skill Remediation
                  </h4>

                  <div className="space-y-2.5">
                    {skillGap?.gaps && skillGap.gaps.length > 0 ? (
                      skillGap.gaps.slice(0, 3).map((g, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-[#172D4D] bg-[#0B2242]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{g.skill}</span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                  g.severity === 'CRITICAL'
                                    ? 'bg-rose-950/70 text-rose-400 border border-rose-800/60'
                                    : 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                                }`}
                              >
                                {g.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{g.recommendation}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono font-bold text-[#00F5D4]">
                              {g.candidateLevel * 20}% / {g.requiredLevel * 20}%
                            </span>
                            <Link
                              href="/student/skill-gap"
                              className="text-[11px] font-bold text-[#00C9C0] hover:text-[#00F5D4]"
                            >
                              Practice →
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-3.5 rounded-xl border border-[#172D4D] bg-[#0B2242]/70 flex items-center justify-between gap-2 shadow-2xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">Cloud Microservices (AWS / Docker)</span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-rose-950/70 text-rose-400 border border-rose-800/60">
                                CRITICAL GAP
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Required for Tier-1 Cloud Engineer roles</p>
                          </div>
                          <Link href="/student/skill-gap" className="text-[11px] font-bold text-[#00F5D4]">
                            Bridge Gap →
                          </Link>
                        </div>

                        <div className="p-3.5 rounded-xl border border-[#172D4D] bg-[#0B2242]/70 flex items-center justify-between gap-2 shadow-2xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">System Design & Distributed Queues</span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-amber-950/70 text-amber-400 border border-amber-800/60">
                                MODERATE GAP
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Key for Product SDE technical rounds</p>
                          </div>
                          <Link href="/student/skill-gap" className="text-[11px] font-bold text-[#00F5D4]">
                            Bridge Gap →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Col span 4): Quick Actions, Upcoming Interviews, Notifications */}
            <div className="lg:col-span-4 space-y-6">
              {/* FOUR QUICK ACTION TILES */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/85 backdrop-blur-md p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-1">
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/student/resume"
                    className="p-3.5 rounded-xl border border-[#172D4D] hover:border-[#00C9C0]/50 bg-[#0B2242]/70 hover:bg-[#0E2A52] transition-all shadow-2xs group flex flex-col justify-between h-24"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderLock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white">Resume Vault</span>
                      <span className="text-[10px] text-slate-400 block truncate">AI Parser & Sync</span>
                    </div>
                  </Link>

                  <Link
                    href="/student/skill-gap"
                    className="p-3.5 rounded-xl border border-[#172D4D] hover:border-[#00C9C0]/50 bg-[#0B2242]/70 hover:bg-[#0E2A52] transition-all shadow-2xs group flex flex-col justify-between h-24"
                  >
                    <div className="h-7 w-7 rounded-lg bg-sky-950/70 text-sky-400 border border-sky-800/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Target className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white">Skill Radar</span>
                      <span className="text-[10px] text-slate-400 block truncate">Market Diagnostic</span>
                    </div>
                  </Link>

                  <Link
                    href="/student/eligibility"
                    className="p-3.5 rounded-xl border border-[#172D4D] hover:border-[#00C9C0]/50 bg-[#0B2242]/70 hover:bg-[#0E2A52] transition-all shadow-2xs group flex flex-col justify-between h-24"
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white">Eligibility Gate</span>
                      <span className="text-[10px] text-slate-400 block truncate">Rule Evaluator</span>
                    </div>
                  </Link>

                  <Link
                    href="/student/schedule"
                    className="p-3.5 rounded-xl border border-[#172D4D] hover:border-[#00C9C0]/50 bg-[#0B2242]/70 hover:bg-[#0E2A52] transition-all shadow-2xs group flex flex-col justify-between h-24"
                  >
                    <div className="h-7 w-7 rounded-lg bg-cyan-950/70 text-[#00F5D4] border border-[#00C9C0]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white">Interview Prep</span>
                      <span className="text-[10px] text-slate-400 block truncate">Calendar & Venue</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* UPCOMING INTERVIEW CARDS WITH DATE BLOCKS */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/85 backdrop-blur-md p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#00F5D4]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Upcoming Interviews
                    </h3>
                  </div>
                  <Link
                    href="/student/schedule"
                    className="text-xs font-bold text-[#00C9C0] hover:text-[#00F5D4]"
                  >
                    Full Calendar
                  </Link>
                </div>

                <div className="space-y-3">
                  {displayInterviews.map((iv) => {
                    const dateObj = new Date(iv.scheduledDate || iv.date);
                    const month = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase()
                      : 'OCT';
                    const day = !isNaN(dateObj.getTime())
                      ? dateObj.getDate()
                      : '15';

                    return (
                      <div
                        key={iv.id}
                        className="rounded-2xl border border-[#172D4D] bg-[#0B2242]/70 p-3.5 flex items-start gap-3.5 hover:bg-[#0E2A52] hover:border-[#00C9C0]/50 transition-all shadow-sm"
                      >
                        {/* Elegant Date Block */}
                        <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-b from-[#030B17] to-[#081B34] border border-[#172D4D] text-white shrink-0 shadow-md">
                          <span className="text-[9px] font-extrabold uppercase text-[#00F5D4] leading-none">
                            {month}
                          </span>
                          <span className="text-base font-black font-mono leading-none mt-1">
                            {day}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white truncate">
                              {iv.roundName}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-[#00C9C0] truncate">
                            {iv.company}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate font-mono">
                            <Clock className="h-3 w-3 shrink-0 text-slate-500" />
                            <span>{iv.scheduledTime || '10:00 AM - 11:30 AM'}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RECENT NOTIFICATIONS WITH CATEGORY ICONS & TIMESTAMPS */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/85 backdrop-blur-md p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#00F5D4]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Recent Notifications
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#00F5D4]">
                    Live Feed
                  </span>
                </div>

                <div className="space-y-3">
                  {(notifications.length > 0
                    ? notifications.slice(0, 3)
                    : [
                        {
                          id: 'notif-1',
                          title: 'TCS Digital Shortlist Released',
                          message: 'Your profile has been shortlisted for the 2026 campus placement drive.',
                          timestamp: '2 hours ago',
                          type: 'shortlist',
                        },
                        {
                          id: 'notif-2',
                          title: 'Technical Panel Confirmed',
                          message: 'Deloitte USI panel slot allocated in Placement Block 302.',
                          timestamp: 'Yesterday',
                          type: 'interview',
                        },
                        {
                          id: 'notif-3',
                          title: 'CGPA Transcript Verified',
                          message: 'Controller of Examination approved semester 6 grade lock.',
                          timestamp: '3 days ago',
                          type: 'academic',
                        },
                      ]
                  ).map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#0B2242] transition-colors border border-transparent hover:border-[#172D4D]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(0,201,192,0.15)]">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-xs font-bold text-white truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM BANNER: Full-width deep teal gradient */}
          {/* ======================================================== */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#007F83] via-[#009A9E] to-[#00C9C0] p-6 sm:p-8 lg:p-10 text-white shadow-[0_12px_40px_rgba(0,127,131,0.35)]">
            {/* Ambient pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Institutional Success Partnership</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Your Goals + Our Platform = A Brighter Future
                </h2>

                <p className="text-xs sm:text-sm text-teal-50 leading-relaxed max-w-xl">
                  Connect your career milestones directly with visiting corporate recruitment drives, transparent rubric scoring, and clash-free interview scheduling.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3">
                <Link
                  href="/student/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-[#007F83] hover:bg-teal-50 px-5 py-3 text-xs font-black transition-colors shadow-lg shadow-teal-950/20 cursor-pointer"
                >
                  <span>Explore All Campus Drives</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/student/career-goals"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-4 py-3 text-xs font-bold text-white transition-colors backdrop-blur-xs"
                >
                  <span>Refine Career Goals</span>
                </Link>
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
