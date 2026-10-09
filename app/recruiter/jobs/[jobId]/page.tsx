'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Edit3,
  Copy,
  Trash2,
  XCircle,
  Sparkles,
  ChevronRight,
  Loader2,
  Sliders,
  Award,
  ShieldCheck,
  FileText,
  DollarSign,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import { RecruiterJob, JobStatus, WORK_MODE_LABELS, EMPLOYMENT_TYPE_LABELS } from '@/types/job';
import { jobService } from '@/lib/services/jobService';

export default function JobDetailPage() {
  const { currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Confirmation modals
  const [confirmModal, setConfirmModal] = useState<'PUBLISH' | 'CLOSE' | 'DELETE' | 'DUPLICATE' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchJob = useCallback(async () => {
    if (!jobId || !currentUser?.uid) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await jobService.getJobById(jobId);
      if (!data) {
        setErrorMessage('Job position was not found.');
        return;
      }
      if (data.recruiterId !== currentUser.uid) {
        setErrorMessage('You do not have permission to view or manage this job.');
        return;
      }
      setJob(data);
    } catch (err: unknown) {
      console.error('[Error fetching job detail]:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load job details.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId, currentUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!jobId || !currentUser?.uid) return;
      try {
        const data = await jobService.getJobById(jobId);
        if (!active) return;
        if (!data) {
          setErrorMessage('Job position was not found.');
          setIsLoading(false);
          return;
        }
        if (data.recruiterId !== currentUser.uid) {
          setErrorMessage('You do not have permission to view or manage this job.');
          setIsLoading(false);
          return;
        }
        setJob(data);
        setIsLoading(false);
      } catch (err: unknown) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load job details.');
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, currentUser?.uid]);

  // Handle Publish
  const handlePublish = async () => {
    if (!job || !currentUser?.uid) return;
    setIsProcessing(true);
    try {
      await jobService.updateJobStatus(job.id, currentUser.uid, 'OPEN');
      setSuccessMessage('Job position has been published and is now OPEN.');
      setConfirmModal(null);
      await fetchJob();
    } catch (err) {
      console.error('[Publish Job Error]:', err);
      setErrorMessage('Failed to publish job opening.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Close
  const handleClose = async () => {
    if (!job || !currentUser?.uid) return;
    setIsProcessing(true);
    try {
      await jobService.updateJobStatus(job.id, currentUser.uid, 'CLOSED');
      setSuccessMessage('Job position has been CLOSED.');
      setConfirmModal(null);
      await fetchJob();
    } catch (err) {
      console.error('[Close Job Error]:', err);
      setErrorMessage('Failed to close job.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!job || !currentUser?.uid) return;
    setIsProcessing(true);
    try {
      await jobService.deleteJob(job.id, currentUser.uid, job.jdStoragePath);
      router.push('/recruiter/jobs');
    } catch (err) {
      console.error('[Delete Job Error]:', err);
      setErrorMessage('Failed to delete job.');
      setIsProcessing(false);
    }
  };

  // Handle Duplicate
  const handleDuplicate = async () => {
    if (!job || !currentUser?.uid) return;
    setIsProcessing(true);
    try {
      const duplicated = await jobService.duplicateJob(job.id, currentUser.uid);
      router.push(`/recruiter/jobs/${duplicated.id}`);
    } catch (err) {
      console.error('[Duplicate Job Error]:', err);
      setErrorMessage('Failed to duplicate job.');
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            OPEN & ACTIVE
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            DRAFT POSITION
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
            CLOSED POSITION
          </span>
        );
    }
  };

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <div className="space-y-6 pb-12 max-w-5xl mx-auto">
          {/* Top Breadcrumb & Actions */}
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
                <span className="text-xs font-semibold text-teal-700">Position Overview</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                {job ? job.title : 'Job Details'}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {job ? `${job.company} · ${job.location}` : 'Loading position specifications...'}
              </p>
            </div>

            {job && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/recruiter/jobs/${job.id}/matches`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Candidate Matches</span>
                </Link>

                <Link
                  href={`/recruiter/jobs/${job.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Edit Position</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setConfirmModal('DUPLICATE')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Duplicate</span>
                </button>

                {job.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={() => setConfirmModal('PUBLISH')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Publish Job</span>
                  </button>
                )}

                {job.status === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => setConfirmModal('CLOSE')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5 text-amber-700" />
                    <span>Close Position</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmModal('DELETE')}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">
                Loading position details from Firestore...
              </p>
            </div>
          ) : job ? (
            <>
              {/* POSITION HERO CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    {job.aiParsed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200/60">
                        <Sparkles className="h-3 w-3 text-teal-600" />
                        AI Parsed JD
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400">
                    Created: {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Primary specs row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Work Mode</span>
                    <p className="mt-0.5 text-xs font-bold text-slate-900">
                      {WORK_MODE_LABELS[job.workMode] || job.workMode}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Employment Type</span>
                    <p className="mt-0.5 text-xs font-bold text-slate-900">
                      {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Package CTC</span>
                    <p className="mt-0.5 text-xs font-bold text-slate-900 font-mono">
                      {job.salaryMin != null && job.salaryMax != null
                        ? `₹${job.salaryMin} - ₹${job.salaryMax} LPA`
                        : job.salaryMin != null
                        ? `₹${job.salaryMin}+ LPA`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Openings</span>
                    <p className="mt-0.5 text-xs font-bold text-slate-900 font-mono">
                      {job.openings ? `${job.openings} Positions` : 'Unspecified'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>Location: <strong className="text-slate-800">{job.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>
                      Deadline:{' '}
                      <strong className="text-slate-800">
                        {job.applicationDeadline
                          ? new Date(job.applicationDeadline).toLocaleDateString()
                          : 'Open'}
                      </strong>
                    </span>
                  </div>
                  {job.driveDate && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Drive Date: <strong className="text-slate-800">{job.driveDate}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1. JOB DESCRIPTION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                  1. Job Description & Responsibilities
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* 2. ELIGIBILITY REQUIREMENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  2. Mandatory Eligibility Criteria
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Minimum CGPA</span>
                    <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                      {job.eligibility.minCgpa != null ? `${job.eligibility.minCgpa} / 10.0` : 'No minimum'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Maximum Backlogs</span>
                    <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                      {job.eligibility.maxBacklogs != null ? job.eligibility.maxBacklogs : 'No limit'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Min Experience</span>
                    <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                      {job.eligibility.minExperienceMonths} Months
                    </p>
                  </div>
                </div>

                {/* Branches */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">Eligible Academic Branches</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.eligibility.branches.map((b, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200/60"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Graduation Years */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">Eligible Graduation Years</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.eligibility.graduationYears.map((y, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                      >
                        Batch {y}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Certifications */}
                {job.eligibility.requiredCertifications && job.eligibility.requiredCertifications.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">Required Certifications</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.eligibility.requiredCertifications.map((c, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. REQUIRED SKILLS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span>3. Mandatory Required Skills</span>
                  <span className="text-xs font-semibold text-teal-700">
                    {job.requiredSkills.length} Competencies
                  </span>
                </h3>

                {job.requiredSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No specific required skills specified.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.requiredSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-900">{sk.name}</span>
                        <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                          {sk.requiredLevel} / 100
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. PREFERRED SKILLS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span>4. Preferred Skills (Nice to Have)</span>
                  <span className="text-xs text-slate-400">
                    {job.preferredSkills.length} Competencies
                  </span>
                </h3>

                {job.preferredSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No preferred skills declared.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.preferredSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-900">{sk.name}</span>
                        <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {sk.preferredLevel} / 100
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. AUDIT & DOCUMENT TRACEABILITY */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                  5. Position Audit & Source Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">JD Source</span>
                    <strong className="text-slate-800">{job.jdSource}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">AI Parsed</span>
                    <strong className="text-slate-800">{job.aiParsed ? 'Yes (Verified Parser)' : 'No'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Created At</span>
                    <strong className="text-slate-800">{new Date(job.createdAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Updated</span>
                    <strong className="text-slate-800">{new Date(job.updatedAt).toLocaleString()}</strong>
                  </div>
                </div>

                {job.jdFileName && (
                  <div className="pt-2 text-xs text-slate-600 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-teal-600" />
                    <span>Uploaded document: <strong className="text-slate-800">{job.jdFileName}</strong></span>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {/* ACTION CONFIRMATION MODALS */}
          {confirmModal && job && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  {confirmModal === 'DELETE' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                      <Trash2 className="h-5 w-5" />
                    </div>
                  ) : confirmModal === 'CLOSE' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <XCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {confirmModal === 'PUBLISH'
                        ? 'Publish Campus Job Opening'
                        : confirmModal === 'CLOSE'
                        ? 'Close Position'
                        : confirmModal === 'DELETE'
                        ? 'Permanently Delete Position'
                        : 'Duplicate Position'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {confirmModal === 'PUBLISH'
                        ? 'Publishing this job will make it active (OPEN) and available for placement coordination. Continue?'
                        : confirmModal === 'CLOSE'
                        ? 'Closing this job will prevent new applications while preserving historical position data.'
                        : confirmModal === 'DELETE'
                        ? `Are you sure you want to permanently delete "${job.title}"? This cannot be undone.`
                        : `Duplicate "${job.title}" into a new DRAFT position?`}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    disabled={isProcessing}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  {confirmModal === 'PUBLISH' && (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Confirm & Publish</span>
                    </button>
                  )}

                  {confirmModal === 'CLOSE' && (
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Confirm & Close</span>
                    </button>
                  )}

                  {confirmModal === 'DELETE' && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Delete Job</span>
                    </button>
                  )}

                  {confirmModal === 'DUPLICATE' && (
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
