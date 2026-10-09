'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_DRIVE_EVENTS } from '@/lib/demoData';

export default function StudentSchedulePage() {
  return (
    <AppLayoutShell role="student">
      <PageHeader
        title="Interview & Assessment Schedule"
        description="Conflict-aware timeline for recruitment drives, online tests, and panel interviews"
        badge="Zero Clashes"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            0 Scheduling Conflicts
          </span>
        </div>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Conflict-Aware Scheduling Coordinator"
          nextStepDetail="Foundation shell monitoring slot overlap detection, room availability, and parallel drive constraints."
        />

        {/* Schedule List */}
        <div className="space-y-4">
          {DEMO_DRIVE_EVENTS.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-100 font-bold text-sm">
                    {event.date.split('-')[2]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{event.title}</h3>
                    <p className="text-xs text-slate-500">{event.company} · {event.targetRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {event.eventType}
                  </span>
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Confirmed Slot
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{event.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{event.venueOrLink}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Verified by TPO Office</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayoutShell>
  );
}
