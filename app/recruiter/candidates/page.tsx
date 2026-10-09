'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Award,
  ArrowRight,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_OFFICER_STUDENTS } from '@/lib/demoData';

export default function RecruiterCandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minCGPA, setMinCGPA] = useState('7.5');
  const [shortlisted, setShortlisted] = useState<string[]>(['s1', 's2']);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredCandidates = DEMO_OFFICER_STUDENTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCGPA = c.cgpa >= parseFloat(minCGPA || '0');
    return matchesSearch && matchesCGPA;
  });

  const toggleShortlist = (id: string, name: string) => {
    if (shortlisted.includes(id)) {
      setShortlisted(shortlisted.filter((x) => x !== id));
      setNotification(`Removed ${name} from active shortlist.`);
    } else {
      setShortlisted([...shortlisted, id]);
      setNotification(`Added ${name} to active shortlist.`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AppLayoutShell role="recruiter">
      <PageHeader
        title="Verified Candidate Pool & Applicant Dossiers"
        description="Filter eligible candidates by verified BPUT academic records, discipline, and AI readiness scores"
        badge="Batch of 2026"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
            {shortlisted.length} Candidates in Shortlist
          </span>
        </div>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Explainable Candidate Discovery & Filtering"
          nextStepDetail="Active multi-attribute filtering across verified transcripts, skill tags, and readiness metrics."
        />

        {notification && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-xs font-semibold text-teal-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {notification}
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate by name, branch, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 focus:border-teal-500 focus:outline-hidden shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Min CGPA:</span>
            <select
              value={minCGPA}
              onChange={(e) => setMinCGPA(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-xs"
            >
              <option value="6.5">6.5+ CGPA</option>
              <option value="7.0">7.0+ CGPA</option>
              <option value="7.5">7.5+ CGPA</option>
              <option value="8.0">8.0+ CGPA</option>
              <option value="8.5">8.5+ CGPA</option>
            </select>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-5">Reg No</th>
                  <th className="py-3 px-5">Candidate</th>
                  <th className="py-3 px-5">Branch</th>
                  <th className="py-3 px-5">Verified CGPA</th>
                  <th className="py-3 px-5">Readiness</th>
                  <th className="py-3 px-5">Current Status</th>
                  <th className="py-3 px-5 text-right">Evaluation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((cand) => {
                  const isShortlisted = shortlisted.includes(cand.id);

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-slate-700">{cand.regNo}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{cand.name}</span>
                        <span className="text-[11px] text-slate-500">Batch {cand.batch}</span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">{cand.branch}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{cand.cgpa} / 10.0</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-teal-800">{cand.readinessScore}%</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge
                          status={cand.placementStatus}
                          variant={cand.placementStatus.includes('Offered') ? 'success' : 'neutral'}
                        />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => toggleShortlist(cand.id, cand.name)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isShortlisted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-teal-600 text-white hover:bg-teal-500 shadow-xs'
                          }`}
                        >
                          {isShortlisted ? 'Shortlisted ✓' : '+ Shortlist'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayoutShell>
  );
}
