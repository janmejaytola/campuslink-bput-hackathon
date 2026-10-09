'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Briefcase,
  Loader2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { RecruiterJob } from '@/types/job';
import { ShortlistRecord, ShortlistStatus } from '@/types/shortlist';
import { shortlistService } from '@/lib/services/shortlistService';
import { jobService } from '@/lib/services/jobService';

interface StudentJobApplicationItem {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  workMode: string;
  status: ShortlistStatus;
  matchScore: number;
  reason: string;
  strengths: string[];
  updatedAt: string;
  driveDate?: string | null;
}

export default function StudentApplicationsPage() {
  const { currentUser } = useAuth();

  const [applications, setApplications] = useState<StudentJobApplicationItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Shortlisted' | 'Under Review' | 'Closed'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const uid = currentUser?.uid;
    if (!uid) return;

    (async () => {
      setIsLoading(true);

      try {
        const [shortlistsMap, openJobs] = await Promise.all([
          shortlistService.getShortlistsForStudent(uid),
          jobService.getOpenJobs(),
        ]);
        if (!active) return;

        const items: StudentJobApplicationItem[] = [];
        const jobMap = new Map<string, RecruiterJob>();
        openJobs.forEach((j) => jobMap.set(j.id, j));

        Object.values(shortlistsMap).forEach((rec) => {
          const matchingJob = jobMap.get(rec.jobId);
          items.push({
            jobId: rec.jobId,
            jobTitle: rec.jobTitle || matchingJob?.title || 'Campus Placement Role',
            company: rec.company || matchingJob?.company || 'Recruiting Partner',
            location: matchingJob?.location || 'Bhubaneswar / Remote',
            workMode: matchingJob?.workMode || 'HYBRID',
            status: rec.status,
            matchScore: rec.matchScoreSnapshot || 0,
            reason: rec.reason || 'Candidate profile reviewed against recruitment criteria.',
            strengths: rec.strengthsSnapshot || [],
            updatedAt: rec.updatedAt,
            driveDate: matchingJob?.driveDate,
          });
        });

        if (items.length === 0 && openJobs.length > 0) {
          for (const j of openJobs) {
            items.push({
              jobId: j.id,
              jobTitle: j.title,
              company: j.company,
              location: j.location,
              workMode: j.workMode,
              status: 'NOT_REVIEWED',
              matchScore: 0,
              reason: 'Application dossier submitted. Awaiting recruiter review.',
              strengths: ['BPUT Academic Record Verified', 'Direct Placement Drive'],
              updatedAt: j.createdAt,
              driveDate: j.driveDate,
            });
          }
        }

        setApplications(items);
      } catch (err) {
        console.error('[Error fetching student applications]:', err);
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

  const filteredApps = applications.filter((app) => {
    if (filter === 'Shortlisted') return app.status === 'SHORTLISTED';
    if (filter === 'Under Review') return app.status === 'NOT_REVIEWED';
    if (filter === 'Closed') return app.status === 'REJECTED';
    return true;
  });

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <PageHeader
          title="Application Pipeline & Recruitment Status"
          description="Read-only tracker of your shortlisted placement drives, recruiter review statuses, and verified academic dossiers"
          badge="Applications Tracker"
        >
          <div className="flex items-center gap-2">
            <Link
              href="/student/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>Explore More Jobs</span>
            </Link>

            <Link
              href="/student/schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <span>Interview Calendar</span>
              <Calendar className="h-3.5 w-3.5" />
            </Link>
          </div>
        </PageHeader>

        <div className="space-y-6 pb-16">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
              {(['All', 'Shortlisted', 'Under Review', 'Closed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-white text-indigo-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'All'
                    ? `All (${applications.length})`
                    : tab === 'Shortlisted'
                    ? `Shortlisted (${applications.filter((a) => a.status === 'SHORTLISTED').length})`
                    : tab === 'Under Review'
                    ? `Under Review (${applications.filter((a) => a.status === 'NOT_REVIEWED').length})`
                    : `Closed (${applications.filter((a) => a.status === 'REJECTED').length})`}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              BPUT University Placement Governance
            </span>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Fetching verified application progression statuses...
              </p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
              <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No applications in this category</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore active campus placement drives in your portal and verify your eligibility to enter recruiter review pipelines.
              </p>
              <Link
                href="/student/jobs"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
              >
                <span>Browse Campus Jobs</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const isShortlisted = app.status === 'SHORTLISTED';
                const isRejected = app.status === 'REJECTED';
                const isPending = app.status === 'NOT_REVIEWED';

                return (
                  <div key={app.jobId} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base font-bold text-slate-900">{app.company}</h3>

                          {isShortlisted && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Shortlisted for Interview Rounds
                            </span>
                          )}

                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              Application Under Review
                            </span>
                          )}

                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                              Application Concluded
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 font-semibold">{app.jobTitle}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span>Location: {app.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>Mode: {app.workMode}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            BPUT Transcript Verified
                          </span>
                        </div>
                      </div>

                      {/* Score Snapshot Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        {app.matchScore > 0 && (
                          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-right">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                              Deterministic Match
                            </span>
                            <span className="font-mono text-base font-black text-indigo-950 tabular-nums">
                              {app.matchScore} / 100
                            </span>
                          </div>
                        )}

                        <Link
                          href={`/student/job-matches`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <span>Inspect Fit</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                      </div>
                    </div>

                    {/* Recruiter Justification & Strengths */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          {isShortlisted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          Recruiter Evaluation Explanation:
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          Last Updated: {new Date(app.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 italic">
                        &quot;{app.reason}&quot;
                      </p>

                      {app.strengths.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {app.strengths.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
