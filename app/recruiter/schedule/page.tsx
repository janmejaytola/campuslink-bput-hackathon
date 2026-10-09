'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';

const PANELS = [
  {
    id: 'p1',
    roundName: 'Online Coding Test (Proctored)',
    date: '2026-10-10',
    time: '10:00 AM - 12:30 PM',
    venue: 'Central Computing Lab 1 & 2 (300 PC Terminals)',
    candidatesCount: 300,
    status: 'Confirmed',
    conflicts: 0,
  },
  {
    id: 'p2',
    roundName: 'Technical Panel A (Distributed Systems)',
    date: '2026-10-12',
    time: '10:00 AM - 01:00 PM',
    venue: 'Placement Block Room 302 + Virtual Video Bridge',
    candidatesCount: 16,
    status: 'Confirmed',
    conflicts: 0,
  },
  {
    id: 'p3',
    roundName: 'Technical Panel B (Cloud & Backend)',
    date: '2026-10-12',
    time: '02:00 PM - 05:00 PM',
    venue: 'Placement Block Room 303 + Virtual Video Bridge',
    candidatesCount: 14,
    status: 'Confirmed',
    conflicts: 0,
  },
];

export default function RecruiterSchedulePage() {
  const [panels, setPanels] = useState(PANELS);

  return (
    <AppLayoutShell role="recruiter">
      <PageHeader
        title="Interview Panel Scheduling & Venue Coordination"
        description="Allocate interview panels, testing labs, and slots with real-time clash avoidance against university exams"
        badge="Zero Clashes"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Interview Panel Slot
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Recruiter Panel & Venue Scheduler"
          nextStepDetail="Foundation shell connecting corporate interviewer availability with campus lab infrastructure and student calendars."
        />

        {/* Conflict Detection Banner */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900">Zero Schedule Conflicts</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                All interview rooms and assigned candidate slots are reconciled with BPUT academic timetables.
              </p>
            </div>
          </div>
          <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-1 text-[11px] font-semibold text-emerald-900">
            Audit Passed
          </span>
        </div>

        {/* Panel Cards */}
        <div className="space-y-4">
          {panels.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.roundName}</h3>
                  <span className="text-xs text-slate-500">Corporate Assessment Slot</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
                    {p.candidatesCount} Candidates
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <span>Date: <strong className="text-slate-700">{p.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Time: <strong className="text-slate-700">{p.time}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="truncate">Venue: <strong className="text-slate-700">{p.venue}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayoutShell>
  );
}
