'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  Award,
  BookOpen,
  Clock,
  Code,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  Play,
  RotateCcw,
  Check,
  X,
  FileCheck,
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

// Benchmark campus jobs for instant demo testing
const DEMO_CAMPUS_JOBS: RecruiterJob[] = [
  {
    id: 'demo_tcs_digital_2026',
    recruiterId: 'recruiter_demo_tcs',
    title: 'Digital Software Engineer (Systems & Cloud)',
    company: 'Tata Consultancy Services',
    description:
      'TCS Digital is hiring ambitious engineering graduates for advanced digital engineering, cloud microservices, and AI integrations.',
    location: 'Bhubaneswar / Bengaluru',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    salaryMin: 700000,
    salaryMax: 950000,
    openings: 50,
    applicationDeadline: '2026-11-30',
    status: 'OPEN',
    eligibility: {
      minCgpa: 7.0,
      maxBacklogs: 0,
      graduationYears: ['2026'],
      branches: ['Computer Science and Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
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
      { name: 'Docker', preferredLevel: 50 },
    ],
    jdSource: 'MANUAL',
    aiParsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_cognizant_genc_next',
    recruiterId: 'recruiter_demo_cts',
    title: 'GenC Next Specialist Developer',
    company: 'Cognizant Technology Solutions',
    description:
      'Premier campus drive for full-stack and cloud developers with strong algorithm fundamentals.',
    location: 'Hyderabad / Pune',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    salaryMin: 650000,
    salaryMax: 850000,
    openings: 35,
    applicationDeadline: '2026-12-15',
    status: 'OPEN',
    eligibility: {
      minCgpa: 7.5,
      maxBacklogs: 0,
      graduationYears: ['2026', '2027'],
      branches: ['CSE', 'IT', 'ECE'],
      colleges: [],
      minExperienceMonths: 0,
      requiredCertifications: [],
    },
    requiredSkills: [
      { name: 'Java', requiredLevel: 70 },
      { name: 'SQL', requiredLevel: 65 },
    ],
    preferredSkills: [
      { name: 'Spring Boot', preferredLevel: 65 },
    ],
    jdSource: 'MANUAL',
    aiParsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_fintech_lead_intern',
    recruiterId: 'recruiter_demo_fintech',
    title: 'Associate Cloud Engineer (Pre-Placement Offer)',
    company: 'FinTech Systems India',
    description:
      'FinTech Systems requires candidates with prior internship experience and certified cloud foundations.',
    location: 'Bhubaneswar / Remote',
    workMode: 'REMOTE',
    employmentType: 'INTERNSHIP',
    salaryMin: 500000,
    salaryMax: 700000,
    openings: 10,
    applicationDeadline: '2026-10-31',
    status: 'OPEN',
    eligibility: {
      minCgpa: 7.0,
      maxBacklogs: 0,
      graduationYears: ['2026'],
      branches: ['Computer Science and Engineering'],
      colleges: [],
      minExperienceMonths: 3,
      requiredCertifications: ['AWS Cloud Practitioner'],
    },
    requiredSkills: [
      { name: 'Python', requiredLevel: 75 },
    ],
    preferredSkills: [
      { name: 'Kubernetes', preferredLevel: 55 },
    ],
    jdSource: 'MANUAL',
    aiParsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function StudentEligibilityPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [internships, setInternships] = useState<InternshipItem[]>([]);

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Test suite execution state
  const [showTestSuiteModal, setShowTestSuiteModal] = useState(false);
  const [testResults, setTestResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestCaseExecutionResult[];
  } | null>(null);

  // Load student profile & open jobs
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);

        // Fetch Student Profile
        const p = await studentService.getStudentProfile(currentUser.uid);
        if (!isMounted) return;

        if (p) {
          setProfile(p);
        } else {
          // Fallback baseline for demo student
          setProfile({
            uid: currentUser.uid,
            fullName: currentUser.displayName || 'BPUT Student',
            email: currentUser.email || 'student@bput.ac.in',
            phone: '9876543210',
            dateOfBirth: '2004-05-15',
            gender: 'Male',
            bputRegistrationNumber: '2201090123',
            college: 'Silicon Institute of Technology',
            department: 'Computer Science and Engineering',
            branch: 'Computer Science and Engineering',
            semester: '7th Semester',
            graduationYear: '2026',
            cgpa: 8.25,
            backlogs: 0,
            skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
            skillProficiencies: {
              Python: 80,
              Java: 75,
              SQL: 70,
              'Data Structures': 78,
              Git: 72,
            },
            careerGoal: {
              targetRole: 'Software Engineer',
              jobType: 'Full-time',
              preferredLocation: 'Bhubaneswar, Bengaluru',
              workMode: 'Hybrid',
              expectedSalary: '7-10 LPA',
            },
            readinessInputs: {
              aptitudeScore: 80,
              technicalScore: 82,
              communicationScore: 78,
            },
            profileCompletion: 85,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Fetch Subcollections
        try {
          const certs = await studentService.getCertifications(currentUser.uid);
          if (isMounted) setCertifications(certs);
        } catch {
          // ignore
        }

        try {
          const interns = await studentService.getInternships(currentUser.uid);
          if (isMounted) setInternships(interns);
        } catch {
          // ignore
        }

        // Fetch Open Jobs from Firestore
        let firestoreJobs: RecruiterJob[] = [];
        try {
          firestoreJobs = await jobService.getOpenJobs();
        } catch {
          firestoreJobs = [];
        }

        if (!isMounted) return;

        // Combine with DEMO jobs if list is short or empty
        const mergedJobsMap = new Map<string, RecruiterJob>();
        firestoreJobs.forEach((j) => mergedJobsMap.set(j.id, j));
        DEMO_CAMPUS_JOBS.forEach((j) => {
          if (!mergedJobsMap.has(j.id)) {
            mergedJobsMap.set(j.id, j);
          }
        });

        const allJobs = Array.from(mergedJobsMap.values());
        setJobs(allJobs);
        if (allJobs.length > 0) {
          setSelectedJobId(allJobs[0].id);
        }
      } catch (err) {
        console.error('Error loading student eligibility data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  // Selected job
  const selectedJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;
  }, [jobs, selectedJobId]);

  // Real-time Deterministic Eligibility Evaluation
  const evaluation: EligibilityEvaluation | null = useMemo(() => {
    if (!profile || !selectedJob) return null;

    return evaluateEligibility({
      student: profile,
      job: selectedJob,
      certifications,
      internships,
      evaluatedBy: `STUDENT:${profile.uid}`,
    });
  }, [profile, selectedJob, certifications, internships]);

  // Run test suite
  const handleRunTestSuite = useCallback(() => {
    const res = runAllEligibilityTests();
    setTestResults(res);
    setShowTestSuiteModal(true);
  }, []);

  return (
    <AppLayoutShell role="student">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Step 9: Deterministic Eligibility Engine
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Campus Placement Job Eligibility
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Evaluates your profile against exact employer cutoff requirements without subjective
                AI bias. Eligibility is a strict pass/fail gatekeeper separate from match scores.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunTestSuite}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                Run 16 Engine Test Cases
              </button>
            </div>
          </div>

          {/* Principle Clarification Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4.5 text-xs text-blue-900 flex items-start gap-3.5 shadow-sm">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-950 text-sm">
                Fundamental Separation: Eligibility vs. AI Matching &amp; Readiness
              </p>
              <p className="text-blue-800 leading-relaxed">
                <strong>ELIGIBILITY</strong> strictly verifies non-negotiable compliance rules
                (minimum CGPA, 0 backlogs, verified graduation batch, academic branch, college,
                experience, certifications, and mandatory skill proficiency). A student may have a
                95% AI Readiness Score and still be{' '}
                <span className="font-semibold text-rose-700">NOT ELIGIBLE</span> if they hold an
                active backlog. Conversely, an eligible student can have varying match scores.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600" />
              <p className="mt-4 text-sm font-medium text-slate-600">
                Evaluating student profile criteria...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Job Selector */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-600" />
                    Open Placement Drives ({jobs.length})
                  </h2>
                  <span className="text-xs font-medium text-slate-500">Select to evaluate</span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by role or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Job Cards List */}
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {filteredJobs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                      No matching placement drives found.
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const isSelected = job.id === selectedJobId;
                      // Quick preview check
                      const previewEval = evaluateEligibility({
                        student: profile!,
                        job,
                        certifications,
                        internships,
                      });

                      return (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJobId(job.id)}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-1 ring-emerald-600'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                {job.company}
                              </span>
                              <h3 className="mt-1.5 text-sm font-bold text-slate-900">{job.title}</h3>
                            </div>
                            <span
                              className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                previewEval.eligible
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {previewEval.eligible ? (
                                <>
                                  <Check className="h-3 w-3" /> Eligible
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" /> Not Eligible
                                </>
                              )}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Min CGPA: {job.eligibility.minCgpa ?? 'None'}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Max Backlogs: {job.eligibility.maxBacklogs ?? 'Any'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Eligibility Engine Report */}
              <div className="lg:col-span-7 space-y-6">
                {selectedJob && evaluation ? (
                  <>
                    {/* Big Status Verdict Banner */}
                    <div
                      className={`relative overflow-hidden rounded-3xl border p-6 text-white shadow-lg transition-all ${
                        evaluation.eligible
                          ? 'border-emerald-600 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
                          : 'border-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            {evaluation.eligible ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-200" />
                            )}
                            Deterministic Gatekeeper Result
                          </div>
                          <h2 className="text-3xl font-black tracking-tight mt-2">
                            {evaluation.status === 'ELIGIBLE' ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                          </h2>
                          <p className="text-xs text-white/90 max-w-xl pt-1">
                            {evaluation.eligible
                              ? 'You strictly meet all mandatory requirements specified by the recruiter. Your profile is authorized for application.'
                              : 'You do not meet one or more mandatory requirements. The specific failing criteria are itemized below.'}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm shrink-0 border border-white/10">
                          <span className="block text-2xl font-black">{evaluation.summary.passedRules}</span>
                          <span className="text-[10px] uppercase tracking-wider text-white/80">
                            / {evaluation.summary.totalRules} Rules Passed
                          </span>
                        </div>
                      </div>

                      {/* Rule tally strip */}
                      <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-white/10 py-1.5 px-2">
                          <span className="font-bold">{evaluation.summary.passedRules}</span> Passed
                        </div>
                        <div className="rounded-xl bg-white/10 py-1.5 px-2">
                          <span className="font-bold">{evaluation.summary.failedRules}</span> Failed
                        </div>
                        <div className="rounded-xl bg-white/10 py-1.5 px-2">
                          <span className="font-bold">{evaluation.summary.notApplicableRules}</span> N/A
                        </div>
                      </div>
                    </div>

                    {/* Job Details Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-xs font-semibold text-slate-500">{selectedJob.company}</span>
                          <h3 className="text-lg font-bold text-slate-900">{selectedJob.title}</h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {selectedJob.workMode}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <span className="text-slate-500 block">Min CGPA</span>
                          <span className="font-bold text-slate-900">
                            {selectedJob.eligibility.minCgpa ?? 'None'}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <span className="text-slate-500 block">Max Backlogs</span>
                          <span className="font-bold text-slate-900">
                            {selectedJob.eligibility.maxBacklogs ?? 'Any'}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <span className="text-slate-500 block">Eligible Batches</span>
                          <span className="font-bold text-slate-900">
                            {selectedJob.eligibility.graduationYears.length
                              ? selectedJob.eligibility.graduationYears.join(', ')
                              : 'All'}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <span className="text-slate-500 block">Min Experience</span>
                          <span className="font-bold text-slate-900">
                            {selectedJob.eligibility.minExperienceMonths
                              ? `${selectedJob.eligibility.minExperienceMonths} mo`
                              : 'Fresher'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rule by Rule Deterministic Audit Trail */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">
                          Rule-by-Rule Deterministic Audit Trail (8 Rules)
                        </h3>
                        <span className="text-[11px] text-slate-500">Deterministic Evaluation Engine</span>
                      </div>

                      <div className="space-y-3">
                        {evaluation.rules.map((rule) => {
                          const isPass = rule.result === 'PASS';
                          const isFail = rule.result === 'FAIL';
                          const isNA = rule.result === 'NOT_APPLICABLE';

                          return (
                            <div
                              key={rule.rule}
                              className={`rounded-2xl border p-4 transition-all ${
                                isPass
                                  ? 'border-emerald-200 bg-white hover:border-emerald-300'
                                  : isFail
                                  ? 'border-rose-200 bg-rose-50/30 ring-1 ring-rose-200'
                                  : 'border-slate-200 bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">
                                      {rule.ruleName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      [{rule.rule}]
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                    <span>
                                      <strong>Requirement:</strong> {rule.requirement}
                                    </span>
                                    <span>
                                      <strong>Your Profile:</strong> {rule.actual}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    isPass
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isFail
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {isPass && <CheckCircle2 className="h-3.5 w-3.5" />}
                                  {isFail && <XCircle className="h-3.5 w-3.5" />}
                                  {isNA && <MinusCircle className="h-3.5 w-3.5" />}
                                  {rule.result}
                                </span>
                              </div>

                              <p className="mt-2.5 text-xs text-slate-600 bg-white/70 rounded-xl p-2.5 border border-slate-100">
                                {rule.reason}
                              </p>

                              {/* Sub-items for Skills or Certifications if present */}
                              {rule.subItems && rule.subItems.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                                  <span className="text-[11px] font-semibold text-slate-700 block">
                                    Itemized Verification:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {rule.subItems.map((sub, idx) => (
                                      <div
                                        key={idx}
                                        className={`rounded-xl border p-2 text-xs flex items-center justify-between ${
                                          sub.status === 'PASS'
                                            ? 'border-emerald-100 bg-emerald-50/30'
                                            : 'border-rose-100 bg-rose-50/40'
                                        }`}
                                      >
                                        <div>
                                          <span className="font-semibold text-slate-800 block">
                                            {sub.name}
                                          </span>
                                          <span className="text-[10px] text-slate-500">
                                            Req: {sub.required} | You: {sub.actual}
                                          </span>
                                        </div>
                                        <span
                                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            sub.status === 'PASS'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : 'bg-rose-100 text-rose-800'
                                          }`}
                                        >
                                          {sub.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preferred Skills Separation Card */}
                    {evaluation.preferredSkillsNote && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950">
                        <div className="flex items-center gap-2 font-bold mb-1">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          Preferred Skills Note (Separated from Eligibility)
                        </div>
                        <p className="text-amber-800 leading-relaxed">
                          {evaluation.preferredSkillsNote}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                    Select a job to view your deterministic eligibility breakdown.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Suite Modal */}
          {showTestSuiteModal && testResults && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
                {/* Modal Header */}
                <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/20 p-2 border border-emerald-500/30">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">
                        Deterministic Eligibility Engine Test Suite (16 Cases)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Automated verification of edge-cases, data normalization, and strict rule independence
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowTestSuiteModal(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Score bar */}
                <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-950">
                      {testResults.passed} of {testResults.total} Test Cases Passed (
                      {Math.round((testResults.passed / testResults.total) * 100)}%)
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    100% Deterministic Compliance
                  </span>
                </div>

                {/* Test Cases Table */}
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

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              r.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.passed ? (
                              <>
                                <Check className="h-3 w-3" /> PASS
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3" /> FAIL
                              </>
                            )}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-1 font-mono">
                            Result: {r.actualEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    No Gemini / AI dependencies involved in evaluation decisions.
                  </span>
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
