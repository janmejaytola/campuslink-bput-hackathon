'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_OFFICER_STUDENTS } from '@/lib/demoData';

export default function OfficerStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [students, setStudents] = useState(DEMO_OFFICER_STUDENTS);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.includes(searchTerm);
    const matchesBranch = branchFilter === 'All' || s.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleVerifyAll = () => {
    setStudents(students.map((s) => ({ ...s, verified: true })));
    setVerifyMessage('All selected candidate dossiers verified against official university registers.');
    setTimeout(() => setVerifyMessage(null), 3500);
  };

  return (
    <AppLayoutShell role="officer">
      <PageHeader
        title="Master Student Placement Registry"
        description="Official university candidate repository with verified academic standing, branch, CGPA, and placement readiness"
        badge="Batch of 2026"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyAll}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Batch Verify Credentials
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Student Registry & Verification Service"
          nextStepDetail="Automated academic audits, eligibility lockdown, and zero-backlog compliance tracking."
        />

        {verifyMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {verifyMessage}
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or BPUT registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 focus:border-teal-500 focus:outline-hidden shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-xs"
            >
              <option value="All">All Branches</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Tech (IT)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="EE">Electrical (EE)</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-5">Reg Number</th>
                  <th className="py-3 px-5">Candidate Name</th>
                  <th className="py-3 px-5">Branch</th>
                  <th className="py-3 px-5">CGPA</th>
                  <th className="py-3 px-5">Backlogs</th>
                  <th className="py-3 px-5">Readiness Score</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-800">{s.regNo}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-5 text-slate-600">{s.branch}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{s.cgpa}</td>
                    <td className="py-3.5 px-5 text-slate-600">{s.backlogs}</td>
                    <td className="py-3.5 px-5 font-bold text-teal-800">{s.readinessScore}%</td>
                    <td className="py-3.5 px-5">
                      <StatusBadge
                        status={s.placementStatus}
                        variant={s.placementStatus.includes('Offered') ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="py-3.5 px-5">
                      {s.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Pending Audit
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayoutShell>
  );
}
