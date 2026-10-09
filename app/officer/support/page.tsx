'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  Send,
  X,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  User,
  GraduationCap,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';

interface SupportTicket {
  id: string;
  student: string;
  reg: string;
  subject: string;
  category: 'Academic Audit' | 'Offer Management' | 'Scheduling Conflict' | 'Eligibility Appeal';
  status: 'In Review' | 'Resolved' | 'Escalated';
  submittedAt: string;
  priority: 'High' | 'Normal' | 'Urgent';
  body: string;
  response?: string;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-2026-101',
    student: 'Debashis Panda',
    reg: '2201106088',
    subject: 'Semester 6 CGPA Verification Update for TCS Digital',
    category: 'Academic Audit',
    status: 'In Review',
    submittedAt: 'Today, 11:20 AM',
    priority: 'High',
    body: 'Re-evaluation score for Data Communications updated my 6th-sem SGPA to 8.65, changing overall CGPA to 8.42. Requesting sync with TCS eligibility gate.',
  },
  {
    id: 'TCK-2026-098',
    student: 'Priyanka Das',
    reg: '2201106190',
    subject: 'Offer Letter Acceptance Acknowledgement for TCS Digital',
    category: 'Offer Management',
    status: 'Resolved',
    submittedAt: 'Yesterday',
    priority: 'Normal',
    body: 'Signed offer letter uploaded. Seeking university TPO counter-signature for official records.',
    response: 'Counter-signature verified and sealed. Offer status updated to ACCEPTED in Central Placement Registry.',
  },
  {
    id: 'TCK-2026-094',
    student: 'Rohan Tripathy',
    reg: '2201106312',
    subject: 'Lab Assessment Slot Rescheduling Query for Deloitte USI',
    category: 'Scheduling Conflict',
    status: 'Resolved',
    submittedAt: '2 days ago',
    priority: 'Normal',
    body: 'Had university mid-term laboratory on 10th Oct morning. Requested shift to Afternoon Shift 2.',
    response: 'Rescheduled to 02:00 PM slot in Central Computing Lab 2. Recruiter acknowledged without penalty.',
  },
  {
    id: 'TCK-2026-089',
    student: 'Sneha Nayak',
    reg: '2201106405',
    subject: 'Specialization Branch Mapping for Amazon SDE Drive',
    category: 'Eligibility Appeal',
    status: 'In Review',
    submittedAt: '3 days ago',
    priority: 'High',
    body: 'Enrolled in B.Tech Computer Science with specialization in AI/ML. Amazon posting listed CSE & IT; requesting eligibility confirmation.',
  },
];

export default function OfficerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // New Ticket Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newStudent, setNewStudent] = useState('');
  const [newReg, setNewReg] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('Academic Audit');
  const [newBody, setNewBody] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reg.includes(searchTerm) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesStat = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  const handleResolveTicket = (ticketId: string) => {
    if (!replyText.trim()) return;

    setTickets(
      tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'Resolved',
              response: replyText.trim(),
            }
          : t
      )
    );

    setNotification(`Ticket ${ticketId} resolved and response dispatched to candidate.`);
    setSelectedTicket(null);
    setReplyText('');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.trim() || !newSubject.trim()) return;

    const newTck: SupportTicket = {
      id: `TCK-2026-${Math.floor(110 + Math.random() * 90)}`,
      student: newStudent.trim(),
      reg: newReg.trim() || '2201106000',
      subject: newSubject.trim(),
      category: newCategory,
      status: 'In Review',
      submittedAt: 'Just now',
      priority: 'High',
      body: newBody.trim() || 'Logged via University TPO Helpdesk Console.',
    };

    setTickets([newTck, ...tickets]);
    setShowNewModal(false);
    setNewStudent('');
    setNewReg('');
    setNewSubject('');
    setNewBody('');
    setNotification(`Support ticket ${newTck.id} opened for ${newTck.student}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const openTickets = tickets.filter((t) => t.status === 'In Review').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <PageHeader
          title="Placement Grievance & Student Support Desk"
          description="Institutional inquiry management, transcript correction requests, eligibility appeals, and corporate coordination helpdesk."
          badge="BPUT TPO Helpdesk"
        >
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Log Inward Inquiry</span>
          </button>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Placement Grievance & Query Resolution Desk"
            nextStepDetail="Active student support tickets, CGPA re-evaluation appeals, and institutional response dispatch."
          />

          {notification && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Queries Logged
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {tickets.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Campus cycle 2026</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                In Review / Pending
              </span>
              <p className="text-2xl font-black text-amber-950 mt-1 font-mono">
                {openTickets}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Awaiting TPO decision</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Resolved & Closed
              </span>
              <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                {resolvedTickets}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Dispatched to candidate</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Average Resolution Time
              </span>
              <p className="text-2xl font-black text-teal-900 mt-1 font-mono">2.4 Hours</p>
              <p className="text-[11px] text-teal-700 mt-0.5 font-medium">Within SLA target</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search queries by candidate name, roll number, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Academic Audit">Academic Audit</option>
                    <option value="Offer Management">Offer Management</option>
                    <option value="Scheduling Conflict">Scheduling Conflict</option>
                    <option value="Eligibility Appeal">Eligibility Appeal</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-xs">No support queries found matching criteria.</p>
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedTicket(t);
                      setReplyText(t.response || '');
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{t.id}</span>
                          <span className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase">
                            {t.category}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              t.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {t.status}
                          </span>
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            {t.priority}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                          {t.subject}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {t.body}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="font-medium text-slate-600">
                            Candidate: {t.student} (Roll #{t.reg})
                          </span>
                          <span>·</span>
                          <span>Submitted: {t.submittedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-hover:border-teal-300 group-hover:text-teal-800 transition-colors shadow-2xs"
                        >
                          {t.status === 'Resolved' ? 'View Details' : 'Review & Resolve →'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ticket Review & Resolution Modal */}
        {selectedTicket && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setSelectedTicket(null)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {selectedTicket.id}
                    </span>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded uppercase">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 id="ticket-modal-title" className="text-lg font-black text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Candidate: {selectedTicket.student} · Roll #{selectedTicket.reg}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">
                  Student Inquiry Statement
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedTicket.body}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700">
                  Placement Officer Response & Resolution Note *
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Draft official institutional response..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  disabled={!replyText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>Dispatch Official Resolution</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Log Inward Inquiry Modal */}
        {showNewModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-ticket-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setShowNewModal(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 id="new-ticket-title" className="text-xl font-black text-slate-900">
                    Log Student Placement Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record formal candidate inquiry or academic eligibility appeal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Candidate Name *
                    </label>
                    <input
                      type="text"
                      value={newStudent}
                      onChange={(e) => setNewStudent(e.target.value)}
                      placeholder="e.g. Priyanshu Mohanty"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={newReg}
                      onChange={(e) => setNewReg(e.target.value)}
                      placeholder="2201106284"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Query Subject *
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Brief summary of inquiry"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inquiry Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SupportTicket['category'])}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="Academic Audit">Academic Audit & CGPA</option>
                    <option value="Offer Management">Offer Management</option>
                    <option value="Scheduling Conflict">Scheduling Conflict</option>
                    <option value="Eligibility Appeal">Eligibility Appeal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inquiry Details *
                  </label>
                  <textarea
                    rows={3}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Provide full description of the case..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                  >
                    Log Ticket
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
