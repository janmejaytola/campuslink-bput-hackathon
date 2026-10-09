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
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
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
  const scheduledInterviews = interviews.filter((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED').length;

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        {/* Recruiter Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-900 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5">
                ATS WORKSPACE
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {currentUser?.company || 'Corporate Talent Partner'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Recruitment Operations & Pipeline Console
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage requisitions, evaluate candidate matching breakdowns, shortlist qualified engineers, and book conflict-free interview rounds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/recruiter/jobs/new?tab=upload"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 text-teal-600" />
              <span>Parse JD</span>
            </Link>
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Job Requisition</span>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* Dense ATS Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Active Job Requisitions
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {openJobs}
                </span>
                <span className="text-xs font-semibold text-teal-700">{totalJobs} total roles</span>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                Candidate Pipeline
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-teal-950 font-mono">
                  {shortlists.length}
                </span>
                <span className="text-xs font-semibold text-teal-700">Ranked Pool</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                Shortlisted Candidates
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-950 font-mono">
                  {shortlistedTotal}
                </span>
                <span className="text-xs font-semibold text-emerald-700">Eligible Gated</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Clash-Free Interview Slots
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {scheduledInterviews}
                </span>
                <span className="text-xs font-semibold text-slate-500">0 Overlaps</span>
              </div>
            </div>
          </div>

          {/* Quick Access Pipeline Stages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/recruiter/candidates"
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <Users className="h-5 w-5 text-teal-600" />
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Candidate Search & Ranking</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Filter by minimum CGPA, eligible branches, and examine deterministic match breakdown scores.
              </p>
            </Link>

            <Link
              href="/recruiter/shortlist"
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <UserCheck className="h-5 w-5 text-teal-600" />
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Shortlisting Engine</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review and record selection or rejection decisions with full audit reasons and status snapshots.
              </p>
            </Link>

            <Link
              href="/recruiter/schedule"
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Conflict-Free Scheduler</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Allocate panel slots for SHORTLISTED candidates with live clash detection and alternative suggestions.
              </p>
            </Link>
          </div>

          {/* Active Requisitions Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Job Openings & Candidate Counts</h3>
                <p className="text-xs text-slate-500">Live positions submitted to BPUT placement cell</p>
              </div>
              <Link
                href="/recruiter/jobs"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>View All Jobs</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600 mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading requisitions...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                <Briefcase className="h-8 w-8 text-slate-300 mx-auto" />
                <p>No job requisitions created yet.</p>
                <Link
                  href="/recruiter/jobs/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create First Job</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Position Title</th>
                      <th className="py-3 px-4">Min CGPA</th>
                      <th className="py-3 px-4">Branches</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {jobs.slice(0, 5).map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold">{job.title}</strong>
                          <span className="text-[11px] text-slate-500">{job.location} · {job.employmentType}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {job.eligibility?.minCgpa ?? 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {job.eligibility?.branches?.join(', ') || 'All Disciplines'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              job.status === 'OPEN'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/recruiter/jobs/${job.id}/matches`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <span>Rank Candidates</span>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                          </Link>
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
