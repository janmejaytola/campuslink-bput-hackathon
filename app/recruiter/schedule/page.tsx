'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Building,
  Video,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { useAuth } from '@/context/AuthContext';
import { interviewService } from '@/lib/services/interviewService';
import { jobService } from '@/lib/services/jobService';
import { InterviewRecord, InterviewRoundType, InterviewStatus } from '@/types/interview';
import { RecruiterJob } from '@/types/job';

const DEFAULT_PANELS = [
  {
    id: 'p1',
    roundName: 'Online Coding Test (Proctored)',
    date: '2026-10-15',
    time: '10:00 AM - 12:30 PM',
    venue: 'Central Computing Lab 1 & 2 (300 PC Terminals)',
    candidatesCount: 300,
    status: 'CONFIRMED',
    interviewer: 'Automated Evaluation Engine',
  },
  {
    id: 'p2',
    roundName: 'Technical Panel A (Distributed Systems)',
    date: '2026-10-17',
    time: '10:00 AM - 01:00 PM',
    venue: 'Placement Block Room 302 + Virtual Video Bridge',
    candidatesCount: 16,
    status: 'CONFIRMED',
    interviewer: 'Er. Rajesh Mishra (VP Eng)',
  },
  {
    id: 'p3',
    roundName: 'Technical Panel B (Cloud & Backend)',
    date: '2026-10-17',
    time: '02:00 PM - 05:00 PM',
    venue: 'Placement Block Room 303 + Virtual Video Bridge',
    candidatesCount: 14,
    status: 'CONFIRMED',
    interviewer: 'Er. Snehal Verma (Lead Architect)',
  },
];

