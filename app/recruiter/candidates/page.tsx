'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Award,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Code2,
  ExternalLink,
  Briefcase,
  X,
  SlidersHorizontal,
  Download,
  Eye,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_OFFICER_STUDENTS } from '@/lib/demoData';

interface CandidateDetailed {
  id: string;
  name: string;
  regNo: string;
  college: string;
  branch: string;
  cgpa: number;
  batch: string;
  readinessScore: number;
  placementStatus: string;
  verified: boolean;
  skills: string[];
  projectsCount: number;
  certificationsCount: number;
  internshipsCount: number;
  topProject: string;
}

const ENRICHED_CANDIDATES: CandidateDetailed[] = DEMO_OFFICER_STUDENTS.map((c, i) => {
  const skillSets = [
    ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
    ['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind'],
    ['C++', 'Data Structures', 'Linux', 'Network Protocols'],
    ['Python', 'TensorFlow', 'SQL', 'Data Analytics'],
  ];
  const topProjects = [
    'Autonomous Placement Routing & Queue Engine',
    'Distributed Transaction Gateway with Kafka',
    'Real-Time Collaborative Code Playground',
    'Microservice Orchestrator & Monitoring Telemetry',
    'BPUT Academic Record Verifier with Cryptographic Signatures',
  ];

  return {
    ...c,
    college: 'Silicon Institute of Technology, Bhubaneswar',
    skills: skillSets[i % skillSets.length],
    projectsCount: 2 + (i % 3),
    certificationsCount: 1 + (i % 2),
    internshipsCount: i % 2 === 0 ? 1 : 2,
    topProject: topProjects[i % topProjects.length],
  };
});

