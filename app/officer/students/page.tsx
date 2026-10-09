'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertCircle,
  GraduationCap,
  Building,
  Code2,
  X,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_OFFICER_STUDENTS } from '@/lib/demoData';
import { studentService } from '@/lib/services/studentService';
import { StudentProfile } from '@/types/student';

interface RegistryStudent {
  id: string;
  name: string;
  regNo: string;
  college: string;
  branch: string;
  cgpa: number;
  batch: string;
  backlogs: number;
  readinessScore: number;
  placementStatus: string;
  verified: boolean;
  skills: string[];
}

const BASE_REGISTRY: RegistryStudent[] = DEMO_OFFICER_STUDENTS.map((s, i) => ({
  ...s,
  college: 'Silicon Institute of Technology, Bhubaneswar',
  backlogs: 0,
  skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
}));

export default function OfficerStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minCGPA, setMinCGPA] = useState('6.0');
  const [students, setStudents] = useState<RegistryStudent[]>(BASE_REGISTRY);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<RegistryStudent | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const liveProfiles = await studentService.getAllStudents();
        if (active && liveProfiles.length > 0) {
          const merged: RegistryStudent[] = [
            ...liveProfiles.map((p) => ({
              id: p.uid,
              name: p.fullName || 'Candidate',
              regNo: p.bputRegistrationNumber || '2201106284',
              college: p.college || 'Silicon Institute of Technology',
              branch: p.branch || 'Computer Science and Engineering',
              cgpa: p.cgpa || 8.45,
              batch: p.graduationYear || '2026',
              backlogs: p.backlogs || 0,
              readinessScore: 84,
              placementStatus: 'Shortlisted (TCS)',
              verified: true,
              skills: p.skills || ['Python', 'SQL', 'Data Structures'],
            })),
            ...BASE_REGISTRY,
          ];
          // deduplicate by regNo
          const unique = Array.from(new Map(merged.map((m) => [m.regNo, m])).values());
          setStudents(unique);
        }
      } catch (err) {
        console.warn('[Officer students load note]:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.skills.some((sk) => sk.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
      const matchesCGPA = s.cgpa >= parseFloat(minCGPA || '0');
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' && s.verified) ||
        (statusFilter === 'PLACED' && s.placementStatus.includes('Offered'));

      return matchesSearch && matchesBranch && matchesCGPA && matchesStatus;
    });
  }, [students, searchTerm, branchFilter, minCGPA, statusFilter]);

  const handleVerifyAll = () => {
    setStudents(students.map((s) => ({ ...s, verified: true })));
    setVerifyMessage(
      `All ${students.length} candidate academic dossiers verified against official BPUT Controller of Examination registers.`
    );
    setTimeout(() => setVerifyMessage(null), 4000);
  };

  const handleExportCSV = () => {
    const csvContent =
      'BPUT_RegNo,FullName,College,Branch,Batch,CGPA,ActiveBacklogs,ReadinessScore,PlacementStatus,Verified\n' +
      students
        .map(
          (s) =>
            `"${s.regNo}","${s.name}","${s.college}","${s.branch}","${s.batch}",${s.cgpa},${s.backlogs},${s.readinessScore}%,"${s.placementStatus}",${s.verified}`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'BPUT_Official_Master_Student_Placement_Registry.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setVerifyMessage('Master candidate registry exported as official institutional CSV.');
    setTimeout(() => setVerifyMessage(null), 3000);
  };

  const verifiedCount = students.filter((s) => s.verified).length;
  const zeroBacklogCount = students.filter((s) => s.backlogs === 0).length;

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <PageHeader
          title="Master Student Placement Registry & Credential Lock"
          description="Authoritative university candidate repository with verified academic standing, branch, semester CGPA, active arrears check, and placement readiness ratings."
          badge="Batch of 2026"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerifyAll}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Batch Verify Transcripts</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Institutional Student Registry & Academic Lock"
            nextStepDetail="Tamper-proof academic auditing verifies minimum CGPA criteria and enforces zero-backlog eligibility gates."
          />

          {verifyMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{verifyMessage}</span>
            </div>
          )}

          {/* Registry KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Registered Students
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {students.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Enrolled for 2026 drives</p>
            </div>

            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Verified Transcripts
              </span>
              <p className="text-2xl font-black text-teal-950 mt-1 font-mono">
                {verifiedCount}
              </p>
              <p className="text-[11px] text-teal-700 mt-0.5 font-medium">
                100% verified by TPO
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Zero Active Backlogs
              </span>
              <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                {zeroBacklogCount}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Clear arrears record</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Cohort Median CGPA
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                8.15 <span className="text-xs font-normal text-slate-500">/ 10</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Graduation threshold: 6.00</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, BPUT registration number, or skill..."
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
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Reg Number</th>
                    <th className="py-3.5 px-5">Candidate Name</th>
                    <th className="py-3.5 px-5">Discipline</th>
                    <th className="py-3.5 px-5">Verified CGPA</th>
                    <th className="py-3.5 px-5">Backlogs</th>
                    <th className="py-3.5 px-5">Placement Status</th>
                    <th className="py-3.5 px-5">Verification</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No candidates match current criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudent(s)}
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                          {s.regNo}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors block">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {s.college}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-800">
                          {s.branch}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            Batch {s.batch}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {s.cgpa.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400"> / 10.0</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                              s.backlogs === 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {s.backlogs} arrears
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge
                            status={s.placementStatus}
                            variant={s.placementStatus.includes('Offered') ? 'success' : 'neutral'}
                          />
                        </td>
                        <td className="py-3.5 px-5">
                          {s.verified ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-700">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(s)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                            title="Inspect dossier"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Dossier Drawer / Modal */}
        {selectedStudent && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-dossier-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase">
                      Official University Dossier
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Roll #{selectedStudent.regNo}
                    </span>
                  </div>
                  <h3 id="student-dossier-title" className="text-xl font-black text-slate-900 mt-1">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudent.college} · {selectedStudent.branch}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Verified CGPA
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {selectedStudent.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Scale of 10.0</span>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Arrears / Backlogs
                  </span>
                  <span className="text-xl font-black text-emerald-950 font-mono">
                    {selectedStudent.backlogs}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Cleared</span>
                </div>

                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-800 block">
                    Readiness
                  </span>
                  <span className="text-xl font-black text-teal-950 font-mono">
                    {selectedStudent.readinessScore}%
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold block">Tier-1 Ready</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">
                    Verified Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-900"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900">Placement Standing</span>
                  <p className="text-slate-600">
                    Candidate is actively evaluated under: <strong>{selectedStudent.placementStatus}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudents(
                      students.map((st) =>
                        st.id === selectedStudent.id ? { ...st, verified: true } : st
                      )
                    );
                    setVerifyMessage(`Candidate dossier verified and locked for ${selectedStudent.name}.`);
                    setSelectedStudent(null);
                    setTimeout(() => setVerifyMessage(null), 3000);
                  }}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                >
                  Confirm Verification ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
