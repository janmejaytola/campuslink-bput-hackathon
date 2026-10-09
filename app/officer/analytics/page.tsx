'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Building,
  Users,
  Award,
  Calendar,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { PS10Notice } from '@/components/common/PS10Notice';

const BRANCH_STATS = [
  { branch: 'Computer Science & Engineering (CSE)', eligible: 480, placed: 412, pct: 85.8 },
  { branch: 'Information Technology (IT)', eligible: 240, placed: 198, pct: 82.5 },
  { branch: 'Electronics & Communication (ECE)', eligible: 380, placed: 281, pct: 73.9 },
  { branch: 'Electrical Engineering (EE)', eligible: 320, placed: 208, pct: 65.0 },
];

export default function OfficerAnalyticsPage() {
  return (
    <AppLayoutShell role="officer">
      <PageHeader
        title="Institutional Placement Analytics & Intelligence"
        description="Comprehensive placement telemetry across BPUT disciplines, compensation packages, and corporate partners"
        badge="Analytics Engine"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Export Institutional Report
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Placement Intelligence & Analytics Engine"
          nextStepDetail="Active institutional cohort analytics, discipline-wise placement trends, and compensation distributions."
        />

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Average Compensation (CTC)"
            value="₹8.40 LPA"
            subtext="+14.2% vs previous graduating batch"
            icon={TrendingUp}
            trend={{ value: '14.2%', positive: true }}
            highlight
          />
          <StatCard
            label="Highest Package Offered"
            value="₹24.50 LPA"
            subtext="Amazon Development Centre"
            icon={Award}
          />
          <StatCard
            label="Overall Placement Ratio"
            value="72.4%"
            subtext="1,099 offers across 1,420 candidates"
            icon={BarChart3}
          />
          <StatCard
            label="Corporate Partners"
            value="48 Companies"
            subtext="Product, Cloud & Consulting"
            icon={Building}
          />
        </div>

        {/* Department Placement Breakdown */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
            Discipline-Wise Placement Progression (Batch of 2026)
          </h3>

          <div className="space-y-5">
            {BRANCH_STATS.map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <span className="font-semibold text-slate-800">{b.branch}</span>
                  <span className="text-slate-500">
                    <strong>{b.placed}</strong> of {b.eligible} placed ({b.pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayoutShell>
  );
}
