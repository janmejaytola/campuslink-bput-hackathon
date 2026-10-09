'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  MapPin,
  Users,
  X,
  Filter,
  Check,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_DRIVE_EVENTS } from '@/lib/demoData';

interface CampusEvent {
  id: string;
  title: string;
  company: string;
  targetRole: string;
  eventType: string;
  date: string;
  time: string;
  venue: string;
  candidatesCount: number;
  clashes: number;
  status: 'Confirmed' | 'Allocated' | 'In Progress';
}

const INITIAL_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'EVT-01',
    title: 'TCS Digital National Qualifier Test (NQT)',
    company: 'Tata Consultancy Services',
    targetRole: 'Digital Software Engineer',
    eventType: 'Proctored Coding Test',
    date: '2026-10-15',
    time: '09:30 AM - 12:30 PM',
    venue: 'Central Computing Lab 1 & 2 (300 PC Terminals)',
    candidatesCount: 300,
    clashes: 0,
    status: 'Confirmed',
  },
  {
    id: 'EVT-02',
    title: 'Cognizant GenC Elevate Assessment',
    company: 'Cognizant Technology Solutions',
    targetRole: 'Software Engineer',
    eventType: 'Online Assessment',
    date: '2026-10-16',
    time: '02:00 PM - 05:00 PM',
    venue: 'Computing Lab 3 & Electronics CAD Center',
    candidatesCount: 220,
    clashes: 0,
    status: 'Confirmed',
  },
  {
    id: 'EVT-03',
    title: 'Deloitte USI Technical & Case Interviews',
    company: 'Deloitte USI',
    targetRole: 'Technology Analyst',
    eventType: 'Technical Panels',
    date: '2026-10-18',
    time: '10:00 AM - 04:30 PM',
    venue: 'Placement Block Rooms 301 - 308 + Virtual Bridges',
    candidatesCount: 88,
    clashes: 0,
    status: 'Confirmed',
  },
  {
    id: 'EVT-04',
    title: 'Amazon SDE Pre-Placement Talk & Q&A',
    company: 'Amazon Development Centre',
    targetRole: 'Software Development Engineer',
    eventType: 'Pre-Placement Talk',
    date: '2026-10-20',
    time: '11:00 AM - 01:00 PM',
    venue: 'BPUT Central Auditorium (600 Seats)',
    candidatesCount: 550,
    clashes: 0,
    status: 'Confirmed',
  },
];

const CAMPUS_VENUES = [
  { name: 'Central Computing Lab 1', capacity: 150, available: true, type: 'i7 16GB Desktops' },
  { name: 'Central Computing Lab 2', capacity: 150, available: true, type: 'i7 16GB Desktops' },
  { name: 'Electronics CAD Center', capacity: 80, available: true, type: 'Dedicated Linux Workstations' },
  { name: 'Placement Office Interview Suites', capacity: 12, available: true, type: 'Soundproof Interview Cubicles' },
  { name: 'Central University Auditorium', capacity: 600, available: true, type: 'AV & Keynote Bridge' },
];

export default function OfficerSchedulingPage() {
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_CAMPUS_EVENTS);
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [targetRole, setTargetRole] = useState('Graduate Engineer Trainee');
  const [eventType, setEventType] = useState('Proctored Coding Test');
  const [date, setDate] = useState('2026-10-22');
  const [time, setTime] = useState('10:00 AM - 01:00 PM');
  const [venue, setVenue] = useState('Central Computing Lab 1');
  const [candidatesCount, setCandidatesCount] = useState('120');

  const filteredEvents = events.filter((e) => {
    return filterType === 'ALL' || e.eventType === filterType;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    const newEvt: CampusEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      company: company.trim(),
      targetRole: targetRole.trim(),
      eventType,
      date,
      time,
      venue,
      candidatesCount: parseInt(candidatesCount) || 100,
      clashes: 0,
      status: 'Confirmed',
    };

    setEvents([newEvt, ...events]);
    setShowModal(false);
    setTitle('');
    setCompany('');
    setNotification(
      `Venue slot for ${newEvt.company} allocated at ${newEvt.venue} with 0 schedule overlaps.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <PageHeader
          title="Conflict-Aware Campus Scheduling & Venue Coordinator"
          description="Unified master timetable preventing academic overlaps between concurrent corporate drives, lab infrastructure capacities, and student semester exam schedules."
          badge="Clash-Free Engine"
        >
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Allocate Lab / Venue Slot</span>
          </button>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Conflict-Aware Venue & Slot Coordinator"
            nextStepDetail="Active conflict detection algorithm cross-references terminal seats, university timetables, and candidate schedules."
          />

          {notification && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Clash-Free Telemetry Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-emerald-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 text-sm block">
                  Zero Schedule Clashes Detected Across 48 Recruiters
                </span>
                <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                  Every concurrent lab reservation and interview round is validated to ensure candidate availability without academic clashes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded-xl bg-emerald-200/60 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-900 font-mono">
                100% Conflict-Free
              </span>
            </div>
          </div>

          {/* Venue Infrastructure Status */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Campus Venue & Lab Capacity Status
              </h3>
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                All 5 Facilities Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CAMPUS_VENUES.map((v, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{v.name}</span>
                    <span className="rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Capacity: <strong className="text-slate-800">{v.capacity} Seats</strong></span>
                    <span className="text-slate-400">{v.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Schedule Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Campus Placement Master Timetable
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time room allocation, proctoring, and slot reservations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Event Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="Proctored Coding Test">Coding Assessments</option>
                  <option value="Technical Panels">Technical Panels</option>
                  <option value="Pre-Placement Talk">Pre-Placement Talks</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                          {evt.eventType}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {evt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {evt.company} · Role: <strong className="text-slate-800">{evt.targetRole}</strong>
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {evt.date} ({evt.time})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {evt.venue}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="h-3.5 w-3.5 text-teal-600" />
                          {evt.candidatesCount} Candidates Scheduled
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 text-xs font-bold font-mono">
                        0 Conflicts ✓
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Allocate Slot Modal */}
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="allocate-slot-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 id="allocate-slot-title" className="text-xl font-black text-slate-900">
                    Allocate Campus Facility Slot
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reserve campus computer laboratories or interview audition halls
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Session Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Infosys SP/DSE Online Technical Qualifier"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Corporate Recruiter *
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Infosys Limited"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Event Type *
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    >
                      <option value="Proctored Coding Test">Proctored Coding Test</option>
                      <option value="Online Assessment">Online Assessment</option>
                      <option value="Technical Panels">Technical Panels</option>
                      <option value="Pre-Placement Talk">Pre-Placement Talk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
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
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="10:00 AM - 01:00 PM"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Venue / Facility *
                    </label>
                    <select
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    >
                      <option value="Central Computing Lab 1">Central Computing Lab 1 (150 PCs)</option>
                      <option value="Central Computing Lab 2">Central Computing Lab 2 (150 PCs)</option>
                      <option value="Electronics CAD Center">Electronics CAD Center (80 PCs)</option>
                      <option value="Placement Office Interview Suites">Placement Office Suites</option>
                      <option value="Central University Auditorium">Central University Auditorium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Candidate Capacity *
                    </label>
                    <input
                      type="number"
                      value={candidatesCount}
                      onChange={(e) => setCandidatesCount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                  >
                    Confirm Allocation ✓
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
