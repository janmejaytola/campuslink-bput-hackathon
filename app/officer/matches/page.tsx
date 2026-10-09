'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronRight,
  Sparkles,
  Sliders,
  Scale,
  X,
  Play,
  FileCheck,
  Filter,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { RecruiterJob } from '@/types/job';
import { CandidateMatchResult, RankedCandidate, MatchingTestCaseResult } from '@/types/matching';
import { ShortlistRecord } from '@/types/shortlist';
import { matchingService } from '@/lib/services/matchingService';
import { jobService } from '@/lib/services/jobService';
import { shortlistService } from '@/lib/services/shortlistService';
import { runAllMatchingTests } from '@/lib/services/matchingTestCases';
import { runAllShortlistTests, ShortlistTestCaseResult } from '@/lib/services/shortlistTestCases';

export default function OfficerMatchesPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  // Matches for selected job
  const [rankedEligible, setRankedEligible] = useState<RankedCandidate[]>([]);
  const [ineligibleGated, setIneligibleGated] = useState<CandidateMatchResult[]>([]);
  const [shortlistsMap, setShortlistsMap] = useState<Record<string, ShortlistRecord>>({});
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector modal
  const [inspectedCandidate, setInspectedCandidate] = useState<CandidateMatchResult | null>(null);

  // Candidate Comparison
  const [compareCandidateA, setCompareCandidateA] = useState<CandidateMatchResult | null>(null);
  const [compareCandidateB, setCompareCandidateB] = useState<CandidateMatchResult | null>(null);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Verification Test Suite
  const [testResults, setTestResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: MatchingTestCaseResult[];
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Shortlist Verification Test Suite
  const [shortlistTestResults, setShortlistTestResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: ShortlistTestCaseResult[];
  } | null>(null);
  const [isRunningShortlistTests, setIsRunningShortlistTests] = useState<boolean>(false);

  // Load available jobs
  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoadingJobs(true);
      try {
        const openJobs = await jobService.getOpenJobs();
        if (!active) return;
        setJobs(openJobs);
        if (openJobs.length > 0) {
          setSelectedJobId(openJobs[0].id);
        }
      } catch (err) {
        console.error('[Error loading jobs]:', err);
      } finally {
        if (active) setIsLoadingJobs(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load matches and shortlists when selected job changes
  useEffect(() => {
    let active = true;
    if (!selectedJobId) return;

    (async () => {
      try {
        const [data, shortlists] = await Promise.all([
          matchingService.getJobMatches(selectedJobId),
          shortlistService.getShortlistsForJob(selectedJobId),
        ]);
        if (!active) return;
        setRankedEligible(data.rankedEligible);
        setIneligibleGated(data.ineligibleGated);
        setShortlistsMap(shortlists);
      } catch (err) {
        if (!active) return;
        console.error('[Error loading matches]:', err);
        setErrorMessage('Failed to evaluate candidates for selected opening.');
      } finally {
        if (active) {
          setIsLoadingMatches(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedJobId]);

  // Execute engine verification test suite
  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      try {
        const results = runAllMatchingTests();
        setTestResults(results);
      } catch (err) {
        console.error('[Error running tests]:', err);
      } finally {
        setIsRunningTests(false);
      }
    }, 150);
  };

  // Execute shortlist engine verification test suite
  const handleRunShortlistTests = () => {
    setIsRunningShortlistTests(true);
    setTimeout(() => {
      try {
        const results = runAllShortlistTests();
        setShortlistTestResults(results);
      } catch (err) {
        console.error('[Error running shortlist tests]:', err);
      } finally {
        setIsRunningShortlistTests(false);
      }
    }, 150);
  };

  const handleStartComparison = (candA: CandidateMatchResult, candB: CandidateMatchResult) => {
    setCompareCandidateA(candA);
    setCompareCandidateB(candB);
    setShowCompareModal(true);
  };

  const currentJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <div className="space-y-6 pb-16 max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-teal-700">Central Placement Cell</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">Auditing & Intelligence</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Explainable Candidate Matching & Shortlist Audit
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Inspect deterministic role alignment across university engineering batches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 shadow-xs hover:bg-teal-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRunningTests ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                <span>13 Matching Tests</span>
              </button>

              <button
                type="button"
                onClick={handleRunShortlistTests}
                disabled={isRunningShortlistTests}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRunningShortlistTests ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                <span>5 Shortlist Tests</span>
              </button>
            </div>
          </div>

          {/* Shortlist Engine Verification Test Results Card */}
          {shortlistTestResults && (
            <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Shortlisting Engine Functional Verification (TEST-S01 to TEST-S05)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Passed: {shortlistTestResults.passed} of {shortlistTestResults.total} tests · Hard Eligibility Gate & Deterministic Match Snapshot Validation
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShortlistTestResults(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {shortlistTestResults.results.map((tr) => (
                  <div
                    key={tr.testCase.id}
                    className={`rounded-xl border p-3 flex items-start justify-between gap-3 ${
                      tr.passed
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                        : 'border-rose-200 bg-rose-50/40 text-rose-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {tr.testCase.id}
                        </span>
                        <strong className="font-bold text-slate-900">{tr.testCase.name}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600">{tr.notes}</p>
                    </div>

                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                        tr.passed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {tr.passed ? 'PASSED ✓' : 'FAILED ✕'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Test Results Accordion/Card */}
          {testResults && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-teal-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Deterministic Engine Verification Suite (TEST 1 to TEST 13)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Passed: {testResults.passed} of {testResults.total} tests · Pure functional assertion
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setTestResults(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {testResults.results.map((tr) => (
                  <div
                    key={tr.testCase.id}
                    className={`rounded-xl border p-3 flex items-start justify-between gap-3 ${
                      tr.passed
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                        : 'border-rose-200 bg-rose-50/40 text-rose-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {tr.testCase.id}
                        </span>
                        <strong className="font-bold text-slate-900">{tr.testCase.name}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600">{tr.notes}</p>
                    </div>

                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                        tr.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tr.passed ? 'PASSED ✓' : 'FAILED ✕'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Selection Dropdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Campus Placement Opening
                </span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={isLoadingJobs}
                  className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-slate-800 focus:border-teal-500 focus:outline-hidden cursor-pointer"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} · {j.company} ({j.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentJob && (
              <div className="text-right text-xs text-slate-500">
                <span>Location: <strong className="text-slate-800">{currentJob.location}</strong></span>
                <span className="mx-2">·</span>
                <span>Cutoff: <strong className="text-slate-800">{currentJob.eligibility.minCgpa ?? 'None'} CGPA</strong></span>
              </div>
            )}
          </div>

          {/* Ranked Candidates Table */}
          {isLoadingMatches ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Running eligibility gate and ranking candidate matches...
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Eligible Candidates Ranked by Role Match ({rankedEligible.length})
                  </h3>
                </div>
                {rankedEligible.length >= 2 && (
                  <button
                    onClick={() => handleStartComparison(rankedEligible[0], rankedEligible[1])}
                    className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>Compare Top 2 Candidates</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">Rank</th>
                      <th className="py-3 px-3">Candidate</th>
                      <th className="py-3 px-3">Match Score</th>
                      <th className="py-3 px-3">Required Skills</th>
                      <th className="py-3 px-3">Projects</th>
                      <th className="py-3 px-3">Experience</th>
                      <th className="py-3 px-3">Gate</th>
                      <th className="py-3 px-3">Recruiter Shortlist</th>
                      <th className="py-3 px-3 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rankedEligible.map((cand) => {
                      const shortlistRec = shortlistsMap[cand.studentId];
                      const st = shortlistRec?.status || 'NOT_REVIEWED';

                      return (
                        <tr key={cand.studentId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 text-center font-bold font-mono">
                            #{cand.rank}
                          </td>
                          <td className="py-3 px-3">
                            <strong className="text-slate-900 block">{cand.studentName}</strong>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {cand.studentBranch} · {cand.studentRegNo}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm font-bold font-mono text-teal-800">
                              {cand.score}
                            </span>
                            <span className="text-[10px] text-slate-400"> / 100</span>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {cand.breakdown.requiredSkills.score}%
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {cand.breakdown.projects.score}%
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {cand.breakdown.experience.status === 'APPLICABLE'
                              ? `${cand.breakdown.experience.score}%`
                              : 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                              ELIGIBLE ✓
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {st === 'SHORTLISTED' ? (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                SHORTLISTED ✓
                              </span>
                            ) : st === 'REJECTED' ? (
                              <span className="rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                                REJECTED
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                                NOT REVIEWED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setInspectedCandidate(cand)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                            >
                              <span>Inspect Breakdown</span>
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ineligible Candidates Warning Card */}
          {ineligibleGated.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Ineligible Gated Pool ({ineligibleGated.length} Candidates Excluded)</span>
              </div>
              <p className="text-slate-600">
                These candidates are excluded from recruitment ranking because they did not satisfy one or more mandatory eligibility requirements. Match scores are strictly gated by eligibility.
              </p>
            </div>
          )}

          {/* INSPECTOR MODAL */}
          {inspectedCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {inspectedCandidate.studentName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rank {inspectedCandidate.rank ? `#${inspectedCandidate.rank}` : 'Unranked'} · Match Score: {inspectedCandidate.score}/100
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectedCandidate(null)}
                    className="p-1 rounded text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Dimension Score & Weight Breakdown
                  </span>
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {Object.entries(inspectedCandidate.breakdown).map(([k, item]) => (
                      <div key={k} className="p-2.5 flex items-center justify-between bg-white">
                        <div className="space-y-0.5">
                          <span className="capitalize text-slate-800 font-semibold block">
                            {k.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.reason}</span>
                        </div>
                        <div className="font-mono text-right shrink-0 ml-3">
                          {item.status === 'APPLICABLE' ? (
                            <>
                              <span className="font-bold text-teal-800 block">{item.score}%</span>
                              <span className="text-[10px] text-slate-400">
                                +{item.contribution} pts ({item.normalizedWeight}%)
                              </span>
                            </>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                              N/A
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {inspectedCandidate.strengths.length > 0 && (
                  <div className="space-y-1 text-xs text-emerald-950 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <strong className="font-bold text-emerald-900 block">Verified Strengths:</strong>
                    <ul className="space-y-0.5">
                      {inspectedCandidate.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recruiter Shortlist Status & Justification */}
                {shortlistsMap[inspectedCandidate.studentId] && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Recruiter Shortlisting Decision:
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          shortlistsMap[inspectedCandidate.studentId].status === 'SHORTLISTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : shortlistsMap[inspectedCandidate.studentId].status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {shortlistsMap[inspectedCandidate.studentId].status}
                      </span>
                    </div>
                    <p className="text-slate-600 italic">
                      &quot;{shortlistsMap[inspectedCandidate.studentId].reason}&quot;
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Reviewed by: {shortlistsMap[inspectedCandidate.studentId].reviewedBy}</span>
                      <span>{new Date(shortlistsMap[inspectedCandidate.studentId].updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CANDIDATE COMPARISON MODAL */}
          {showCompareModal && compareCandidateA && compareCandidateB && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-teal-600" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Side-by-Side Candidate Comparison
                      </h3>
                      <p className="text-xs text-slate-500">
                        Evaluating top 2 candidates against position requirements
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="p-1 rounded text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Candidates Header */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3">
                    <span className="text-xs font-bold text-teal-900 block">
                      Candidate #1: {compareCandidateA.studentName}
                    </span>
                    <span className="text-2xl font-extrabold text-teal-800 font-mono mt-1 block">
                      {compareCandidateA.score} / 100
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      Candidate #2: {compareCandidateB.studentName}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-700 font-mono mt-1 block">
                      {compareCandidateB.score} / 100
                    </span>
                  </div>
                </div>

                {/* Dimension Comparison Rows */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Dimensional Comparison
                  </span>
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden font-mono">
                    {Object.keys(compareCandidateA.breakdown).map((k) => {
                      const scoreA = (compareCandidateA.breakdown as any)[k]?.score ?? 0;
                      const scoreB = (compareCandidateB.breakdown as any)[k]?.score ?? 0;
                      return (
                        <div key={k} className="grid grid-cols-3 p-2.5 bg-white text-center">
                          <span className={`font-bold ${scoreA >= scoreB ? 'text-teal-800' : 'text-slate-600'}`}>
                            {scoreA}%
                          </span>
                          <span className="font-sans font-medium text-slate-500 capitalize">
                            {k.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className={`font-bold ${scoreB >= scoreA ? 'text-teal-800' : 'text-slate-600'}`}>
                            {scoreB}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
