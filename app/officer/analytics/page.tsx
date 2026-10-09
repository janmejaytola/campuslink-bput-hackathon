'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Download,
  Building,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Filter,
  GraduationCap,
  Layers,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { PS10Notice } from '@/components/common/PS10Notice';

const BRANCH_STATS = [
  { branch: 'Computer Science & Engineering (CSE)', eligible: 480, placed: 412, pct: 85.8, avgCtc: '₹9.40 LPA', topOffer: '₹24.50 LPA' },
  { branch: 'Information Technology (IT)', eligible: 240, placed: 198, pct: 82.5, avgCtc: '₹8.90 LPA', topOffer: '₹22.00 LPA' },
  { branch: 'Electronics & Communication (ECE)', eligible: 380, placed: 281, pct: 73.9, avgCtc: '₹7.80 LPA', topOffer: '₹18.00 LPA' },
  { branch: 'Electrical Engineering (EE)', eligible: 320, placed: 208, pct: 65.0, avgCtc: '₹6.50 LPA', topOffer: '₹14.00 LPA' },
];

const SALARY_BRACKETS = [
  { bracket: 'Above ₹15.0 LPA (Super Dream)', count: 94, pct: 8.6, color: 'bg-emerald-500' },
  { bracket: '₹10.0 - ₹15.0 LPA (Dream Tier)', count: 286, pct: 26.0, color: 'bg-teal-500' },
  { bracket: '₹6.5 - ₹10.0 LPA (Core Engineering)', count: 472, pct: 42.9, color: 'bg-sky-500' },
  { bracket: '₹4.5 - ₹6.5 LPA (Standard Industry)', count: 247, pct: 22.5, color: 'bg-slate-400' },
];

const TOP_RECRUITERS = [
  { company: 'Tata Consultancy Services (Digital & Prime)', offers: 184, avgCtc: '₹9.20 LPA', type: 'Tier-1 IT' },
  { company: 'Cognizant Technology Solutions', offers: 142, avgCtc: '₹6.75 LPA', type: 'Consulting' },
  { company: 'Deloitte USI (Technology Analyst)', offers: 88, avgCtc: '₹8.50 LPA', type: 'Consulting' },
  { company: 'Amazon Development Centre', offers: 16, avgCtc: '₹24.50 LPA', type: 'Product' },
  { company: 'L&T Technology Services', offers: 74, avgCtc: '₹7.20 LPA', type: 'Core Engg' },
];

const FUNNEL_STEPS = [
  { stage: 'Registered Candidates', count: 1420, pct: 100 },
  { stage: 'Verified & Eligible (PS-10)', count: 1290, pct: 90.8 },
  { stage: 'Corporate Shortlisted', count: 964, pct: 67.9 },
  { stage: 'Interview Cleared', count: 780, pct: 54.9 },
  { stage: 'Offer Letters Accepted', count: 682, pct: 48.0 },
];

export default function OfficerAnalyticsPage() {
  const [selectedBatch, setSelectedBatch] = useState('2026');
  const [notification, setNotification] = useState<string | null>(null);

  const handleExportCSV = () => {
    const csvContent =
      'Branch,Eligible,Placed,PlacementPercentage,AvgCTC,TopOffer\n' +
      BRANCH_STATS.map(
        (b) => `"${b.branch}",${b.eligible},${b.placed},${b.pct}%,"${b.avgCtc}","${b.topOffer}"`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BPUT_Placement_Telemetry_Batch_${selectedBatch}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification(`Official BPUT Placement Telemetry Report exported for Batch ${selectedBatch}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <PageHeader
          title="Institutional Placement Telemetry & Analytics"
          description="Centralized intelligence across 2026 graduating cohorts, salary distributions, discipline conversion ratios, and corporate hiring partners."
          badge="BPUT TPO Command"
        >
          <div className="flex items-center gap-2">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
            >
              <option value="2026">Graduating Batch 2026 (Active)</option>
              <option value="2025">Batch 2025 (Historical)</option>
            </select>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Institutional CSV</span>
            </button>
          </div>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Placement Intelligence & Analytics Engine"
            nextStepDetail="Real-time multi-college aggregation of verified placement records, packages, and gender parity metrics."
          />

          {notification && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Top Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  Average Package (CTC)
                </span>
                <TrendingUp className="h-4 w-4 text-teal-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-950 font-mono">
                  ₹8.40 LPA
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  +14.2%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-teal-800 font-medium">
                Benchmark growth across 1,420 candidates
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Highest Compensation Offered
                </span>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  ₹24.50 LPA
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 truncate">
                Amazon Development Centre (SDE)
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Offers Released
                </span>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  1,099
                </span>
                <span className="text-xs font-medium text-slate-500">Offers</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
                72.4% Verified Cohort Placement Ratio
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Hiring Corporate Partners
                </span>
                <Building className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  48
                </span>
                <span className="text-xs font-medium text-slate-500">Companies</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                100% verified campus compliance
              </p>
            </div>
          </div>

          {/* Placement Conversion Funnel */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Institutional Placement Pipeline Conversion Funnel
                </h3>
                <p className="text-xs text-slate-500">
                  Telemetry from initial registration to verified offer letter acceptance
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                1,420 Enrolled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {FUNNEL_STEPS.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-700">
                      {s.pct}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {s.stage}
                  </p>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {s.count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column Section: Discipline Ratios & Salary Tier Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Discipline Breakdown */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Discipline Placement Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Branch-wise offers and placement ratios
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {BRANCH_STATS.map((b, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{b.branch}</span>
                      <span className="font-mono font-bold text-teal-800">
                        {b.placed} / {b.eligible} ({b.pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all duration-300"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Avg: <strong className="text-slate-800">{b.avgCtc}</strong></span>
                      <span>Peak: <strong className="text-emerald-700">{b.topOffer}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compensation Brackets */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Compensation (CTC) Bracket Distribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution of accepted packages across the cohort
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {SALARY_BRACKETS.map((sb, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{sb.bracket}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {sb.count} offers ({sb.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sb.color}`}
                        style={{ width: `${sb.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Corporate Partners Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Top Hiring Corporate Partners & Intake Volume
              </h3>
              <p className="text-xs text-slate-500">
                Leading recruiters in the 2026 BPUT campus placement season
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Recruiting Organization</th>
                    <th className="py-3.5 px-5">Industry Sector</th>
                    <th className="py-3.5 px-5">Total Offers Issued</th>
                    <th className="py-3.5 px-5">Median Package</th>
                    <th className="py-3.5 px-5 text-right">Placement Officer Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TOP_RECRUITERS.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {r.company}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">
                        {r.type}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {r.offers} students
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-teal-800">
                        {r.avgCtc}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Approved & Signed</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
