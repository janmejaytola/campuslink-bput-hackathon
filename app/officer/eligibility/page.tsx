'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Briefcase,
  Users,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Play,
  Check,
  X,
  FileCheck,
  GraduationCap,
  Building,
  Info,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import { RecruiterJob } from '@/types/job';
import { StudentProfile, CertificationItem, InternshipItem } from '@/types/student';
import { EligibilityEvaluation, TestCaseExecutionResult } from '@/types/eligibility';
import { jobService } from '@/lib/services/jobService';
import { studentService } from '@/lib/services/studentService';
import { evaluateEligibility } from '@/lib/services/eligibilityEngine';
import { runAllEligibilityTests } from '@/lib/services/eligibilityTestCases';

// Sample students for placement officer testing
const DEMO_STUDENT_AUDITS: Array<{
  profile: Partial<StudentProfile>;
  certifications: CertificationItem[];
  internships: InternshipItem[];
}> = [
  {
    profile: {
      uid: 'std_demo_priyanshu',
      fullName: 'Priyanshu Mohanty',
      email: 'priyanshu.m@bput.ac.in',
      bputRegistrationNumber: '2201090123',
      college: 'Silicon Institute of Technology',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science and Engineering',
      graduationYear: '2026',
      cgpa: 8.45,
      backlogs: 0,
      skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
      skillProficiencies: {
        Python: 85,
        Java: 80,
        SQL: 75,
        'Data Structures': 82,
        Git: 78,
      },
      profileCompletion: 90,
    },
    certifications: [
      {
        id: 'cert_1',
        name: 'AWS Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2024-03-01',
        createdAt: '2024-03-01',
        updatedAt: '2024-03-01',
      },
    ],
    internships: [
      {
        id: 'int_1',
        company: 'Odisha Space Research Lab',
        role: 'Research Intern',
        startDate: '2024-05-01',
        endDate: '2024-08-31',
        description: '4 months backend data processing internship',
        skillsUsed: ['Python', 'SQL'],
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01',
      },
    ],
  },
  {
    profile: {
      uid: 'std_demo_ananya',
      fullName: 'Ananya Dash',
      email: 'ananya.dash@outr.ac.in',
      bputRegistrationNumber: '2201090288',
      college: 'College of Engineering and Technology (OUTR)',
      department: 'Information Technology',
      branch: 'Information Technology',
      graduationYear: '2026',
      cgpa: 7.85,
      backlogs: 0,
      skills: ['Java', 'SQL', 'Spring Boot', 'React'],
      skillProficiencies: {
        Java: 75,
        SQL: 70,
        'Spring Boot': 68,
        React: 65,
      },
      profileCompletion: 80,
    },
    certifications: [],
    internships: [],
  },
  {
    profile: {
      uid: 'std_demo_rohit',
      fullName: 'Rohit Kumar Sethi',
      email: 'rohit.sethi@bput.ac.in',
      bputRegistrationNumber: '2101090554',
      college: 'Government College of Engineering Kalahandi',
      department: 'Mechanical Engineering',
      branch: 'Mechanical Engineering',
      graduationYear: '2025',
      cgpa: 6.9,
      backlogs: 1,
      skills: ['AutoCAD', 'Python', 'SolidWorks'],
      skillProficiencies: {
        AutoCAD: 80,
        Python: 60,
      },
      profileCompletion: 70,
    },
    certifications: [],
    internships: [],
  },
];

