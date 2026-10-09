'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Plus,
  Upload,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  XCircle,
  Sparkles,
  Search,
  Filter,
  Loader2,
  Clock,
  ArrowRight,
  Eye,
  Building,
  MapPin,
  Zap,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { RecruiterJob, JobStatus, WORK_MODE_LABELS, EMPLOYMENT_TYPE_LABELS } from '@/types/job';
import { jobService } from '@/lib/services/jobService';

export default function RecruiterJobsDashboardPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');

  // Confirmation dialogs
  const [actionJob, setActionJob] = useState<RecruiterJob | null>(null);
  const [actionType, setActionType] = useState<'DELETE' | 'CLOSE' | 'DUPLICATE' | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Load jobs from Firestore
  const fetchJobs = useCallback(async () => {
    if (!currentUser?.uid) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await jobService.getRecruiterJobs(currentUser.uid);
      setJobs(data);
    } catch (err: unknown) {
      console.error('[Error fetching recruiter jobs]:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to load jobs from Firestore. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        const data = await jobService.getRecruiterJobs(currentUser.uid);
        if (active) {
          setJobs(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Unable to load jobs from Firestore. Please try again.'
          );
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  // Status counts
  const totalJobs = jobs.length;
  const draftJobs = jobs.filter((j) => j.status === 'DRAFT').length;
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;
  const closedJobs = jobs.filter((j) => j.status === 'CLOSED').length;

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Close Job
  const handleCloseJob = async () => {
    if (!actionJob || !currentUser?.uid) return;
    setIsSubmittingAction(true);
    try {
      await jobService.updateJobStatus(actionJob.id, currentUser.uid, 'CLOSED');
      setSuccessMessage(`Job "${actionJob.title}" closed successfully.`);
      setActionJob(null);
      setActionType(null);
      await fetchJobs();
    } catch (err) {
      console.error('[Close Job Error]:', err);
      setErrorMessage('Failed to close job posting.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Delete Job
  const handleDeleteJob = async () => {
    if (!actionJob || !currentUser?.uid) return;
    setIsSubmittingAction(true);
    try {
      await jobService.deleteJob(actionJob.id, currentUser.uid, actionJob.jdStoragePath);
      setSuccessMessage(`Job "${actionJob.title}" was deleted.`);
      setActionJob(null);
      setActionType(null);
      await fetchJobs();
    } catch (err) {
      console.error('[Delete Job Error]:', err);
      setErrorMessage('Failed to delete job posting.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Duplicate Job
  const handleDuplicateJob = async () => {
    if (!actionJob || !currentUser?.uid) return;
    setIsSubmittingAction(true);
    try {
      const duplicated = await jobService.duplicateJob(actionJob.id, currentUser.uid);
      setSuccessMessage(`Duplicated job as draft: "${duplicated.title}".`);
      setActionJob(null);
      setActionType(null);
      await fetchJobs();
      router.push(`/recruiter/jobs/${duplicated.id}/edit`);
    } catch (err) {
      console.error('[Duplicate Job Error]:', err);
      setErrorMessage('Failed to duplicate job.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#152744] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#007F83]/30 border border-[#00C9C0]/50 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00F5D4] uppercase tracking-wider">
                  <Briefcase className="h-3 w-3 text-[#00F5D4]" />
                  RECRUITER CONSOLE
                </span>
                <span className="text-[11px] font-medium text-slate-400">Corporate Requisitions</span>
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                Job Requisitions
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Create, manage and publish campus placement opportunities with deterministic eligibility rules.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/recruiter/jobs/new?tab=upload"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#00C9C0]/40 bg-[#081B34] px-4 py-2 text-xs font-bold text-[#00F5D4] hover:bg-[#00C9C0]/15 hover:border-[#00C9C0] transition-all shadow-xs cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-[#00F5D4]" />
                <span>Upload JD</span>
              </Link>
              <Link
                href="/recruiter/jobs/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00C9C0] hover:from-[#00A89E] hover:to-[#00F5D4] px-4 py-2 text-xs font-bold text-white transition-all shadow-[0_4px_16px_rgba(0,127,131,0.4)] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Requisition</span>
              </Link>
            </div>
          </div>

          {/* Feedback banners */}
          {errorMessage && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/60 p-4 text-xs font-semibold text-rose-200 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-200 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-400 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* Stats Cards in Dark 3D Glass */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400">Total Listings</span>
              <p className="mt-1 text-2xl font-black text-white font-mono tabular-nums">{totalJobs}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <span className="text-xs font-semibold text-amber-400">Draft</span>
              <p className="mt-1 text-2xl font-black text-amber-300 font-mono tabular-nums">{draftJobs}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <span className="text-xs font-semibold text-emerald-400">Open & Active</span>
              <p className="mt-1 text-2xl font-black text-emerald-300 font-mono tabular-nums">{openJobs}</p>
            </div>
            <div className="rounded-2xl border border-[#152744] bg-[#06172B] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400">Closed</span>
              <p className="mt-1 text-2xl font-black text-slate-300 font-mono tabular-nums">{closedJobs}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, company, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#152744] bg-[#06172B] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00C9C0]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <div className="flex rounded-xl bg-[#06172B] p-1 border border-[#152744] text-xs">
                {(['ALL', 'OPEN', 'DRAFT', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#007F83] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs Table in Dark Glass Panel */}
          {isLoading ? (
            <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-12 text-center shadow-md">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00C9C0]" />
              <p className="mt-3 text-xs font-medium text-slate-400">
                Loading recruiter job positions from Firestore...
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#172D4D] bg-[#081B34]/60 p-12 text-center shadow-md">
              <Briefcase className="mx-auto h-10 w-10 text-slate-500" />
              <h3 className="mt-3 text-sm font-bold text-white">
                {jobs.length === 0 ? 'No jobs created yet.' : 'No matching jobs found.'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                {jobs.length === 0
                  ? 'Start by creating your first campus job position manually or upload an existing JD.'
                  : 'Try adjusting your search terms or status filter.'}
              </p>
              {jobs.length === 0 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Link
                    href="/recruiter/jobs/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00C9C0] px-4 py-2 text-xs font-semibold text-white shadow-md hover:from-[#00A89E] hover:to-[#00F5D4] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create your first job</span>
                  </Link>
                  <Link
                    href="/recruiter/jobs/new?tab=upload"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#00C9C0]/40 bg-[#06172B] px-4 py-2 text-xs font-semibold text-[#00F5D4] hover:bg-[#00C9C0]/15 transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#00F5D4]" />
                    <span>Upload JD Document</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#06172B]/90 border-b border-[#152744] text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Position & Company</th>
                      <th className="py-3 px-4">Work Mode / Type</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Salary / Openings</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#152744] text-slate-300">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#0A2242]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/recruiter/jobs/${job.id}`}
                            className="font-bold text-white hover:text-[#00F5D4] transition-colors block"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-medium text-slate-300">{job.company}</span>
                            {job.aiParsed && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#00F5D4] bg-[#007F83]/30 px-1.5 py-0.2 rounded border border-[#00C9C0]/40">
                                <Sparkles className="h-2.5 w-2.5 text-[#00F5D4]" />
                                AI Parsed
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">
                            {WORK_MODE_LABELS[job.workMode] || job.workMode}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {job.location}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#00F5D4] font-mono">
                            {job.salaryMin != null && job.salaryMax != null
                              ? `₹${job.salaryMin} - ₹${job.salaryMax} LPA`
                              : job.salaryMin != null
                              ? `₹${job.salaryMin}+ LPA`
                              : 'Not specified'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {job.openings ? `${job.openings} Openings` : 'Unspecified Openings'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {job.applicationDeadline ? (
                            <span className="font-medium text-slate-300">
                              {new Date(job.applicationDeadline).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-500">Open</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge
                            status={job.status}
                            variant={job.status === 'OPEN' ? 'success' : job.status === 'DRAFT' ? 'warning' : 'neutral'}
                          />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/recruiter/jobs/${job.id}/matches`}
                              className="p-1.5 text-slate-400 hover:text-[#00F5D4] hover:bg-[#06172B] rounded-lg transition-colors"
                              title="View Candidate Matches"
                            >
                              <Users className="h-3.5 w-3.5 text-[#00C9C0]" />
                            </Link>

                            <Link
                              href={`/recruiter/jobs/${job.id}`}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#06172B] rounded-lg transition-colors"
                              title="View Job Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>

                            <Link
                              href={`/recruiter/jobs/${job.id}/edit`}
                              className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-[#06172B] rounded-lg transition-colors"
                              title="Edit Job"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActionJob(job);
                                setActionType('DUPLICATE');
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#06172B] rounded-lg transition-colors cursor-pointer"
                              title="Duplicate as Draft"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>

                            {job.status === 'OPEN' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionJob(job);
                                  setActionType('CLOSE');
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#06172B] rounded-lg transition-colors cursor-pointer"
                                title="Close Position"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setActionJob(job);
                                setActionType('DELETE');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#06172B] rounded-lg transition-colors cursor-pointer"
                              title="Delete Job"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONFIRMATION MODALS in Dark 3D Glass */}
          {actionJob && actionType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040D1A]/80 backdrop-blur-md p-4">
              <div className="w-full max-w-md rounded-2xl bg-[#081B34] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.7)] border border-[#152744] text-white animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  {actionType === 'DELETE' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-400">
                      <Trash2 className="h-5 w-5" />
                    </div>
                  ) : actionType === 'CLOSE' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400">
                      <XCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#007F83]/30 border border-[#00C9C0]/40 text-[#00F5D4]">
                      <Copy className="h-5 w-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">
                      {actionType === 'DELETE'
                        ? 'Delete Job Posting'
                        : actionType === 'CLOSE'
                        ? 'Close Job Posting'
                        : 'Duplicate Job Posting'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {actionType === 'DELETE'
                        ? `Are you sure you want to permanently delete "${actionJob.title}"? Any uploaded JD file will also be removed. This action cannot be undone.`
                        : actionType === 'CLOSE'
                        ? `Are you sure you want to close "${actionJob.title}"? Students will no longer be able to apply, but position records and history will be preserved.`
                        : `Duplicate "${actionJob.title}" into a new DRAFT position? You can modify its criteria before publishing.`}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#152744]">
                  <button
                    type="button"
                    onClick={() => {
                      setActionJob(null);
                      setActionType(null);
                    }}
                    disabled={isSubmittingAction}
                    className="rounded-xl border border-[#152744] bg-[#06172B] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  {actionType === 'DELETE' && (
                    <button
                      type="button"
                      onClick={handleDeleteJob}
                      disabled={isSubmittingAction}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Delete Job</span>
                    </button>
                  )}

                  {actionType === 'CLOSE' && (
                    <button
                      type="button"
                      onClick={handleCloseJob}
                      disabled={isSubmittingAction}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Close Job</span>
                    </button>
                  )}

                  {actionType === 'DUPLICATE' && (
                    <button
                      type="button"
                      onClick={handleDuplicateJob}
                      disabled={isSubmittingAction}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00C9C0] px-4 py-2 text-xs font-semibold text-white hover:from-[#00A89E] hover:to-[#00F5D4] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Duplicate as Draft</span>
                    </button>
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
