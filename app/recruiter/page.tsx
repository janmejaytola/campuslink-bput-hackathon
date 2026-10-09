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
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
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
    { name: 'Job Requisitions', count: openJobs, label: 'Active Openings', color: 'teal' },
    { name: 'Eligible Candidates', count: shortlists.length, label: 'Gated by Rules', color: 'sky' },
    { name: 'Shortlisted Pool', count: shortlistedTotal, label: 'Interview Ready', color: 'emerald' },
    { name: 'Panel Interviews', count: scheduledInterviews, label: '0 Clashes', color: 'indigo' },
  ];

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        {/* Recruiter ATS Header Banner */}
        <div className="rounded-3xl border border-slate-800 bg-[#0B0F19] p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          {/* Subtle background ambient mesh */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#0EA5E9 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-sky-950 border border-sky-800/80 px-2 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-tight">
                  CORPORATE ATS COMMAND
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-200 font-semibold">
                  {currentUser?.company || 'Corporate Hiring Partner'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">BPUT Placement Drive 2026</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Requisition & Candidate Pipeline
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Parse job descriptions into deterministic rules, evaluate explainable candidate rankings, and book clash-free interview slots with automated conflict detection.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/recruiter/jobs/new?tab=upload"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors shadow-2xs"
                >
                  <Upload className="h-3.5 w-3.5 text-sky-400" />
                  <span>Parse JD with AI</span>
                </Link>
                <Link
                  href="/recruiter/jobs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Requisition</span>
                </Link>
              </div>
            </div>

            {/* Stage Summary Pill Strip */}
            <div className="hidden sm:grid grid-cols-2 gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shrink-0 backdrop-blur-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Active Requisitions
                </span>
                <p className="text-xl font-black text-white font-mono tabular-nums">{openJobs}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400">
                  Shortlisted Total
                </span>
                <p className="text-xl font-black text-sky-300 font-mono tabular-nums">
                  {shortlistedTotal}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Candidate Pool
                </span>
                <p className="text-xl font-black text-emerald-300 font-mono tabular-nums">
                  {shortlists.length}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400">
                  Panel Slots
                </span>
                <p className="text-xl font-black text-teal-300 font-mono tabular-nums">
                  {scheduledInterviews}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Dense ATS Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/recruiter/jobs">
              <StatCard
                label="Active Requisitions"
                value={openJobs}
                subtext={`${totalJobs} total company listings`}
                icon={Briefcase}
                highlight={openJobs > 0}
                accent="sky"
              />
            </Link>

            <Link href="/recruiter/candidates">
              <StatCard
                label="Evaluated Pipeline"
                value={shortlists.length}
                subtext="Matched from BPUT 2026 cohort"
                icon={Users}
                accent="teal"
              />
            </Link>

            <Link href="/recruiter/shortlist">
              <StatCard
                label="Shortlisted Candidates"
                value={shortlistedTotal}
                subtext="Locked with audit snapshots"
                icon={UserCheck}
                highlight={shortlistedTotal > 0}
                accent="emerald"
              />
            </Link>

            <Link href="/recruiter/schedule">
              <StatCard
                label="Confirmed Interview Slots"
                value={scheduledInterviews}
                subtext="0 timetable overlaps guaranteed"
                icon={CalendarDays}
                accent="indigo"
              />
            </Link>
          </div>

          {/* Hiring Workflow Pipeline Strip */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sky-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Candidate Pipeline Progression
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Live Status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pipelineStages.map((stage, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Stage {i + 1}
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                      {stage.count}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 truncate">
                      {stage.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">{stage.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/recruiter/candidates"
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-slate-300 hover:shadow-xs transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Candidate Discovery & Ranking</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Filter by minimum CGPA, eligible disciplines, and inspect multi-factor match rubric scores.
              </p>
            </Link>

            <Link
              href="/recruiter/shortlist"
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-slate-300 hover:shadow-xs transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <UserCheck className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Shortlisting Board</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Record selection or rejection decisions with full audit reasons and score snapshots.
              </p>
            </Link>

            <Link
              href="/recruiter/schedule"
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-slate-300 hover:shadow-xs transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Conflict-Free Scheduler</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Allocate panel slots for shortlisted candidates with clash prevention and alternative recommendations.
              </p>
            </Link>
          </div>

          {/* Active Requisitions Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Job Requisitions</h3>
                <p className="text-xs text-slate-500">
                  Open positions registered with BPUT placement cell
                </p>
              </div>
              <Link
                href="/recruiter/jobs"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>View All Requisitions</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600 mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading requisitions...</p>
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
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Position Title</th>
                      <th className="py-3 px-4">Min CGPA</th>
                      <th className="py-3 px-4">Eligible Branches</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {jobs.slice(0, 6).map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold text-xs">
                            {job.title}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {job.location} · {job.employmentType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 tabular-nums">
                          {job.eligibility?.minCgpa ?? 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {job.eligibility?.branches?.join(', ') || 'All Disciplines'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              job.status === 'OPEN' ? 'text-emerald-700' : 'text-slate-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                job.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/recruiter/jobs/${job.id}/matches`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                            >
                              <span>Rank Candidates</span>
                              <ChevronRight className="h-3 w-3 text-slate-400" />
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
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
