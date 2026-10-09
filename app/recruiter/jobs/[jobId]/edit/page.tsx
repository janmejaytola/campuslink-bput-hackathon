'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Briefcase,
  Sliders,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  Loader2,
  Check,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  RecruiterJob,
  JobStatus,
  WorkMode,
  EmploymentType,
  COMMON_BPUT_BRANCHES,
  COMMON_GRADUATION_YEARS,
  JobSkillRequirement,
  JobPreferredSkill,
} from '@/types/job';
import { jobService } from '@/lib/services/jobService';

export default function EditJobPage() {
  const { currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [workMode, setWorkMode] = useState<WorkMode>('HYBRID');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [openings, setOpenings] = useState<string>('');
  const [applicationDeadline, setApplicationDeadline] = useState<string>('');
  const [driveDate, setDriveDate] = useState<string>('');
  const [status, setStatus] = useState<JobStatus>('DRAFT');

  // Eligibility
  const [minCgpa, setMinCgpa] = useState<string>('');
  const [maxBacklogs, setMaxBacklogs] = useState<string>('0');
  const [graduationYears, setGraduationYears] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [minExperienceMonths, setMinExperienceMonths] = useState<string>('0');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState<string>('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<JobSkillRequirement[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<JobPreferredSkill[]>([]);
  const [newReqSkillName, setNewReqSkillName] = useState<string>('');
  const [newReqSkillLevel, setNewReqSkillLevel] = useState<number>(70);
  const [newPrefSkillName, setNewPrefSkillName] = useState<string>('');
  const [newPrefSkillLevel, setNewPrefSkillLevel] = useState<number>(50);

  const fetchJob = useCallback(async () => {
    if (!jobId || !currentUser?.uid) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await jobService.getJobById(jobId);
      if (!data) {
        setErrorMessage('Job position was not found.');
        return;
      }
      if (data.recruiterId !== currentUser.uid) {
        setErrorMessage('You do not have authorization to edit this job position.');
        return;
      }

      setTitle(data.title);
      setCompany(data.company);
      setDescription(data.description);
      setLocation(data.location);
      setWorkMode(data.workMode);
      setEmploymentType(data.employmentType);
      setSalaryMin(data.salaryMin != null ? String(data.salaryMin) : '');
      setSalaryMax(data.salaryMax != null ? String(data.salaryMax) : '');
      setOpenings(data.openings != null ? String(data.openings) : '');
      setApplicationDeadline(data.applicationDeadline || '');
      setDriveDate(data.driveDate || '');
      setStatus(data.status);

      if (data.eligibility) {
        setMinCgpa(data.eligibility.minCgpa != null ? String(data.eligibility.minCgpa) : '');
        setMaxBacklogs(data.eligibility.maxBacklogs != null ? String(data.eligibility.maxBacklogs) : '0');
        setGraduationYears(data.eligibility.graduationYears || []);
        setBranches(data.eligibility.branches || []);
        setMinExperienceMonths(
          data.eligibility.minExperienceMonths != null ? String(data.eligibility.minExperienceMonths) : '0'
        );
        setCertifications(data.eligibility.requiredCertifications || []);
      }

      setRequiredSkills(data.requiredSkills || []);
      setPreferredSkills(data.preferredSkills || []);
    } catch (err: unknown) {
      console.error('[Error fetching job for edit]:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load position.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId, currentUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!jobId || !currentUser?.uid) return;
      try {
        const data = await jobService.getJobById(jobId);
        if (!active) return;
        if (!data) {
          setErrorMessage('Job position was not found.');
          setIsLoading(false);
          return;
        }
        if (data.recruiterId !== currentUser.uid) {
          setErrorMessage('You do not have authorization to edit this job position.');
          setIsLoading(false);
          return;
        }

        setTitle(data.title);
        setCompany(data.company);
        setDescription(data.description);
        setLocation(data.location);
        setWorkMode(data.workMode);
        setEmploymentType(data.employmentType);
        setSalaryMin(data.salaryMin != null ? String(data.salaryMin) : '');
        setSalaryMax(data.salaryMax != null ? String(data.salaryMax) : '');
        setOpenings(data.openings != null ? String(data.openings) : '');
        setApplicationDeadline(data.applicationDeadline || '');
        setDriveDate(data.driveDate || '');
        setStatus(data.status);

        if (data.eligibility) {
          setMinCgpa(data.eligibility.minCgpa != null ? String(data.eligibility.minCgpa) : '');
          setMaxBacklogs(data.eligibility.maxBacklogs != null ? String(data.eligibility.maxBacklogs) : '0');
          setGraduationYears(data.eligibility.graduationYears || []);
          setBranches(data.eligibility.branches || []);
          setMinExperienceMonths(
            data.eligibility.minExperienceMonths != null ? String(data.eligibility.minExperienceMonths) : '0'
          );
          setCertifications(data.eligibility.requiredCertifications || []);
        }

        setRequiredSkills(data.requiredSkills || []);
        setPreferredSkills(data.preferredSkills || []);
        setIsLoading(false);
      } catch (err: unknown) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load position.');
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, currentUser?.uid]);

  // Toggles & Adders
  const toggleBranch = (b: string) => {
    if (branches.includes(b)) {
      setBranches(branches.filter((x) => x !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  const toggleYear = (y: string) => {
    if (graduationYears.includes(y)) {
      setGraduationYears(graduationYears.filter((x) => x !== y));
    } else {
      setGraduationYears([...graduationYears, y]);
    }
  };

  const handleAddRequiredSkill = () => {
    if (!newReqSkillName.trim()) return;
    setRequiredSkills([
      ...requiredSkills,
      { name: newReqSkillName.trim(), requiredLevel: Number(newReqSkillLevel) || 70 },
    ]);
    setNewReqSkillName('');
    setNewReqSkillLevel(70);
  };

  const handleAddPreferredSkill = () => {
    if (!newPrefSkillName.trim()) return;
    setPreferredSkills([
      ...preferredSkills,
      { name: newPrefSkillName.trim(), preferredLevel: Number(newPrefSkillLevel) || 50 },
    ]);
    setNewPrefSkillName('');
    setNewPrefSkillLevel(50);
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    if (!certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
    }
    setNewCert('');
  };

  // Submit Handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !jobId) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Job title is required.');
      return;
    }
    if (!company.trim()) {
      setErrorMessage('Company name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Job description is required.');
      return;
    }

    const parsedMinSalary = salaryMin ? parseFloat(salaryMin) : null;
    const parsedMaxSalary = salaryMax ? parseFloat(salaryMax) : null;
    if (parsedMinSalary != null && parsedMinSalary < 0) {
      setErrorMessage('Minimum salary cannot be negative.');
      return;
    }
    if (parsedMinSalary != null && parsedMaxSalary != null && parsedMaxSalary < parsedMinSalary) {
      setErrorMessage('Maximum salary must be greater than or equal to minimum salary.');
      return;
    }

    const parsedCgpa = minCgpa ? parseFloat(minCgpa) : null;
    if (parsedCgpa != null && (parsedCgpa < 0 || parsedCgpa > 10)) {
      setErrorMessage('Minimum CGPA must be between 0.0 and 10.0.');
      return;
    }

    setIsSaving(true);

    try {
      const updates = {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        location: location.trim(),
        workMode,
        employmentType,
        salaryMin: parsedMinSalary,
        salaryMax: parsedMaxSalary,
        openings: openings ? parseInt(openings, 10) : null,
        applicationDeadline,
        driveDate: driveDate || null,
        status,
        eligibility: {
          minCgpa: parsedCgpa,
          maxBacklogs: maxBacklogs ? parseInt(maxBacklogs, 10) : 0,
          graduationYears,
          branches,
          colleges: [],
          minExperienceMonths: minExperienceMonths ? parseInt(minExperienceMonths, 10) : 0,
          requiredCertifications: certifications,
        },
        requiredSkills,
        preferredSkills,
      };

      await jobService.updateJob(jobId, currentUser.uid, updates);
      setSuccessMessage('Job position updated successfully!');
      setTimeout(() => {
        router.push(`/recruiter/jobs/${jobId}`);
      }, 700);
    } catch (err: unknown) {
      console.error('[Update Job Error]:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update job position.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <div className="space-y-6 pb-12 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/recruiter/jobs"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Jobs
                </Link>
                <span className="text-slate-300">/</span>
                <Link
                  href={`/recruiter/jobs/${jobId}`}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Overview
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-teal-700">Edit</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Edit Position Criteria
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Update job descriptions, academic cut-offs, and required skill rubrics.
              </p>
            </div>

            <Link
              href={`/recruiter/jobs/${jobId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <span>Cancel & View</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">Loading position criteria...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* SECTION A: BASIC POSITION INFO */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-teal-600" />
                    1. Basic Position Information
                  </h2>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 font-medium">Status:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as JobStatus)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Work Mode</label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden bg-white"
                    >
                      <option value="ON_SITE">On-site</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden bg-white"
                    >
                      <option value="FULL_TIME">Full-time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Salary / CTC Minimum (₹ LPA)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Salary / CTC Maximum (₹ LPA)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Number of Openings
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={openings}
                      onChange={(e) => setOpenings(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={applicationDeadline}
                      onChange={(e) => setApplicationDeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* SECTION B: ELIGIBILITY REQUIREMENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    2. Mandatory Eligibility Criteria
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Minimum CGPA (0.0 – 10.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Maximum Allowed Backlogs
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={maxBacklogs}
                      onChange={(e) => setMaxBacklogs(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Minimum Experience (Months)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minExperienceMonths}
                      onChange={(e) => setMinExperienceMonths(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Graduation Years */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Eligible Graduation Years
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_GRADUATION_YEARS.map((yr) => {
                      const isSelected = graduationYears.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => toggleYear(yr)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                          <span>Batch {yr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Branches */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Eligible Academic Branches
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_BPUT_BRANCHES.map((br) => {
                      const isSelected = branches.includes(br);
                      return (
                        <button
                          key={br}
                          type="button"
                          onClick={() => toggleBranch(br)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-teal-600" />}
                          <span>{br}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Certifications */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Mandatory Certifications
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {certifications.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 max-w-sm">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      placeholder="Add certification requirement..."
                      className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCert}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION C: REQUIRED SKILLS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-teal-600" />
                    3. Required Skills (Mandatory)
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {requiredSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{sk.name}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">
                            Proficiency: {sk.requiredLevel} / 100
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={newReqSkillName}
                    onChange={(e) => setNewReqSkillName(e.target.value)}
                    placeholder="Skill name..."
                    className="w-full sm:flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500">Level:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newReqSkillLevel}
                      onChange={(e) => setNewReqSkillLevel(parseInt(e.target.value, 10) || 70)}
                      className="w-20 rounded-xl border border-slate-200 py-2 px-3 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequiredSkill}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Add Required
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION D: PREFERRED SKILLS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-teal-600" />
                    4. Preferred Skills (Nice to Have)
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {preferredSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{sk.name}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">
                            Proficiency: {sk.preferredLevel} / 100
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreferredSkills(preferredSkills.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={newPrefSkillName}
                    onChange={(e) => setNewPrefSkillName(e.target.value)}
                    placeholder="Preferred skill..."
                    className="w-full sm:flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500">Level:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPrefSkillLevel}
                      onChange={(e) => setNewPrefSkillLevel(parseInt(e.target.value, 10) || 50)}
                      className="w-20 rounded-xl border border-slate-200 py-2 px-3 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreferredSkill}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Add Preferred
                    </button>
                  </div>
                </div>
              </div>

              {/* SAVE BAR */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-end gap-3">
                <Link
                  href={`/recruiter/jobs/${jobId}`}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Position Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
