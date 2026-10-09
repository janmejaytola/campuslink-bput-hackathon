'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Plus,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';

const DEMO_TICKETS = [
  {
    id: 'TCK-2026-101',
    student: 'Debashis Panda (2201106088)',
    subject: 'Semester 6 CGPA Verification Update',
    category: 'Academic Audit',
    status: 'In Review',
    submittedAt: 'Today, 11:20 AM',
    priority: 'High',
  },
  {
    id: 'TCK-2026-098',
    student: 'Priyanka Das (2201106190)',
    subject: 'Offer Letter Acceptance Acknowledgement for TCS Digital',
    category: 'Offer Management',
    status: 'Resolved',
    submittedAt: 'Yesterday',
    priority: 'Normal',
  },
  {
    id: 'TCK-2026-094',
    student: 'Rohan Tripathy (2201106312)',
    subject: 'Lab Assessment Slot Rescheduling Query for Deloitte USI',
    category: 'Scheduling Conflict',
    status: 'Resolved',
    submittedAt: '2 days ago',
    priority: 'Normal',
  },
];

export default function OfficerSupportPage() {
  const [tickets, setTickets] = useState(DEMO_TICKETS);

  return (
    <AppLayoutShell role="officer">
      <PageHeader
        title="Placement Support & Grievance Desk"
        description="University student query resolution, eligibility appeals, and recruitment assistance"
        badge="Helpdesk"
      />

      <div className="space-y-6">
        <PS10Notice
          moduleName="Placement Grievance & Query Desk"
          nextStepDetail="Foundation shell logging student support tickets and institutional response pipelines."
        />

        {/* Tickets List */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Queries ({tickets.length})</h3>
            <span className="text-xs text-slate-500">Average response time: 2.4 hours</span>
          </div>

          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{t.id}</span>
                    <StatusBadge
                      status={t.status}
                      variant={t.status === 'Resolved' ? 'success' : 'warning'}
                    />
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500">From: {t.student} · {t.submittedAt}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Query & Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayoutShell>
  );
}
