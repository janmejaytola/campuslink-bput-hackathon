'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_JOBS } from '@/lib/demoData';

export default function OfficerDrivesPage() {
  const [drives, setDrives] = useState(DEMO_JOBS);

  return (
    <AppLayoutShell role="officer">
      <PageHeader
        title="Placement Drives Coordination"
        description="Official approval, slot allocation, and monitoring of visiting corporate recruitment drives"
        badge="Drive Orchestration"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Register New Campus Drive
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Campus Drive Lifecycle Manager"
          nextStepDetail="Foundation shell coordinating drive approval workflows, eligibility lock-in, and multi-stage recruiter tracking."
        />

        {/* Drives Grid */}
        <div className="space-y-4">
          {drives.map((drive) => (
            <div
              key={drive.id}
              className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{drive.company}</h3>
                    <StatusBadge
                      status={drive.status}
                      variant={drive.status === 'Active' ? 'brand' : 'neutral'}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{drive.title}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-bold text-teal-800">
                    {drive.packageCTC}
                  </span>
                </div>
              </div>

              {/* Drive Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Applicants</span>
                  <span className="font-bold text-slate-800 text-sm">{drive.applicantsCount} Students</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Shortlisted</span>
                  <span className="font-bold text-teal-800 text-sm">{drive.shortlistedCount} Candidates</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Criteria</span>
                  <span className="font-medium text-slate-800 text-xs">Min CGPA {drive.minCGPA} ({drive.branches.join('/')})</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Deadline</span>
                  <span className="font-medium text-slate-800 text-xs">{drive.deadline}</span>
                </div>
              </div>

              {/* Rounds flow */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700 mr-1 text-[11px]">Evaluation Rounds:</span>
                {drive.rounds.map((round, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200/60"
                  >
                    {round}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayoutShell>
  );
}
