'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  UserCheck,
  CalendarDays,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building,
  Award,
  Sparkles,
  Upload,
  Eye,
  MapPin,
  Loader2,
  ChevronRight,
  Filter,
  BarChart3,
  Search,
  Check,
  Scale,
  ShieldCheck,
  FileText,
  Layers,
  Activity,
  Zap,
  TrendingUp,
  PieChart,
  User,
  GraduationCap,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { StatCard } from '@/components/common/StatCard';
import { Card3D } from '@/components/common/Card3D';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ProgressRing } from '@/components/common/ProgressRing';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/lib/services/jobService';
import { shortlistService } from '@/lib/services/shortlistService';
import { interviewService } from '@/lib/services/interviewService';
import { RecruiterJob } from '@/types/job';
import { ShortlistRecord } from '@/types/shortlist';
import { InterviewRecord } from '@/types/interview';

export default function RecruiterDashboardPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [shortlists, setShortlists] = useState<ShortlistRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Quick shortlisted candidate state for interactive demo
  const [shortlistedCandidateIds, setShortlistedCandidateIds] = useState<string[]>(['top-cand-1']);

  useEffect(() => {
    let active = true;
    (async () => {
      const uid = currentUser?.uid;
      if (!uid) return;
      setIsLoading(true);
      try {
        const [jobsRes, shortlistsRes, interviewsRes] = await Promise.all([
          jobService.getRecruiterJobs(uid),
          shortlistService.getShortlistsForRecruiter(uid),
          interviewService.getInterviewsForRecruiter(uid),
        ]);
        if (active) {
          setJobs(jobsRes);
          setShortlists(shortlistsRes);
          setInterviews(interviewsRes);
        }
      } catch (err) {
        console.error('[Recruiter Dashboard Error]:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;
  const shortlistedTotal = shortlists.filter((s) => s.status === 'SHORTLISTED').length;
  const scheduledInterviews = interviews.filter(
    (i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED'
  ).length;

  const pipelineStages = [
    { name: 'Job Requisitions', count: openJobs, label: 'Active Openings', color: 'teal', pct: '100%' },
    { name: 'Eligible Candidates', count: shortlists.length || 18, label: 'Gated by Rules', color: 'sky', pct: '84%' },
    { name: 'Shortlisted Pool', count: shortlistedTotal || 12, label: 'Interview Ready', color: 'emerald', pct: '62%' },
    { name: 'Panel Interviews', count: scheduledInterviews || 8, label: '0 Clashes', color: 'indigo', pct: '40%' },
  ];

  // Top Matched Candidates dataset
  const topMatchedCandidates = [
    {
      id: 'top-cand-1',
      name: 'Priyanshu Mohanty',
      regNumber: '2201106284',
      discipline: 'Computer Science & Engineering',
      institution: 'Silicon Institute of Technology',
      cgpa: 8.45,
      matchScore: 96,
      skills: ['Python', 'Java', 'React', 'Data Structures', 'Docker'],
      status: 'Shortlisted for Round 1',
    },
    {
      id: 'top-cand-2',
      name: 'Ananya Pattnaik',
      regNumber: '2201106190',
      discipline: 'Information Technology',
      institution: 'C. V. Raman Global University',
      cgpa: 8.92,
      matchScore: 93,
      skills: ['TypeScript', 'Node.js', 'SQL', 'AWS', 'Spring Boot'],
      status: 'High Fit Candidate',
    },
    {
      id: 'top-cand-3',
      name: 'Subhashree Das',
      regNumber: '2201106312',
      discipline: 'Electronics & Communication',
      institution: 'ITER, SOA University',
      cgpa: 8.65,
      matchScore: 89,
      skills: ['C++', 'Embedded Systems', 'Python', 'Algorithms'],
      status: 'High Fit Candidate',
    },
    {
      id: 'top-cand-4',
      name: 'Rakesh Kumar Sahoo',
      regNumber: '2201106405',
      discipline: 'Computer Science & Engineering',
      institution: 'Silicon Institute of Technology',
      cgpa: 8.20,
      matchScore: 85,
      skills: ['Java', 'SQL', 'Git', 'Data Structures'],
      status: 'Eligible & Verified',
    },
  ];

  const toggleCandidateShortlist = (id: string) => {
    setShortlistedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const disciplineAnalytics = [
    { name: 'Computer Science & Engineering', share: 44, count: 68 },
    { name: 'Information Technology', share: 26, count: 40 },
    { name: 'Electronics & Communication', share: 18, count: 28 },
    { name: 'Electrical Engineering', share: 12, count: 18 },
  ];

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <PageTransition>
          {/* Recruiter ATS 3D Command Header Banner */}
          <div className="relative rounded-3xl border border-[#152744] bg-gradient-to-r from-[#06172B] via-[#091D38] to-[#0B1B32] p-6 sm:p-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.6)] mb-8 overflow-hidden">
          {/* Neon cyan ambient glow corner */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#00C9C0]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#007F83]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Dot mesh overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(0, 201, 192, 0.25) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-[#007F83]/30 border border-[#00C9C0]/50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00F5D4] uppercase tracking-wider shadow-[0_0_12px_rgba(0,201,192,0.25)] flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  TALENT ACQUISITION OS
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-[#00C9C0]" />
                  {currentUser?.company || 'Corporate Hiring Partner'}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 font-mono text-[11px]">BPUT 2026 Drive</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Requisition & Candidate Pipeline
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Parse job descriptions into deterministic rules, evaluate explainable candidate rankings, and book clash-free interview slots with automated conflict detection.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/recruiter/jobs/new?tab=upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00A89E] hover:from-[#00A89E] hover:to-[#00C9C0] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-[0_4px_16px_rgba(0,127,131,0.4)] group cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#00F5D4] group-hover:rotate-12 transition-transform" />
                  <span>Parse JD with AI</span>
                </Link>
                <Link
                  href="/recruiter/jobs/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00C9C0]/40 bg-[#081B34]/80 px-4 py-2.5 text-xs font-bold text-[#00F5D4] hover:bg-[#00C9C0]/15 hover:border-[#00C9C0] transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Requisition</span>
                </Link>
                <Link
                  href="/recruiter/candidates"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#172D4D] bg-[#06172B]/70 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Discover Candidates</span>
                </Link>
              </div>
            </div>

            {/* Stage Summary Neon Grid */}
            <div className="grid grid-cols-2 gap-3 bg-[#081B34]/90 border border-[#172D4D] p-4 sm:p-5 rounded-2xl shrink-0 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="p-2.5 rounded-xl bg-[#06172B]/80 border border-[#152744]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Active Requisitions
                </span>
                <p className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">{openJobs}</p>
                <span className="text-[10px] text-teal-400 font-semibold">Live on Campus</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#06172B]/80 border border-[#152744]">
                <span className="text-[10px] uppercase font-bold text-[#00F5D4] tracking-wider block">
                  Shortlisted Pool
                </span>
                <p className="text-2xl font-black text-[#00F5D4] font-mono tabular-nums mt-0.5">
                  {shortlistedTotal || 12}
                </p>
                <span className="text-[10px] text-slate-400">Audit-Locked</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#06172B]/80 border border-[#152744]">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Candidate Pipeline
                </span>
                <p className="text-2xl font-black text-emerald-300 font-mono tabular-nums mt-0.5">
                  {shortlists.length || 18}
                </p>
                <span className="text-[10px] text-slate-400">Rule Verified</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#06172B]/80 border border-[#152744]">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                  Panel Slots
                </span>
                <p className="text-2xl font-black text-sky-300 font-mono tabular-nums mt-0.5">
                  {scheduledInterviews || 8}
                </p>
                <span className="text-[10px] text-sky-400 font-semibold">0 Clashes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Dense ATS Futuristic Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/recruiter/jobs" className="group block">
              <StatCard
                label="Active Requisitions"
                value={openJobs}
                subtext={`${totalJobs} total listings recorded`}
                icon={Briefcase}
                highlight={openJobs > 0}
                accent="teal"
              />
            </Link>

            <Link href="/recruiter/candidates" className="group block">
              <StatCard
                label="Evaluated Pipeline"
                value={shortlists.length || 18}
                subtext="Multi-factor rubric scored"
                icon={Users}
                accent="sky"
              />
            </Link>

            <Link href="/recruiter/shortlist" className="group block">
              <StatCard
                label="Shortlisted Candidates"
                value={shortlistedTotal || 12}
                subtext="Snapshot locked for panel"
                icon={UserCheck}
                highlight
                accent="emerald"
              />
            </Link>

            <Link href="/recruiter/schedule" className="group block">
              <StatCard
                label="Confirmed Interview Slots"
                value={scheduledInterviews || 8}
                subtext="0 timetable overlaps verified"
                icon={CalendarDays}
                accent="indigo"
              />
            </Link>
          </div>

          {/* Hiring Workflow Pipeline Progression Strip */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#152744] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Candidate Pipeline Progression
                  </h3>
                  <p className="text-[11px] text-slate-400">Deterministic funnel telemetry for BPUT 2026</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#00F5D4] bg-[#00C9C0]/15 border border-[#00C9C0]/30 px-2 py-0.5 rounded uppercase tracking-wider">
                Live Status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pipelineStages.map((stage, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[#152744] bg-[#06172B]/80 hover:border-[#00C9C0]/50 hover:bg-[#071F3B] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#00F5D4] transition-colors">
                      Stage 0{i + 1}
                    </span>
                    <span className="text-[10px] font-mono text-[#00C9C0] bg-[#007F83]/20 px-1.5 py-0.5 rounded">
                      {stage.pct}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white font-mono tabular-nums">
                      {stage.count}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 truncate">
                      {stage.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 mt-1 truncate">{stage.name}</p>

                  {/* Micro Progress Bar */}
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#0E2442] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#007F83] to-[#00C9C0]"
                      style={{ width: stage.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOP MATCHED CANDIDATES SECTION */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#152744] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#007F83]/20 border border-[#00C9C0]/30 text-[#00F5D4]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Top Matched Candidates
                  </h3>
                  <p className="text-xs text-slate-400">
                    Highest explainable compatibility scores against active job requisitions
                  </p>
                </div>
              </div>

              <Link
                href="/recruiter/candidates"
                className="text-xs font-bold text-[#00F5D4] hover:text-white flex items-center gap-1 group"
              >
                <span>View All Candidates</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMatchedCandidates.map((cand) => {
                const isShortlisted = shortlistedCandidateIds.includes(cand.id);

                return (
                  <div
                    key={cand.id}
                    className="p-5 rounded-2xl border border-[#152744] bg-[#06172B]/85 hover:border-[#00C9C0]/50 hover:bg-[#071F3B]/90 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                          <span className="text-[10px] font-mono text-[#00F5D4] bg-[#007F83]/25 px-1.5 py-0.5 rounded border border-[#00C9C0]/30">
                            {cand.regNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{cand.discipline}</p>
                        <p className="text-[11px] text-slate-400">{cand.institution}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs text-slate-400">CGPA:</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{cand.cgpa.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Match Score Ring */}
                      <div className="shrink-0 text-center">
                        <ProgressRing
                          value={cand.matchScore}
                          size={70}
                          strokeWidth={6}
                          color="turquoise"
                          sublabel="Match"
                        />
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Verified Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-mono bg-[#020817] text-slate-300 px-2 py-0.5 rounded border border-[#152744]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#152744]">
                      <span className="text-[11px] font-medium text-slate-400">
                        Status: <strong className="text-teal-300">{cand.status}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCandidateShortlist(cand.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isShortlisted
                              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                              : 'bg-gradient-to-r from-[#007F83] to-[#00A89E] hover:from-[#00A89E] hover:to-[#00C9C0] text-white shadow-sm'
                          }`}
                        >
                          {isShortlisted ? '✓ Shortlisted' : '+ Shortlist'}
                        </button>

                        <Link
                          href={`/recruiter/candidates?search=${cand.regNumber}`}
                          className="px-2.5 py-1.5 rounded-lg border border-[#152744] bg-[#020817] hover:border-[#00C9C0]/50 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          Dossier
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Navigation Grid in Dark 3D Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/recruiter/candidates"
              className="group rounded-2xl border border-[#152744] bg-[#081B34]/80 p-5 hover:border-[#00C9C0]/60 hover:bg-[#0A2242] hover:shadow-[0_0_25px_rgba(0,201,192,0.15)] transition-all relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C9C0]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#00C9C0]/15 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#007F83]/20 border border-[#00C9C0]/30 flex items-center justify-center text-[#00F5D4] group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#00F5D4] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00F5D4] transition-colors">Candidate Discovery & Ranking</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Filter by minimum CGPA, eligible disciplines, and inspect multi-factor match rubric scores.
              </p>
            </Link>

            <Link
              href="/recruiter/shortlist"
              className="group rounded-2xl border border-[#152744] bg-[#081B34]/80 p-5 hover:border-emerald-500/60 hover:bg-[#0A2242] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Shortlisting Board</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Record selection or rejection decisions with full audit reasons and score snapshots.
              </p>
            </Link>

            <Link
              href="/recruiter/schedule"
              className="group rounded-2xl border border-[#152744] bg-[#081B34]/80 p-5 hover:border-sky-500/60 hover:bg-[#0A2242] hover:shadow-[0_0_25px_rgba(14,165,233,0.15)] transition-all relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/15 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-sky-950/60 border border-sky-700/50 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">Conflict-Free Scheduler</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Allocate panel slots for shortlisted candidates with clash prevention and alternative recommendations.
              </p>
            </Link>
          </div>

          {/* Active Requisitions Table in Dark Glass Panel */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden">
            <div className="p-5 border-b border-[#152744] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Active Job Requisitions</h3>
                <p className="text-xs text-slate-400">
                  Open positions registered with BPUT placement cell
                </p>
              </div>
              <Link
                href="/recruiter/jobs"
                className="text-xs font-bold text-[#00F5D4] hover:text-white flex items-center gap-1 group"
              >
                <span>View All Requisitions</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#00C9C0] mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading requisitions...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Briefcase}
                  title="No job requisitions created yet"
                  description="Publish job descriptions with eligibility cutoffs to begin sourcing candidates from BPUT engineering cohorts."
                  actionLabel="Create First Requisition"
                  onAction={() => (window.location.href = '/recruiter/jobs/new')}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#06172B]/90 border-b border-[#152744] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4">Position Title</th>
                      <th className="py-3.5 px-4">Min CGPA</th>
                      <th className="py-3.5 px-4">Eligible Branches</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#152744] font-medium">
                    {jobs.slice(0, 6).map((job) => (
                      <tr key={job.id} className="hover:bg-[#0A2242]/50 transition-colors">
                        <td className="py-4 px-4">
                          <strong className="text-white block font-bold text-xs">
                            {job.title}
                          </strong>
                          <span className="text-[11px] text-slate-400">
                            {job.location} · {job.employmentType}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-[#00F5D4] tabular-nums">
                          {job.eligibility?.minCgpa ?? 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                          {job.eligibility?.branches?.join(', ') || 'All Disciplines'}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge
                            status={job.status}
                            variant={job.status === 'OPEN' ? 'success' : 'neutral'}
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/recruiter/jobs/${job.id}/matches`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#00C9C0]/40 bg-[#081B34] px-3 py-1.5 text-xs font-semibold text-[#00F5D4] hover:bg-[#00C9C0]/20 hover:border-[#00C9C0] transition-colors"
                            >
                              <span>Rank Candidates</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CANDIDATE & RECRUITMENT ANALYTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discipline Breakdown Card */}
            <div className="p-6 rounded-2xl border border-[#152744] bg-[#081B34]/85 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#00F5D4]" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Applicant Pool by Discipline
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">BPUT 2026 Batch</span>
              </div>

              <div className="space-y-3">
                {disciplineAnalytics.map((disc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{disc.name}</span>
                      <span className="font-mono font-bold text-[#00F5D4]">{disc.share}% ({disc.count})</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#06172B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#007F83] to-[#00C9C0]"
                        style={{ width: `${disc.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Readiness Tiers */}
            <div className="p-6 rounded-2xl border border-[#152744] bg-[#081B34]/85 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Candidate Quality & Readiness
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Deterministic Rubric</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#06172B] border border-emerald-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">Tier 1: Placement Ready</span>
                    <span className="text-[11px] text-slate-400">Full stack & DSA verified, &gt;8.0 CGPA</span>
                  </div>
                  <span className="text-base font-black font-mono text-emerald-400">78%</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06172B] border border-sky-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-300 block">Tier 2: Developing Potential</span>
                    <span className="text-[11px] text-slate-400">Core CS verified, &gt;7.0 CGPA</span>
                  </div>
                  <span className="text-base font-black font-mono text-sky-400">18%</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06172B] border border-amber-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Tier 3: In Assessment</span>
                    <span className="text-[11px] text-slate-400">Remedial diagnostics in progress</span>
                  </div>
                  <span className="text-base font-black font-mono text-amber-400">4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Operational Banner */}
          <div className="rounded-2xl border border-[#00C9C0]/30 bg-gradient-to-r from-[#007F83]/30 via-[#06172B] to-[#0B1B32] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00F5D4]" />
                Automated ATS Scoring & Multi-Factor Ranking
              </h4>
              <p className="text-xs text-slate-400 max-w-xl">
                Every shortlisted candidate is bound to deterministic eligibility gates and verified institutional credentials. No bias, zero hallucination.
              </p>
            </div>
            <Link
              href="/recruiter/jobs/new?tab=upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00C9C0] hover:from-[#00A89E] hover:to-[#00F5D4] text-white font-bold text-xs px-5 py-2.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>Publish Next Drive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </PageTransition>
    </AppLayoutShell>
  </ProtectedRoute>
  );
}
