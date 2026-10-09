'use client';

import React, { useState, useEffect } from 'react';
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
  Zap,
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
        const recruiterJobs = await jobService.getRecruiterJobs(uid);
        if (!active) return;
        setJobs(recruiterJobs);

        const allShortlists = await shortlistService.getShortlistsForRecruiter(uid);
        if (!active) return;

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
        console.error('[Recruiter Shortlist Fetch Error]:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  const handleStatusChange = async (record: ShortlistRecord, newStatus: ShortlistStatus) => {
    const uid = currentUser?.uid;
    if (!uid) return;

    setProcessingId(record.id);

    try {
      const updated = await shortlistService.updateStatus({
        jobId: record.jobId,
        candidateId: record.candidateId,
        recruiterId: uid,
        status: newStatus,
        matchScoreSnapshot: record.matchScoreSnapshot,
        eligible: record.eligible,
        candidateName: record.candidateName,
        candidateBranch: record.candidateBranch,
        candidateRegNo: record.candidateRegNo,
        jobTitle: record.jobTitle,
        company: record.company,
        strengthsSnapshot: record.strengthsSnapshot,
        reason:
          newStatus === 'SHORTLISTED'
            ? 'Shortlisted by recruiter with locked eligibility audit.'
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
          title="Shortlist Pipeline & Decision Board"
          description="Deterministic candidate shortlisting governed by eligibility gates and transparent match rubric scores"
          badge="Batch of 2026"
        >
          <div className="flex items-center gap-2.5">
            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#152744] bg-[#081B34] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-[#00C9C0]/50 transition-colors shadow-xs"
            >
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>Job Openings</span>
            </Link>

            <Link
              href="/recruiter/schedule"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00C9C0] hover:from-[#00A89E] hover:to-[#00F5D4] px-4 py-2 text-xs font-bold text-white transition-all shadow-[0_4px_16px_rgba(0,127,131,0.4)] cursor-pointer"
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
              className={`rounded-2xl border p-4 text-xs font-semibold flex items-center justify-between shadow-md backdrop-blur-md ${
                notification.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/70 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/70 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs underline hover:opacity-80 cursor-pointer text-slate-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* CONTROLS: JOB SELECTOR & SEARCH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#081B34]/85 p-4 rounded-2xl border border-[#152744] shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, reg number, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Job:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="rounded-xl border border-[#152744] bg-[#06172B] py-2 px-3 text-xs font-medium text-white focus:border-[#00C9C0] focus:outline-none cursor-pointer max-w-[200px] truncate"
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
                  <span className="text-xs text-slate-400 font-medium">Branch:</span>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="rounded-xl border border-[#152744] bg-[#06172B] py-2 px-3 text-xs font-medium text-white focus:border-[#00C9C0] focus:outline-none cursor-pointer max-w-[170px] truncate"
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

            <div className="flex items-center gap-3 text-xs font-mono border-t sm:border-t-0 sm:border-l border-[#152744] pt-2 sm:pt-0 sm:pl-3 justify-between sm:justify-start">
              <span className="text-emerald-400 font-bold">
                {shortlistedList.length} Shortlisted
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[#00F5D4] font-bold">
                {pendingList.length} Under Review
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-bold">
                {rejectedList.length} Rejected
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-12 text-center shadow-md">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00C9C0]" />
              <p className="mt-3 text-xs font-medium text-slate-400">
                Loading shortlisted candidates from Firestore...
              </p>
            </div>
          ) : (
            /* PIPELINE 3-COLUMN STAGE BOARD IN DARK 3D GLASS */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COLUMN 1: SHORTLISTED */}
              <div className="rounded-2xl border border-emerald-500/30 bg-[#062426]/70 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Shortlisted Candidates
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-950 border border-emerald-600/50 px-2.5 py-0.5 text-xs font-bold text-emerald-300 font-mono">
                    {shortlistedList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {shortlistedList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-emerald-800/40 p-8 text-center text-xs text-slate-400">
                      No candidates shortlisted yet.
                      <p className="mt-1 text-[11px] text-slate-500">
                        Review candidates from the Pending column or Job Candidate Matches page.
                      </p>
                    </div>
                  ) : (
                    shortlistedList.map((cand) => (
                      <div
                        key={cand.id}
                        className="rounded-xl border border-emerald-800/60 bg-[#081B34] p-4 shadow-md space-y-2.5 hover:border-emerald-500/80 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {cand.candidateBranch} · Reg {cand.candidateRegNo}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-extrabold text-[#00F5D4]">
                              {cand.matchScoreSnapshot}/100
                            </span>
                            <span className="block text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 rounded px-1.5 py-0.2 mt-0.5">
                              ELIGIBLE ✓
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 bg-[#06172B] p-2.5 rounded-lg border border-[#152744]">
                          <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                            Position: {cand.jobTitle}
                          </span>
                          <p className="mt-0.5 text-slate-300 italic line-clamp-2">
                            &quot;{cand.reason}&quot;
                          </p>
                        </div>

                        {cand.strengthsSnapshot && cand.strengthsSnapshot.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cand.strengthsSnapshot.slice(0, 2).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#152744] flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-slate-400">
                            {new Date(cand.updatedAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'NOT_REVIEWED')}
                              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                            >
                              Move Pending
                            </button>
                            <span className="text-slate-600">·</span>
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'REJECTED')}
                              className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
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
              <div className="rounded-2xl border border-[#00C9C0]/30 bg-[#081B34]/85 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-[#152744] pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#00F5D4]" />
                    <h3 className="text-sm font-bold text-white">
                      Pending Evaluation
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#007F83]/30 border border-[#00C9C0]/40 px-2.5 py-0.5 text-xs font-bold text-[#00F5D4] font-mono">
                    {pendingList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {pendingList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#152744] p-8 text-center text-xs text-slate-400">
                      No candidates pending review.
                    </div>
                  ) : (
                    pendingList.map((cand) => (
                      <div
                        key={cand.id}
                        className="rounded-xl border border-[#152744] bg-[#06172B] p-4 shadow-md space-y-2.5 hover:border-[#00C9C0]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {cand.candidateBranch} · Reg {cand.candidateRegNo}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-extrabold text-[#00F5D4]">
                              {cand.matchScoreSnapshot}/100
                            </span>
                            <span className="block text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 rounded px-1.5 py-0.2 mt-0.5">
                              ELIGIBLE ✓
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 bg-[#081B34] p-2.5 rounded-lg border border-[#152744]">
                          <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                            Position: {cand.jobTitle}
                          </span>
                          <p className="mt-0.5 text-slate-300 text-[11px]">
                            {cand.reason}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#152744] flex items-center justify-between">
                          <Link
                            href={`/recruiter/jobs/${cand.jobId}/matches`}
                            className="text-[10px] font-semibold text-[#00F5D4] hover:underline flex items-center gap-0.5"
                          >
                            <span>Inspect Fit</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'SHORTLISTED')}
                              className="rounded-lg bg-gradient-to-r from-[#007F83] to-[#00C9C0] hover:from-[#00A89E] hover:to-[#00F5D4] text-white px-3 py-1 text-[10px] font-bold shadow-xs cursor-pointer"
                            >
                              Shortlist
                            </button>
                            <button
                              type="button"
                              disabled={processingId === cand.id}
                              onClick={() => handleStatusChange(cand, 'REJECTED')}
                              className="rounded-lg border border-[#152744] hover:bg-rose-950 hover:text-rose-300 text-slate-400 px-2.5 py-1 text-[10px] font-medium cursor-pointer"
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
              <div className="rounded-2xl border border-slate-800 bg-[#06172B]/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-white">
                      Rejected Candidates
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-300 font-mono">
                    {rejectedList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {rejectedList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                      No candidates marked as rejected.
                    </div>
                  ) : (
                    rejectedList.map((cand) => (
                      <div
                        key={cand.id}
                        className="rounded-xl border border-slate-800 bg-[#081B34]/60 p-4 shadow-sm space-y-2 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {cand.candidateBranch} · Reg {cand.candidateRegNo}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {cand.matchScoreSnapshot}/100
                          </span>
                        </div>

                        <p className="text-[11px] text-rose-300 italic bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                          &quot;{cand.reason}&quot;
                        </p>

                        <div className="pt-2 border-t border-[#152744] flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-slate-400">
                            {new Date(cand.updatedAt).toLocaleDateString()}
                          </span>

                          <button
                            type="button"
                            disabled={processingId === cand.id}
                            onClick={() => handleStatusChange(cand, 'SHORTLISTED')}
                            className="text-[10px] text-[#00F5D4] hover:underline font-semibold cursor-pointer"
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