const DEMO_JOBS: RecruiterJob[] = [
  {
    id: 'job_tcs_digital_officer',
    recruiterId: 'rec_tcs',
    title: 'Digital Systems Engineer 2026',
    company: 'Tata Consultancy Services',
    description: 'TCS campus drive for BPUT 2026 batch candidates.',
    location: 'Bhubaneswar / Pan India',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    salaryMin: 700000,
    salaryMax: 900000,
    openings: 100,
    applicationDeadline: '2026-11-30',
    status: 'OPEN',
    eligibility: {
      minCgpa: 7.0,
      maxBacklogs: 0,
      graduationYears: ['2026'],
      branches: ['Computer Science and Engineering', 'Information Technology'],
      colleges: [],
      minExperienceMonths: 0,
      requiredCertifications: [],
    },
    requiredSkills: [
      { name: 'Python', requiredLevel: 65 },
      { name: 'Data Structures', requiredLevel: 70 },
    ],
    preferredSkills: [
      { name: 'AWS Cloud', preferredLevel: 60 },
    ],
    jdSource: 'MANUAL',
    aiParsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job_fintech_cloud_officer',
    recruiterId: 'rec_fintech',
    title: 'Cloud Associate (Min 3mo Exp + Cert)',
    company: 'FinTech Systems India',
    description: 'Requires prior verified experience and AWS certification.',
    location: 'Bhubaneswar / Remote',
    workMode: 'REMOTE',
    employmentType: 'FULL_TIME',
    salaryMin: 600000,
    salaryMax: 800000,
    openings: 15,
    applicationDeadline: '2026-10-31',
    status: 'OPEN',
    eligibility: {
      minCgpa: 7.5,
      maxBacklogs: 0,
      graduationYears: ['2026'],
      branches: ['Computer Science and Engineering'],
      colleges: ['Silicon Institute of Technology'],
      minExperienceMonths: 3,
      requiredCertifications: ['AWS Cloud Practitioner'],
    },
    requiredSkills: [
      { name: 'Python', requiredLevel: 75 },
    ],
    preferredSkills: [
      { name: 'Docker', preferredLevel: 60 },
    ],
    jdSource: 'MANUAL',
    aiParsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function OfficerEligibilityPage() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<RecruiterJob[]>(DEMO_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(DEMO_JOBS[0].id);

  const [studentAudits, setStudentAudits] = useState(DEMO_STUDENT_AUDITS);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>(
    DEMO_STUDENT_AUDITS[0].profile.uid!
  );

  // Test suite state
  const [showTestSuiteModal, setShowTestSuiteModal] = useState(false);
  const [testResults, setTestResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestCaseExecutionResult[];
  } | null>(null);

  // Load live open jobs
  useEffect(() => {
    async function loadOpenJobs() {
      try {
        const liveJobs = await jobService.getOpenJobs();
        if (liveJobs && liveJobs.length > 0) {
          const map = new Map<string, RecruiterJob>();
          liveJobs.forEach((j) => map.set(j.id, j));
          DEMO_JOBS.forEach((j) => {
            if (!map.has(j.id)) map.set(j.id, j);
          });
          setJobs(Array.from(map.values()));
        }
      } catch {
        // use fallback DEMO_JOBS
      }
    }
    loadOpenJobs();
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  const selectedStudent = useMemo(() => {
    return (
      studentAudits.find((s) => s.profile.uid === selectedStudentUid) || studentAudits[0]
    );
  }, [studentAudits, selectedStudentUid]);

  // Deterministic evaluation
  const evaluation: EligibilityEvaluation = useMemo(() => {
    return evaluateEligibility({
      student: selectedStudent.profile,
      job: selectedJob,
      certifications: selectedStudent.certifications,
      internships: selectedStudent.internships,
      evaluatedBy: 'OFFICER_AUDIT',
    });
  }, [selectedStudent, selectedJob]);

  // Run all 16 test cases
  const handleRunTests = useCallback(() => {
    const res = runAllEligibilityTests();
    setTestResults(res);
    setShowTestSuiteModal(true);
  }, []);

  return (
    <AppLayoutShell role="officer">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 border border-blue-200 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Placement Officer Audit Console
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Deterministic Student Eligibility Engine
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Audit student candidates against explicit employer requirements. Eliminates AI
                hallucinations and enforces institutional placement compliance rules.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunTests}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                Run 16 Engine Test Cases
              </button>
            </div>
          </div>

          {/* Principle Clarification */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4.5 text-xs text-blue-900 flex items-start gap-3.5 shadow-sm">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-950 text-sm">
                Deterministic Audit Integrity
              </p>
              <p className="text-blue-800 leading-relaxed">
                As a Placement Officer, you can verify compliance before approving candidates for
                on-campus recruitment drives. No candidate can be passed based on high match scores
                or AI recommendations if hard requirements (CGPA cutoff, zero backlogs, batch year,
                eligible branch) fail.
              </p>
            </div>
          </div>

          {/* Controls: Pick Student + Pick Job */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Select Candidate to Audit
              </label>
              <select
                value={selectedStudentUid}
                onChange={(e) => setSelectedStudentUid(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                {studentAudits.map((s) => (
                  <option key={s.profile.uid} value={s.profile.uid}>
                    {s.profile.fullName} ({s.profile.branch} | CGPA: {s.profile.cgpa} | Backlogs:{' '}
                    {s.profile.backlogs})
                  </option>
                ))}
              </select>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">College:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.profile.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Year:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.profile.graduationYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Exp:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.internships.length} internship(s) recorded
                  </span>
                </div>
              </div>
            </div>

            {/* Job Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Select Employer Drive Criteria
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.title} (Min CGPA: {j.eligibility.minCgpa ?? 'None'})
                  </option>
                ))}
              </select>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Eligible Branches:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedJob.eligibility.branches.length
                      ? selectedJob.eligibility.branches.join(', ')
                      : 'All Branches'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Skills:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedJob.requiredSkills.map((s) => s.name).join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Certs:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedJob.eligibility.requiredCertifications.join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div
            className={`rounded-3xl border p-6 text-white shadow-lg ${
              evaluation.eligible
                ? 'border-emerald-600 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
                : 'border-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-red-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {evaluation.eligible ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-200" />
                  )}
                  Placement Officer Audit Decision
                </span>
                <h2 className="text-3xl font-black tracking-tight mt-2">
                  {evaluation.status === 'ELIGIBLE' ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </h2>
                <p className="text-xs text-white/90 max-w-xl pt-1">
                  Candidate <strong>{selectedStudent.profile.fullName}</strong> is{' '}
                  {evaluation.eligible ? (
                    <span className="underline decoration-emerald-300">
                      formally certified as eligible
                    </span>
                  ) : (
                    <span className="underline decoration-rose-300">
                      ineligible due to rule violations
                    </span>
                  )}{' '}
                  for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm shrink-0 border border-white/10">
                <span className="block text-2xl font-black">{evaluation.summary.passedRules}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/80">
                  / {evaluation.summary.totalRules} Rules Passed
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Rule Breakdown */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Detailed Rule Evaluation Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.rules.map((rule) => {
                const isPass = rule.result === 'PASS';
                const isFail = rule.result === 'FAIL';

                return (
                  <div
                    key={rule.rule}
                    className={`rounded-2xl border p-4.5 transition-all ${
                      isPass
                        ? 'border-emerald-200 bg-white'
                        : isFail
                        ? 'border-rose-200 bg-rose-50/40 ring-1 ring-rose-200'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{rule.ruleName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">[{rule.rule}]</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isPass
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFail
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isPass && <CheckCircle2 className="h-3 w-3" />}
                        {isFail && <XCircle className="h-3 w-3" />}
                        {rule.result}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <div>
                        <strong>Criteria:</strong> {rule.requirement}
                      </div>
                      <div>
                        <strong>Candidate:</strong> {rule.actual}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-700 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      {rule.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Suite Modal */}
          {showTestSuiteModal && testResults && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
                <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/20 p-2 border border-emerald-500/30">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">
                        Officer Audit Verification — 16 Test Cases
                      </h3>
                      <p className="text-xs text-slate-400">
                        Zero AI Hallucinations • 100% Deterministic Rule Engine
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTestSuiteModal(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-950">
                      {testResults.passed} of {testResults.total} Test Cases Passed
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    100% Verified
                  </span>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                  {testResults.results.map((r) => (
                    <div
                      key={r.testCase.id}
                      className={`rounded-2xl border p-4 text-xs transition-colors ${
                        r.passed ? 'border-slate-200 bg-slate-50/50' : 'border-rose-300 bg-rose-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                              {r.testCase.id}
                            </span>
                            <span className="font-bold text-slate-900">{r.testCase.name}</span>
                          </div>
                          <p className="text-slate-600">{r.testCase.description}</p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                            r.passed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-end">
                  <button
                    onClick={() => setShowTestSuiteModal(false)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
  );
}