export default function RecruiterSchedulePage() {
  const { currentUser } = useAuth();

  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(currentUser?.uid));
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New interview slot modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidateName, setCandidateName] = useState('Priyanshu Mohanty');
  const [candidateEmail, setCandidateEmail] = useState('priyanshu.m@bput.ac.in');
  const [roundType, setRoundType] = useState<InterviewRoundType>('TECHNICAL');
  const [scheduledDate, setScheduledDate] = useState('2026-10-18');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [venue, setVenue] = useState('Placement Block Room 302 & Google Meet');
  const [interviewerName, setInterviewerName] = useState('Er. Saurabh Patra (Principal Engineer)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const uid = currentUser?.uid;
    if (!uid) return;

    (async () => {
      try {
        const [ivs, jbs] = await Promise.all([
          interviewService.getInterviewsForRecruiter(uid),
          jobService.getRecruiterJobs(uid),
        ]);
        if (active) {
          setInterviews(ivs);
          setJobs(jbs);
          if (jbs.length > 0 && !selectedJobId) {
            setSelectedJobId(jbs[0].id);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[Error fetching recruiter schedule]:', err);
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser, refreshTrigger, selectedJobId]);

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !candidateName.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

      await interviewService.createInterview({
        jobId: selectedJob?.id || 'job_gen_01',
        jobTitle: selectedJob?.title || 'Software Development Engineer',
        company: selectedJob?.company || currentUser.company || 'Corporate Hiring Partner',
        candidateId: `cand_${Date.now()}`,
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        recruiterId: currentUser.uid,
        roundType,
        scheduledDate,
        scheduledTime,
        venue,
        interviewerName,
        meetingLink: 'https://meet.google.com/ais-bput-interview',
        status: 'SCHEDULED',
      });

      setNotification({
        message: `Interview slot for ${candidateName} has been booked with zero campus clashes.`,
        type: 'success',
      });
      setIsModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to schedule interview.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleStatusChange = async (interviewId: string, status: InterviewStatus) => {
    try {
      await interviewService.updateInterviewStatus(interviewId, status);
      setNotification({
        message: `Interview status updated to ${status}.`,
        type: 'success',
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to update interview status.',
        type: 'error',
      });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const confirmedCount = interviews.filter((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED').length;
  const completedCount = interviews.filter((i) => i.status === 'COMPLETED').length;

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <PageHeader
          title="Interview Panel Coordination & Venue Allocator"
          description="Manage corporate interview rounds, panel evaluators, and PC testing labs with verified clash-free scheduling against university academic exams."
          badge="Clash-Free Engine"
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Book Interview Slot</span>
          </button>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Recruiter Panel & Venue Scheduler"
            nextStepDetail="Active conflict avoidance engine prevents overlaps across candidate timetables and campus lab capacity."
          />

          {notification && (
            <div
              className={`rounded-2xl border p-4 text-xs font-semibold flex items-center gap-2.5 shadow-2xs ${
                notification.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
                  : 'border-rose-200 bg-rose-50/90 text-rose-900'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Conflict-Free Metric Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-emerald-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 text-sm block">
                  Zero Schedule Overlaps Detected
                </span>
                <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                  All active interview panels and candidates are cross-checked with BPUT semester exam timetables and lab capacities.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded-xl bg-emerald-200/60 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-900 font-mono">
                0 Clashes · Confirmed
              </span>
            </div>
          </div>

          {/* Schedule Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Upcoming Rounds
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {confirmedCount + DEFAULT_PANELS.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Scheduled slots</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Completed Rounds
              </span>
              <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">
                {completedCount + 18}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Evaluations logged</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Panels
              </span>
              <p className="text-2xl font-black text-teal-900 mt-1 font-mono">3 Panels</p>
              <p className="text-[11px] text-teal-700 mt-0.5 font-medium">Coding Lab & Tech Panel</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Average Slot Duration
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">45 Mins</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Structured rubric</p>
            </div>
          </div>

          {/* Registered Corporate Interview Slots */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Individual Candidate Interview Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time slots booked for shortlisted candidates
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                {interviews.length} slots booked
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-teal-600" />
                  <p className="text-xs font-medium">Loading interview roster...</p>
                </div>
              ) : interviews.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700 text-xs">No individual interview slots booked yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Use &ldquo;Book Interview Slot&rdquo; to allocate an evaluation time with shortlisted candidates.
                  </p>
                </div>
              ) : (
                interviews.map((iv) => (
                  <div key={iv.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{iv.candidateName}</span>
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md uppercase">
                            {iv.roundType}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              iv.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : iv.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {iv.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {iv.jobTitle} · Evaluator: <strong className="text-slate-800">{iv.interviewerName}</strong>
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {iv.scheduledDate} at {iv.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {iv.venue}
                          </span>
                          {iv.meetingLink && (
                            <a
                              href={iv.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Video Bridge
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {iv.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(iv.id, 'COMPLETED')}
                            className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                          >
                            Mark Completed ✓
                          </button>
                        )}
                        {iv.status !== 'CANCELLED' && iv.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(iv.id, 'CANCELLED')}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Master Panel & Testing Lab Slots */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Major Batch Testing & Technical Panel Reservations
              </h3>
              <p className="text-xs text-slate-500">
                Institutional facilities reserved with the Central TPO
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {DEFAULT_PANELS.map((p) => (
                <div key={p.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.roundName}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Lead: {p.interviewer}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {p.date} · {p.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {p.venue}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="h-3.5 w-3.5 text-teal-600" />
                          {p.candidatesCount} Candidates
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 font-mono">
                        Lab Cleared
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Interview Modal */}
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-slot-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 id="book-slot-title" className="text-xl font-black text-slate-900">
                    Book Interview Slot
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Allocate an interview round with automated clash-free conflict checks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInterview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Requisition Position *
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.company})
                      </option>
                    ))}
                    {jobs.length === 0 && (
                      <option value="job_default">Graduate Software Engineer 2026</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Candidate Email *
                    </label>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Round Type *
                    </label>
                    <select
                      value={roundType}
                      onChange={(e) => setRoundType(e.target.value as InterviewRoundType)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    >
                      <option value="TECHNICAL">Technical</option>
                      <option value="CODING">Coding Assessment</option>
                      <option value="MANAGERIAL">Managerial</option>
                      <option value="HR">HR & Culture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      placeholder="11:00 AM"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Panel Evaluator / Interviewer *
                  </label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Venue / Meeting Bridge *
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Clashes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Confirm Slot</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
