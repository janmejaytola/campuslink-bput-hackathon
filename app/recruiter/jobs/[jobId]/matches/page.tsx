'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Briefcase,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Award,
  Users,
  Percent,
  Sliders,
  X,
  Info,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import { RecruiterJob } from '@/types/job';
import { CandidateMatchResult, RankedCandidate } from '@/types/matching';
import { ShortlistRecord, ShortlistStatus } from '@/types/shortlist';
import { matchingService } from '@/lib/services/matchingService';
import { jobService } from '@/lib/services/jobService';
import { shortlistService } from '@/lib/services/shortlistService';

export default function RecruiterJobMatchesPage() {
  const { currentUser } = useAuth();
  const params = useParams();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [rankedEligible, setRankedEligible] = useState<RankedCandidate[]>([]);
  const [ineligibleGated, setIneligibleGated] = useState<CandidateMatchResult[]>([]);
  const [shortlistsMap, setShortlistsMap] = useState<Record<string, ShortlistRecord>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Metrics
  const [averageScore, setAverageScore] = useState<number>(0);
  const [topScore, setTopScore] = useState<number>(0);
  const [highMatchCount, setHighMatchCount] = useState<number>(0);

  // Selected candidate detail modal
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SHORTLISTED' | 'NOT_REVIEWED' | 'REJECTED'>('ALL');
  const [showIneligibleSection, setShowIneligibleSection] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (!jobId) return;

    (async () => {
      try {
        const [matchData, shortlistData] = await Promise.all([
          matchingService.getJobMatches(jobId),
          shortlistService.getShortlistsForJob(jobId),
        ]);
        if (!active) return;
        setJob(matchData.job);
        setRankedEligible(matchData.rankedEligible);
        setIneligibleGated(matchData.ineligibleGated);
        setAverageScore(matchData.averageScore);
        setTopScore(matchData.topScore);
        setHighMatchCount(matchData.highMatchCount);
        setShortlistsMap(shortlistData);
      } catch (err: unknown) {
        if (!active) return;
        console.error('[Error loading job candidate matches]:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load candidate matches.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [jobId]);

  const handleUpdateShortlist = async (
    candidate: CandidateMatchResult,
    newStatus: ShortlistStatus,
    customReason?: string
  ) => {
    if (!job || !currentUser?.uid) return;

    // RULE: Only ELIGIBLE candidates can be shortlisted
    if (newStatus === 'SHORTLISTED' && !candidate.eligible) {
      setFeedbackToast({
        message: 'Eligibility Gate Violation: Only ELIGIBLE candidates can be shortlisted. This candidate does not meet mandatory requirements.',
        type: 'error',
      });
      setTimeout(() => setFeedbackToast(null), 5000);
      return;
    }

    setProcessingCandidateId(candidate.studentId);
    try {
      const strengthsList = candidate.strengths && candidate.strengths.length > 0
        ? candidate.strengths
        : [`Match Score: ${candidate.score}/100`];

      const record = await shortlistService.updateStatus({
        jobId: job.id,
        candidateId: candidate.studentId,
        recruiterId: currentUser.uid,
        status: newStatus,
        matchScoreSnapshot: candidate.score,
        eligible: candidate.eligible,
        reason: customReason || (
          newStatus === 'SHORTLISTED'
            ? `Candidate shortlisted with deterministic match score ${candidate.score}/100 and verified eligibility.`
            : newStatus === 'REJECTED'
            ? 'Candidate profile does not match current cohort recruitment requirements.'
            : 'Candidate pending recruiter evaluation.'
        ),
        candidateName: candidate.studentName,
        candidateBranch: candidate.studentBranch,
        candidateBatch: '2026',
        candidateRegNo: candidate.studentRegNo,
        jobTitle: job.title,
        company: job.company,
        strengthsSnapshot: strengthsList,
      });

      setShortlistsMap((prev) => ({
        ...prev,
        [candidate.studentId]: record,
      }));

      const statusLabels: Record<ShortlistStatus, string> = {
        SHORTLISTED: 'Shortlisted',
        REJECTED: 'Rejected',
        NOT_REVIEWED: 'Pending Review',
      };

      setFeedbackToast({
        message: `${candidate.studentName} updated to "${statusLabels[newStatus]}".`,
        type: 'success',
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err: unknown) {
      console.error('[Error updating candidate shortlist]:', err);
      setFeedbackToast({
        message: err instanceof Error ? err.message : 'Failed to update shortlist status.',
        type: 'error',
      });
      setTimeout(() => setFeedbackToast(null), 5000);
    } finally {
      setProcessingCandidateId(null);
    }
  };

  // Compute counts
  const shortlistedCount = Object.values(shortlistsMap).filter((s) => s.status === 'SHORTLISTED').length;
  const rejectedCount = Object.values(shortlistsMap).filter((s) => s.status === 'REJECTED').length;
  const pendingCount = rankedEligible.length - shortlistedCount - rejectedCount;

  const filteredRanked = rankedEligible.filter((cand) => {
    const matchesSearch =
      (cand.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.studentBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.studentRegNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = cand.score >= minScoreFilter;

    const candStatus = shortlistsMap[cand.studentId]?.status || 'NOT_REVIEWED';
    const matchesStatus = statusFilter === 'ALL' || candStatus === statusFilter;

    return matchesSearch && matchesScore && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <div className="space-y-6 pb-16 max-w-6xl mx-auto">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/recruiter/jobs"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Jobs
                </Link>
                <span className="text-slate-300">/</span>
                {job && (
                  <>
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      {job.title}
                    </Link>
                    <span className="text-slate-300">/</span>
                  </>
                )}
                <span className="text-xs font-semibold text-teal-700">Candidate Matches</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Candidate Matches & Ranking
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {job ? `${job.company} · ${job.title} · Version ${job.updatedAt || '1'}` : 'Explainable Candidate Match Engine'}
              </p>
            </div>

            {job && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/recruiter/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <span>Position Overview</span>
                </Link>
              </div>
            )}
          </div>

          {/* Explanatory Architecture Banner */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-900 flex items-start gap-3 shadow-xs">
            <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-teal-950 block">
                Deterministic Eligibility Gate & Transparent Matching
              </strong>
              <p className="leading-relaxed">
                Eligibility answers: <em>&ldquo;Does this candidate meet mandatory requirements?&rdquo;</em> Matching answers: <em>&ldquo;How strongly does an eligible candidate fit this role?&rdquo;</em>
                Candidates failing mandatory eligibility cutoffs are strictly excluded from the ranked shortlist. Match scores range from 0 to 100 based on verified competencies, showcase projects, and experience.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                  Synthetic Demo Data
                </span>
                <span className="text-[11px] text-teal-800">
                  Candidate pool populated with standardized BPUT Batch 2026 verification dossiers for hackathon evaluation.
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Toast */}
          {feedbackToast && (
            <div
              className={`rounded-xl border p-4 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
                feedbackToast.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-xs underline hover:opacity-80 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Evaluating candidate eligibility gates & running deterministic matching engine...
              </p>
            </div>
          ) : (
            <>
              {/* SUMMARY STAT CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligible Pool</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {rankedEligible.length}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Ranked
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Passed hard cutoff gates
                  </span>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Shortlisted</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-emerald-900 font-mono">
                      {shortlistedCount}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      Selected
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    Confirmed for next round
                  </span>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Under Review</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-900 font-mono">
                      {pendingCount}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                      Pending
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 mt-1 block">
                    Awaiting recruiter action
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-800 font-mono">
                      {rejectedCount}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Excluded
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Decisions recorded
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Match</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-teal-800 font-mono">
                      {averageScore}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ 100</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Top fit: {topScore}/100
                  </span>
                </div>
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, branch, or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter Buttons */}
                  <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
                    {(['ALL', 'SHORTLISTED', 'NOT_REVIEWED', 'REJECTED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          statusFilter === st
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {st === 'ALL'
                          ? `All (${rankedEligible.length})`
                          : st === 'SHORTLISTED'
                          ? `Shortlisted (${shortlistedCount})`
                          : st === 'NOT_REVIEWED'
                          ? `Pending (${pendingCount})`
                          : `Rejected (${rejectedCount})`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                    <span className="text-xs text-slate-500 font-medium">Min Match:</span>
                    <select
                      value={minScoreFilter}
                      onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                      className="rounded-xl border border-slate-200 bg-white py-1 px-2.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-xs cursor-pointer"
                    >
                      <option value={0}>0+</option>
                      <option value={60}>60+</option>
                      <option value={70}>70+</option>
                      <option value={80}>80+ (High)</option>
                      <option value={85}>85+ (Top)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RANKED ELIGIBLE CANDIDATES TABLE */}
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Eligible Candidate Roster ({filteredRanked.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Deterministic ranking: Match Score ↓ · Skills ↓ · Projects ↓
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider text-[10px] font-semibold">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">Rank</th>
                        <th className="py-3 px-3">Candidate</th>
                        <th className="py-3 px-3">Match Score</th>
                        <th className="py-3 px-3">Skills (45%)</th>
                        <th className="py-3 px-3">Projects (15%)</th>
                        <th className="py-3 px-3">Experience (10%)</th>
                        <th className="py-3 px-3">Shortlist Status</th>
                        <th className="py-3 px-3 text-center">Shortlist Action</th>
                        <th className="py-3 px-3 text-right">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRanked.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-400">
                            No eligible candidates match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRanked.map((cand) => {
                          const isTop = cand.rank === 1;
                          const isHigh = cand.score >= 80;
                          const shortlistRecord = shortlistsMap[cand.studentId];
                          const currentStatus: ShortlistStatus = shortlistRecord?.status || 'NOT_REVIEWED';
                          const isUpdating = processingCandidateId === cand.studentId;

                          return (
                            <tr
                              key={cand.studentId}
                              className={`transition-colors ${
                                currentStatus === 'SHORTLISTED'
                                  ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                                  : currentStatus === 'REJECTED'
                                  ? 'bg-slate-50/50 hover:bg-slate-100/50 opacity-75'
                                  : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="py-3.5 px-3 text-center font-bold font-mono">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                    isTop
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  #{cand.rank}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="font-bold text-slate-900">{cand.studentName}</div>
                                <div className="text-[11px] text-slate-500">
                                  {cand.studentBranch} · {cand.studentRegNo}
                                </div>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 text-sm font-extrabold font-mono text-teal-800">
                                    {cand.score}
                                  </div>
                                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        isHigh ? 'bg-teal-600' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${cand.score}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">
                                {cand.breakdown.requiredSkills.status === 'APPLICABLE'
                                  ? `${cand.breakdown.requiredSkills.score}%`
                                  : 'N/A'}
                              </td>
                              <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">
                                {cand.breakdown.projects.status === 'APPLICABLE'
                                  ? `${cand.breakdown.projects.score}%`
                                  : 'N/A'}
                              </td>
                              <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">
                                {cand.breakdown.experience.status === 'APPLICABLE'
                                  ? `${cand.breakdown.experience.score}%`
                                  : 'N/A'}
                              </td>
                              <td className="py-3.5 px-3">
                                {currentStatus === 'SHORTLISTED' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    SHORTLISTED
                                  </span>
                                ) : currentStatus === 'REJECTED' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                                    REJECTED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                                    NOT REVIEWED
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-teal-600 mx-auto" />
                                  ) : (
                                    <>
                                      {currentStatus !== 'SHORTLISTED' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateShortlist(cand, 'SHORTLISTED')}
                                          title="Shortlist for next round"
                                          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                                        >
                                          <span>Shortlist</span>
                                        </button>
                                      )}

                                      {currentStatus !== 'REJECTED' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateShortlist(cand, 'REJECTED')}
                                          title="Mark as rejected"
                                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer"
                                        >
                                          <span>Reject</span>
                                        </button>
                                      )}

                                      {currentStatus !== 'NOT_REVIEWED' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateShortlist(cand, 'NOT_REVIEWED')}
                                          title="Reset to Not Reviewed"
                                          className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-1 underline cursor-pointer"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCandidate(cand);
                                    setDecisionNotes(shortlistRecord?.reason || '');
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="h-3 w-3 text-slate-400" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INELIGIBLE GATED CANDIDATES SECTION */}
              <div className="rounded-2xl border border-rose-200/90 bg-rose-50/30 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowIneligibleSection(!showIneligibleSection)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900">
                        Ineligible Candidates Excluded by Gate ({ineligibleGated.length})
                      </h4>
                      <p className="text-[11px] text-rose-700">
                        High match score NEVER overrides mandatory criteria. These candidates failed one or more hard requirements.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 underline">
                    {showIneligibleSection ? 'Hide Ineligible' : 'View Ineligible'}
                  </span>
                </button>

                {showIneligibleSection && (
                  <div className="border-t border-rose-200/60 p-4 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-rose-50/50 text-rose-900 uppercase text-[10px] font-semibold border-b border-rose-100">
                          <tr>
                            <th className="py-2.5 px-3">Candidate</th>
                            <th className="py-2.5 px-3">Branch</th>
                            <th className="py-2.5 px-3">Theoretical Match</th>
                            <th className="py-2.5 px-3">Eligibility Gate Failure Reason</th>
                            <th className="py-2.5 px-3 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ineligibleGated.map((cand) => (
                            <tr key={cand.studentId} className="hover:bg-slate-50">
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-800 block">{cand.studentName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{cand.studentRegNo}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-600">{cand.studentBranch}</td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-xs font-bold text-slate-400 line-through">
                                  {cand.score} / 100
                                </span>
                                <span className="text-[10px] text-rose-600 block font-semibold">
                                  Gated (Not Ranked)
                                </span>
                              </td>
                              <td className="py-3 px-3 text-rose-800 text-[11px] font-medium max-w-md">
                                {cand.reason}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => setSelectedCandidate(cand)}
                                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                                >
                                  View Audit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CANDIDATE MATCH DETAIL MODAL */}
          {selectedCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                        Candidate Dossier & Fit Analysis
                      </span>
                      {selectedCandidate.eligible ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          ELIGIBLE ✓
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                          NOT ELIGIBLE ✕
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {selectedCandidate.studentName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedCandidate.studentBranch} · Registration: {selectedCandidate.studentRegNo}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Score Banner */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      Deterministic Match Score
                    </span>
                    <div className="text-3xl font-extrabold text-teal-800 font-mono">
                      {selectedCandidate.score}{' '}
                      <span className="text-sm font-medium text-slate-500">/ 100</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Evaluated against {selectedCandidate.jobTitle} specifications
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Ranking Status</span>
                    <div className="mt-1">
                      {selectedCandidate.rankingEligible ? (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ranked in Shortlist
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Gated Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 7-Pillar Breakdown */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Transparent 7-Dimension Score Breakdown
                  </h3>
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                    {/* Dimension row helper */}
                    {Object.entries(selectedCandidate.breakdown).map(([key, item]) => {
                      const labels: Record<string, string> = {
                        requiredSkills: 'Required Skills (45%)',
                        preferredSkills: 'Preferred Skills (15%)',
                        projects: 'Projects (15%)',
                        experience: 'Internships / Experience (10%)',
                        certifications: 'Certifications (5%)',
                        careerGoal: 'Career Goal Alignment (5%)',
                        locationWorkMode: 'Location & Work Mode (5%)',
                      };

                      return (
                        <div key={key} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                          <div className="space-y-0.5 max-w-sm">
                            <span className="font-bold text-slate-800">{labels[key] || key}</span>
                            <p className="text-[11px] text-slate-500">{item.reason}</p>
                          </div>
                          <div className="text-right font-mono">
                            {item.status === 'APPLICABLE' ? (
                              <>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {item.score}%
                                </span>
                                <span className="text-[10px] text-teal-700">
                                  +{item.contribution} pts ({item.normalizedWeight}% wt)
                                </span>
                              </>
                            ) : (
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                NOT APPLICABLE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Candidate Strengths
                    </h4>
                    {selectedCandidate.strengths.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No primary strengths flagged.</p>
                    ) : (
                      <ul className="space-y-1 text-xs text-emerald-950">
                        {selectedCandidate.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      Potential Deficits / Gaps
                    </h4>
                    {selectedCandidate.gaps.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No significant deficits detected.</p>
                    ) : (
                      <ul className="space-y-1 text-xs text-amber-950">
                        {selectedCandidate.gaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Recruiter Shortlisting Decision Panel */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Recruiter Shortlisting Action & Justification
                      </h4>
                    </div>
                    {shortlistsMap[selectedCandidate.studentId]?.status === 'SHORTLISTED' ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                        CURRENT: SHORTLISTED
                      </span>
                    ) : shortlistsMap[selectedCandidate.studentId]?.status === 'REJECTED' ? (
                      <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 text-[10px] font-bold">
                        CURRENT: REJECTED
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 text-slate-700 px-2.5 py-0.5 text-[10px] font-bold">
                        CURRENT: NOT REVIEWED
                      </span>
                    )}
                  </div>

                  {!selectedCandidate.eligible ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block">Eligibility Gate Enforced</strong>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          This candidate failed mandatory job cutoff criteria ({selectedCandidate.reason}).
                          Per CAMPUSLINK recruitment rules, ineligible candidates cannot be shortlisted.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Recruiter Evaluation Notes / Shortlist Justification
                        </label>
                        <textarea
                          rows={2}
                          value={decisionNotes}
                          onChange={(e) => setDecisionNotes(e.target.value)}
                          placeholder={`E.g., Shortlisted based on ${selectedCandidate.score}/100 deterministic score and strong project alignment.`}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={processingCandidateId === selectedCandidate.studentId}
                          onClick={() => handleUpdateShortlist(selectedCandidate, 'SHORTLISTED', decisionNotes)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {processingCandidateId === selectedCandidate.studentId && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          )}
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Shortlist Candidate</span>
                        </button>

                        <button
                          type="button"
                          disabled={processingCandidateId === selectedCandidate.studentId}
                          onClick={() => handleUpdateShortlist(selectedCandidate, 'REJECTED', decisionNotes)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700 px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <span>Reject Candidate</span>
                        </button>

                        <button
                          type="button"
                          disabled={processingCandidateId === selectedCandidate.studentId}
                          onClick={() => handleUpdateShortlist(selectedCandidate, 'NOT_REVIEWED', decisionNotes)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <span>Set Pending Review</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Audit & Requirements Version */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Evaluated: {new Date(selectedCandidate.evaluatedAt).toLocaleString()}</span>
                  <span>Requirements Version: {selectedCandidate.requirementsVersion}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
