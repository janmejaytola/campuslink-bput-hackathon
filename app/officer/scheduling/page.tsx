'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_DRIVE_EVENTS } from '@/lib/demoData';

export default function OfficerSchedulingPage() {
  const [events, setEvents] = useState(DEMO_DRIVE_EVENTS);

  return (
    <AppLayoutShell role="officer">
      <PageHeader
        title="Conflict-Aware Campus Scheduling & Venue Management"
        description="Unified master calendar preventing time clashes between concurrent drives, lab availability, and candidate interviews"
        badge="Clash-Free Engine"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Allocate Lab / Venue Slot
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Conflict-Aware Venue & Slot Coordinator"
          nextStepDetail="Automated clash detection across lab capacities, candidate schedules, and recruiter panels."
        />

        {/* Clash Status Banner */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900">Zero Schedule Overlaps Detected</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                All 6 registered companies and 1,420 candidates have mutually exclusive assessment slots.
              </p>
            </div>
          </div>
          <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-1 text-[11px] font-semibold text-emerald-900">
            Validated
          </span>
        </div>

        {/* Master Timetable */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Campus Placement Event Schedule</h3>
            <p className="text-xs text-slate-500">Real-time room allocation & slot reservations</p>
          </div>

          <div className="divide-y divide-slate-100">
            {events.map((evt) => (
              <div key={evt.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                        {evt.eventType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{evt.company} · {evt.targetRole}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Slot Confirmed
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span>Date: <strong className="text-slate-700">{evt.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Slot: <strong className="text-slate-700">{evt.timeSlot}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="truncate">Venue: <strong className="text-slate-700">{evt.venueOrLink}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayoutShell>
  );
}
