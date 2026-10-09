'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Award,
  Search,
  Filter,
  Briefcase,
  Loader2,
  ChevronRight,
  ExternalLink,
  Users,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { useAuth } from '@/context/AuthContext';
import { RecruiterJob } from '@/types/job';
import { ShortlistRecord, ShortlistStatus } from '@/types/shortlist';
import { jobService } from '@/lib/services/jobService';
import { shortlistService } from '@/lib/services/shortlistService';
import { matchingService } from '@/lib/services/matchingService';

export default function RecruiterShortlistPage() {
  const { currentUser } = useAuth();

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [shortlists, setShortlists] = useState<ShortlistRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  useEffect(() => {
    let active = true;
    const uid = currentUser?.uid;
    if (!uid) return;

    (async () => {
      setIsLoading(true);

      try {
        // 1. Fetch all jobs belonging to this recruiter
        const recruiterJobs = await jobService.getRecruiterJobs(uid);
        if (!active) return;
        setJobs(recruiterJobs);

        // 2. Fetch all shortlists for this recruiter
        const allShortlists = await shortlistService.getShortlistsForRecruiter(uid);
        if (!active) return;

        // If recruiter has jobs but zero shortlists stored, evaluate candidates for open jobs so recruiter has records
        if (allShortlists.length === 0 && recruiterJobs.length > 0) {
          for (const j of recruiterJobs.slice(0, 2)) {
            try {
              const matches = await matchingService.getJobMatches(j.id);
              for (const c of matches.rankedEligible.slice(0, 3)) {
                await shortlistService.updateStatus({
                  jobId: j.id,
                  candidateId: c.studentId,
                  recruiterId: uid,
                  status: 'NOT_REVIEWED',
                  matchScoreSnapshot: c.score,
                  eligible: true,
                  candidateName: c.studentName,
                  candidateBranch: c.studentBranch,
                  candidateRegNo: c.studentRegNo,
                  jobTitle: j.title,
                  company: j.company,
                  reason: `Deterministic match score: ${c.score}/100. Pending recruiter review.`,
                  strengthsSnapshot: c.strengths,
                });
              }
            } catch (e) {
              // Ignore background prep
            }
          }
          const refreshed = await shortlistService.getShortlistsForRecruiter(uid);
          if (!active) return;
          setShortlists(refreshed);
        } else {
          setShortlists(allShortlists);
        }
      } catch (err: unknown) {
        if (!active) return;
        console.error('[Error loading recruiter shortlists]:', err);
        setNotification({
          message: err instanceof Error ? err.message : 'Failed to load shortlist pipeline.',
          type: 'error',
        });
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

  // Handle status update
  const handleStatusChange = async (record: ShortlistRecord, newStatus: ShortlistStatus) => {
    if (!currentUser?.uid) return;

    if (newStatus === 'SHORTLISTED' && !record.eligible) {
      setNotification({
        message: 'Eligibility Gate Violation: Ineligible candidates cannot be shortlisted.',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setProcessingId(record.id);
    try {
      const updated = await shortlistService.updateStatus({
        jobId: record.jobId,
        candidateId: record.candidateId,
        recruiterId: currentUser.uid,
        status: newStatus,
        matchScoreSnapshot: record.matchScoreSnapshot,
        eligible: record.eligible,
        candidateName: record.candidateName,
        candidateBranch: record.candidateBranch,
        candidateBatch: record.candidateBatch,
        candidateRegNo: record.candidateRegNo,
        jobTitle: record.jobTitle,
        company: record.company,
        strengthsSnapshot: record.strengthsSnapshot,
        reason:
          newStatus === 'SHORTLISTED'
            ? `Candidate shortlisted for interview rounds based on deterministic match (${record.matchScoreSnapshot}/100).`
            : newStatus === 'REJECTED'
            ? 'Candidate not selected for this recruitment opening.'
            : 'Candidate pending review.',
      });

      setShortlists((prev) =>
        prev.map((item) => (item.id === record.id ? updated : item))
      );

      setNotification({
        message: `${record.candidateName} moved to ${newStatus}.`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error('[Error updating candidate status]:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to update candidate status.',
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Filter records
  const filteredRecords = shortlists.filter((r) => {
    const matchesJob = selectedJobId === 'ALL' || r.jobId === selectedJobId;
    const matchesSearch =
      (r.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.candidateRegNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'ALL' || r.candidateBranch === branchFilter;

    return matchesJob && matchesSearch && matchesBranch;
  });

  const shortlistedList = filteredRecords.filter((r) => r.status === 'SHORTLISTED');
  const pendingList = filteredRecords.filter((r) => r.status === 'NOT_REVIEWED');
  const rejectedList = filteredRecords.filter((r) => r.status === 'REJECTED');

  const branches = Array.from(new Set(shortlists.map((s) => s.candidateBranch).filter(Boolean)));

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <PageHeader
          title="Recruiter Shortlist Pipeline & Decisions"
          description="Deterministic candidate shortlisting governed by eligibility gates and transparent match scores"
          badge="Batch of 2026"
        >
          <div className="flex items-center gap-2">
            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>Manage Job Openings</span>
            </Link>

            <Link
              href="/recruiter/schedule"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Next Round</span>
            </Link>
          </div>
        </PageHeader>

        <div className="space-y-6 pb-16">
          <PS10Notice
            moduleName="Explainable Recruiter Shortlisting Engine"
            nextStepDetail="All shortlisting decisions are persisted to Firestore with snapshots of deterministic match scores, verified eligibility, and recruiter audit notes."
          />

          {notification && (
            <div
              className={`rounded-xl border p-4 text-xs font-semibold flex items-center justify-between shadow-xs ${
                notification.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs underline hover:opacity-80 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* CONTROLS: JOB SELECTOR & SEARCH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, reg number, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Job:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-xs cursor-pointer max-w-[200px] truncate"
                >
                  <option value="ALL">All Recruiter Positions</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.company})
                    </option>
                  ))}
                </select>
              </div>

              {branches.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Branch:</span>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-xs cursor-pointer max-w-[170px] truncate"
                  >
                    <option value="ALL">All Disciplines</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3 justify-between sm:justify-start">
              <span className="text-emerald-700 font-bold">
                {shortlistedList.length} Shortlisted
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-700 font-bold">
                {pendingList.length} Under Review
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-bold">
                {rejectedList.length} Rejected
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Loading shortlisted candidates from Firestore...
              </p>
            </div>
          ) : (
            /* PIPELINE 3-COLUMN STAGE BOARD */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COLUMN 1: SHORTLISTED */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-xs flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-emerald-950">
                      Shortlisted Candidates
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {shortlistedList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {shortlistedList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-emerald-200 p-8 text-center text-xs text-slate-400">
                      No candidates shortlisted yet.
                      <p className="mt-1 text-[11px] text-slate-500">
                        Review candidates from the Pending column or Job Candidate Matches page.
                      </p>
                    </div>
                  ) : (
                    shortlistedList.map((cand) => (
                      <div
                        key={cand.id}
                        className="rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs space-y-2 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {cand.candidateBranch} · Reg {cand.candidateRegNo}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-extrabold text-teal-800">
                              {cand.matchScoreSnapshot}/100
                            </span>
                            <span className="block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.2 mt-0.5">
                              ELIGIBLE ✓
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700 block text-[10px] uppercase">
                            Position: {cand.jobTitle}
                          </span>
                          <p className="mt-0.5 text-slate-500 italic line-clamp-2">
                            &quot;{cand.reason}&quot;
                          </p>
                        </div>

                        {cand.strengthsSnapshot && cand.strengthsSnapshot.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cand.strengthsSnapshot.slice(0, 2).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-slate-400">
                            {new Date(cand.updatedAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'NOT_REVIEWED')}
                              className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                            >
                              Move Pending
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'REJECTED')}
                              className="text-[10px] text-rose-600 hover:text-rose-800 underline cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: NOT_REVIEWED (UNDER REVIEW) */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-xs flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-950">
                      Pending Evaluation
                    </h3>
                  </div>
                  <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    {pendingList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {pendingList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-amber-200 p-8 text-center text-xs text-slate-400">
                      No candidates pending review.
                    </div>
                  ) : (
                    pendingList.map((cand) => (
                      <div
                        key={cand.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {cand.candidateBranch} · Reg {cand.candidateRegNo}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-extrabold text-teal-800">
                              {cand.matchScoreSnapshot}/100
                            </span>
                            <span className="block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.2 mt-0.5">
                              ELIGIBLE ✓
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700 block text-[10px] uppercase">
                            Position: {cand.jobTitle}
                          </span>
                          <p className="mt-0.5 text-slate-500 text-[11px]">
                            {cand.reason}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            href={`/recruiter/jobs/${cand.jobId}/matches`}
                            className="text-[10px] font-semibold text-teal-700 hover:underline flex items-center gap-0.5"
                          >
                            <span>Inspect Fit</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'SHORTLISTED')}
                              className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 text-[10px] font-bold shadow-xs cursor-pointer"
                            >
                              Shortlist
                            </button>
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'REJECTED')}
                              className="rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-2 py-1 text-[10px] font-medium cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 3: REJECTED */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-xs flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Rejected Candidates
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-200 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    {rejectedList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {rejectedList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                      No candidates marked as rejected.
                    </div>
                  ) : (
                    rejectedList.map((cand) => (
                      <div
                        key={cand.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {cand.candidateBranch} · Reg {cand.candidateRegNo}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {cand.matchScoreSnapshot}/100
                          </span>
                        </div>

                        <p className="text-[11px] text-rose-700 italic bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                          &quot;{cand.reason}&quot;
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-slate-400">
                            {new Date(cand.updatedAt).toLocaleDateString()}
                          </span>

                          <button
                            type="button"
                            disabled={processingId === cand.id}
                            onClick={() => handleStatusChange(cand, 'SHORTLISTED')}
                            className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
                          >
                            Reconsider & Shortlist
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