export default function RecruiterCandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minCGPA, setMinCGPA] = useState('7.0');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [readinessFilter, setReadinessFilter] = useState('ALL');
  const [shortlisted, setShortlisted] = useState<string[]>(['s1', 's2']);
  const [notification, setNotification] = useState<string | null>(null);
  const [inspectingCandidate, setInspectingCandidate] = useState<CandidateDetailed | null>(null);

  const filteredCandidates = useMemo(() => {
    return ENRICHED_CANDIDATES.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCGPA = c.cgpa >= parseFloat(minCGPA || '0');
      const matchesBranch = branchFilter === 'ALL' || c.branch === branchFilter;
      const matchesReadiness =
        readinessFilter === 'ALL' ||
        (readinessFilter === 'HIGH' && c.readinessScore >= 80) ||
        (readinessFilter === 'MEDIUM' && c.readinessScore >= 60 && c.readinessScore < 80);

      return matchesSearch && matchesCGPA && matchesBranch && matchesReadiness;
    });
  }, [searchTerm, minCGPA, branchFilter, readinessFilter]);

  const toggleShortlist = (id: string, name: string) => {
    if (shortlisted.includes(id)) {
      setShortlisted(shortlisted.filter((x) => x !== id));
      setNotification(`Removed ${name} from corporate shortlist.`);
    } else {
      setShortlisted([...shortlisted, id]);
      setNotification(`Added ${name} to corporate shortlist.`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const avgCGPA = (
    filteredCandidates.reduce((acc, curr) => acc + curr.cgpa, 0) /
    (filteredCandidates.length || 1)
  ).toFixed(2);

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <PageHeader
          title="Verified Candidate Pool & Dossier Vault"
          description="Direct access to verified BPUT engineering cohorts with deterministic eligibility transcripts, technical skills, and placement readiness ratings."
          badge="Graduation Cycle 2026"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-1.5 text-xs font-bold text-teal-800 shadow-2xs">
              {shortlisted.length} Candidates in Active Shortlist
            </span>
            <Link
              href="/recruiter/shortlist"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <span>Manage Shortlists</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Verified Candidate Dossier Explorer"
            nextStepDetail="Inspect authentic student submissions with verified university CGPA, project links, and placement readiness."
          />

          {notification && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Filtered Candidates
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {filteredCandidates.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Across verified institutions</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Average CGPA
              </span>
              <p className="text-2xl font-black text-teal-900 mt-1 font-mono">
                {avgCGPA} <span className="text-xs font-medium text-slate-500">/ 10.0</span>
              </p>
              <p className="text-[11px] text-teal-700 mt-0.5 font-medium">Verified by Controller of Exams</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Shortlisted in Pipeline
              </span>
              <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">
                {shortlisted.length}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Ready for interview slotting</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Backlog Verification
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono flex items-center gap-1.5">
                <span>100%</span>
                <ShieldCheck className="h-5 w-5 text-emerald-600 inline" />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Zero active arrears required</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by candidate name, skill (e.g. Python, React), branch, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Min CGPA:</span>
                  <select
                    value={minCGPA}
                    onChange={(e) => setMinCGPA(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="6.0">6.0+ CGPA</option>
                    <option value="6.5">6.5+ CGPA</option>
                    <option value="7.0">7.0+ CGPA</option>
                    <option value="7.5">7.5+ CGPA</option>
                    <option value="8.0">8.0+ CGPA</option>
                    <option value="8.5">8.5+ CGPA</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Branch:</span>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="ALL">All Disciplines</option>
                    <option value="CSE">Computer Science & Eng (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics & Comm (ECE)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Readiness:</span>
                  <select
                    value={readinessFilter}
                    onChange={(e) => setReadinessFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="ALL">All Scores</option>
                    <option value="HIGH">Highly Employable (80%+)</option>
                    <option value="MEDIUM">Ready (60% - 79%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3.5 px-5">BPUT Roll</th>
                    <th className="py-3.5 px-5">Candidate Name</th>
                    <th className="py-3.5 px-5">Engineering Discipline</th>
                    <th className="py-3.5 px-5">Verified CGPA</th>
                    <th className="py-3.5 px-5">Top Technical Skills</th>
                    <th className="py-3.5 px-5">Readiness Score</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No candidates match current criteria.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Try easing the CGPA threshold or search terms.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((cand) => {
                      const isShortlisted = shortlisted.includes(cand.id);

                      return (
                        <tr
                          key={cand.id}
                          className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                          onClick={() => setInspectingCandidate(cand)}
                        >
                          <td className="py-3.5 px-5 font-mono font-semibold text-slate-700">
                            {cand.regNo}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                                {cand.name}
                              </span>
                              {cand.verified && (
                                <span title="Verified Transcript">
                                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {cand.college}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-800">{cand.branch}</span>
                            <span className="block text-[11px] text-slate-500 font-mono">
                              Batch {cand.batch}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-mono font-black text-slate-900 text-sm">
                              {cand.cgpa.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium"> / 10.0</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {cand.skills.slice(0, 3).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                                >
                                  {sk}
                                </span>
                              ))}
                              {cand.skills.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-medium self-center">
                                  +{cand.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                                  cand.readinessScore >= 80
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                                }`}
                              >
                                {cand.readinessScore}%
                              </span>
                              <span className="text-[11px] text-slate-500 hidden sm:inline">
                                {cand.readinessScore >= 80 ? 'Highly Employable' : 'Ready'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setInspectingCandidate(cand)}
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                                title="View candidate dossier"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleShortlist(cand.id, cand.name)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                  isShortlisted
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-teal-600 text-white hover:bg-teal-500'
                                }`}
                              >
                                {isShortlisted ? 'Shortlisted ✓' : '+ Shortlist'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Candidate Dossier Slide-Over / Modal */}
        {inspectingCandidate && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-dossier-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setInspectingCandidate(null)}
          >
            <div
              className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-6 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase">
                      Verified Dossier
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Roll #{inspectingCandidate.regNo}
                    </span>
                  </div>
                  <h3 id="candidate-dossier-title" className="text-xl font-black text-slate-900 mt-1">
                    {inspectingCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectingCandidate.college} · {inspectingCandidate.branch} (Batch {inspectingCandidate.batch})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingCandidate(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dossier Academic & Diagnostic Score Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Verified CGPA
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {inspectingCandidate.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">0 Active Backlogs</span>
                </div>

                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-800 block">
                    Readiness Score
                  </span>
                  <span className="text-xl font-black text-teal-950 font-mono">
                    {inspectingCandidate.readinessScore}%
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold block">
                    {inspectingCandidate.readinessScore >= 80 ? 'Highly Employable' : 'Ready'}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Portfolio Assets
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {inspectingCandidate.projectsCount} Proj
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    {inspectingCandidate.internshipsCount} Intern · {inspectingCandidate.certificationsCount} Cert
                  </span>
                </div>
              </div>

              {/* Technical Skills & Showcase Project */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Code2 className="h-4 w-4 text-teal-600" />
                    <span>Technical Competencies</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {inspectingCandidate.skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-teal-200 bg-teal-50/80 px-2.5 py-1 text-xs font-semibold text-teal-900"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900">Featured Capstone Project</h5>
                    <span className="text-[10px] font-semibold text-teal-700">Production Ready</span>
                  </div>
                  <p className="text-slate-700 font-medium">{inspectingCandidate.topProject}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Demonstrates system design, distributed data architecture, deterministic error handling, and robust test coverage.
                  </p>
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectingCandidate(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close Dossier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleShortlist(inspectingCandidate.id, inspectingCandidate.name);
                    setInspectingCandidate(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    shortlisted.includes(inspectingCandidate.id)
                      ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-teal-600 text-white hover:bg-teal-500 shadow-xs'
                  }`}
                >
                  {shortlisted.includes(inspectingCandidate.id)
                    ? 'Remove from Shortlist'
                    : 'Add to Shortlist ✓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
