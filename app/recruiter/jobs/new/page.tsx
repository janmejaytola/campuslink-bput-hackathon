'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar,
  Building,
  MapPin,
  Sliders,
  Check,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  RecruiterJob,
  JobStatus,
  WorkMode,
  EmploymentType,
  WORK_MODE_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  COMMON_BPUT_BRANCHES,
  COMMON_GRADUATION_YEARS,
  JobSkillRequirement,
  JobPreferredSkill,
} from '@/types/job';
import { jobService } from '@/lib/services/jobService';

function CreateJobContent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get('tab') === 'upload' ? 'UPLOAD' : 'MANUAL';
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'UPLOAD'>(initialTab);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('Bhubaneswar, Odisha');
  const [workMode, setWorkMode] = useState<WorkMode>('HYBRID');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState<string>('6');
  const [salaryMax, setSalaryMax] = useState<string>('10');
  const [openings, setOpenings] = useState<string>('5');
  const [applicationDeadline, setApplicationDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [driveDate, setDriveDate] = useState<string>('');

  // Eligibility requirements
  const [minCgpa, setMinCgpa] = useState<string>('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState<string>('0');
  const [graduationYears, setGraduationYears] = useState<string[]>(['2026']);
  const [branches, setBranches] = useState<string[]>(['CSE', 'IT', 'ECE']);
  const [minExperienceMonths, setMinExperienceMonths] = useState<string>('0');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState<string>('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<JobSkillRequirement[]>([
    { name: 'Data Structures', requiredLevel: 75 },
    { name: 'Java', requiredLevel: 70 },
  ]);
  const [preferredSkills, setPreferredSkills] = useState<JobPreferredSkill[]>([
    { name: 'React', preferredLevel: 60 },
  ]);
  const [newReqSkillName, setNewReqSkillName] = useState<string>('');
  const [newReqSkillLevel, setNewReqSkillLevel] = useState<number>(70);
  const [newPrefSkillName, setNewPrefSkillName] = useState<string>('');
  const [newPrefSkillLevel, setNewPrefSkillLevel] = useState<number>(50);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isReviewingParsed, setIsReviewingParsed] = useState<boolean>(false);
  const [parsedRawData, setParsedRawData] = useState<any>(null);
  const [aiFieldTracker, setAiFieldTracker] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saving states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishConfirmModal, setPublishConfirmModal] = useState<boolean>(false);

  // Handle branch toggle
  const toggleBranch = (b: string) => {
    if (branches.includes(b)) {
      setBranches(branches.filter((x) => x !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  // Handle graduation year toggle
  const toggleYear = (y: string) => {
    if (graduationYears.includes(y)) {
      setGraduationYears(graduationYears.filter((x) => x !== y));
    } else {
      setGraduationYears([...graduationYears, y]);
    }
  };

  // Add required skill
  const handleAddRequiredSkill = () => {
    if (!newReqSkillName.trim()) return;
    setRequiredSkills([
      ...requiredSkills,
      { name: newReqSkillName.trim(), requiredLevel: Number(newReqSkillLevel) || 70 },
    ]);
    setNewReqSkillName('');
    setNewReqSkillLevel(70);
  };

  // Add preferred skill
  const handleAddPreferredSkill = () => {
    if (!newPrefSkillName.trim()) return;
    setPreferredSkills([
      ...preferredSkills,
      { name: newPrefSkillName.trim(), preferredLevel: Number(newPrefSkillLevel) || 50 },
    ]);
    setNewPrefSkillName('');
    setNewPrefSkillLevel(50);
  };

  // Add certification
  const handleAddCert = () => {
    if (!newCert.trim()) return;
    if (!certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
    }
    setNewCert('');
  };

  // File Drop / Selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage('Resume or JD document must be smaller than 5 MB.');
      return;
    }
    const name = file.name.toLowerCase();
    const isDocx =
      name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';

    if (!isDocx && !isPdf) {
      setErrorMessage('Please upload a PDF or DOCX file.');
      return;
    }

    setSelectedFile(file);
  };

  // Trigger server-side JD parsing
  const handleParseJD = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a PDF or DOCX JD document first.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/jobs/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success || !result.data) {
        throw new Error(
          result.error ||
            "We couldn't reliably parse this JD. Please review the document or create the job manually."
        );
      }

      const d = result.data;
      setParsedRawData(d);

      // Populate form fields with extracted data
      if (d.title) setTitle(d.title);
      if (d.company) setCompany(d.company);
      if (d.description) setDescription(d.description);
      if (d.location) setLocation(d.location);
      if (d.workMode && ['ON_SITE', 'HYBRID', 'REMOTE'].includes(d.workMode)) {
        setWorkMode(d.workMode as WorkMode);
      }
      if (d.employmentType && ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].includes(d.employmentType)) {
        setEmploymentType(d.employmentType as EmploymentType);
      }
      if (d.salaryMin != null) setSalaryMin(String(d.salaryMin));
      if (d.salaryMax != null) setSalaryMax(String(d.salaryMax));
      if (d.openings != null) setOpenings(String(d.openings));
      if (d.applicationDeadline) setApplicationDeadline(d.applicationDeadline.split('T')[0]);
      if (d.driveDate) setDriveDate(d.driveDate.split('T')[0]);

      if (d.eligibility) {
        if (d.eligibility.minCgpa != null) setMinCgpa(String(d.eligibility.minCgpa));
        if (d.eligibility.maxBacklogs != null) setMaxBacklogs(String(d.eligibility.maxBacklogs));
        if (Array.isArray(d.eligibility.graduationYears) && d.eligibility.graduationYears.length > 0) {
          setGraduationYears(d.eligibility.graduationYears.map(String));
        }
        if (Array.isArray(d.eligibility.branches) && d.eligibility.branches.length > 0) {
          setBranches(d.eligibility.branches);
        }
        if (d.eligibility.minExperienceMonths != null) {
          setMinExperienceMonths(String(d.eligibility.minExperienceMonths));
        }
        if (Array.isArray(d.eligibility.requiredCertifications)) {
          setCertifications(d.eligibility.requiredCertifications);
        }
      }

      if (Array.isArray(d.requiredSkills) && d.requiredSkills.length > 0) {
        setRequiredSkills(
          d.requiredSkills.map((s: any) => ({
            name: s.name,
            requiredLevel: Number(s.requiredLevel) || 70,
          }))
        );
      }

      if (Array.isArray(d.preferredSkills) && d.preferredSkills.length > 0) {
        setPreferredSkills(
          d.preferredSkills.map((s: any) => ({
            name: s.name,
            preferredLevel: Number(s.preferredLevel) || 50,
          }))
        );
      }

      // Mark fields as AI-extracted
      setAiFieldTracker({
        title: Boolean(d.title),
        company: Boolean(d.company),
        description: Boolean(d.description),
        location: Boolean(d.location),
        salary: d.salaryMin != null || d.salaryMax != null,
        eligibility: Boolean(d.eligibility?.minCgpa || d.eligibility?.branches?.length),
        skills: Boolean(d.requiredSkills?.length || d.preferredSkills?.length),
      });

      setIsReviewingParsed(true);
      setActiveTab('MANUAL'); // Show form in review mode
    } catch (err: unknown) {
      console.error('[JD Parser Error]:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "We couldn't reliably parse this JD. Please review the document or create the job manually."
      );
    } finally {
      setIsParsing(false);
    }
  };

  // Submit & Save Job to Firestore
  const handleSaveJob = async (statusToSet: JobStatus) => {
    if (!currentUser?.uid) return;
    setErrorMessage(null);

    // Validation
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

    if (statusToSet === 'OPEN' && requiredSkills.length === 0) {
      setErrorMessage('Publishing requires at least one required skill or technical competency.');
      return;
    }

    setIsSaving(true);

    try {
      let jdStoragePath = '';
      let jdFileName = '';

      // If a JD file was uploaded, store it in Firebase Storage
      if (selectedFile) {
        jdFileName = selectedFile.name;
        // Generate a temporary job id or upload directly
        const tempId = `job_${Date.now()}`;
        const uploadResult = await jobService.uploadJdFile(currentUser.uid, tempId, selectedFile);
        jdStoragePath = uploadResult.storagePath;
      }

      const jobPayload = {
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
        status: statusToSet,
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
        jdSource: isReviewingParsed ? ('AI_PARSED' as const) : ('MANUAL' as const),
        jdFileName: jdFileName || undefined,
        jdStoragePath: jdStoragePath || undefined,
        aiParsed: isReviewingParsed,
        aiParsedAt: isReviewingParsed ? new Date().toISOString() : undefined,
      };

      const created = await jobService.createJob(currentUser.uid, jobPayload);
      router.push(`/recruiter/jobs/${created.id}`);
    } catch (err: unknown) {
      console.error('[Error saving job]:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save job position. Please verify criteria.'
      );
    } finally {
      setIsSaving(false);
      setPublishConfirmModal(false);
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
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/60">
                  <Plus className="h-3 w-3 text-teal-600" />
                  New Campus Position
                </span>
                <span className="text-[11px] font-medium text-slate-500">Requisition & Criteria Builder</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Create Campus Job Opening
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Define position details, mandatory student requirements, and required skill rubrics.
              </p>
            </div>

            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <span>Back to Jobs</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                &times;
              </button>
            </div>
          )}

          {/* AI Parser Review Notice */}
          {isReviewingParsed && (
            <div className="rounded-2xl border border-teal-300 bg-teal-50/80 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                      AI Extracted Requirements — Review Before Saving
                    </h3>
                    <span className="rounded bg-teal-100 text-teal-800 text-[10px] font-semibold px-2 py-0.5">
                      Gemini 3.8 Flash Parser
                    </span>
                  </div>
                  <p className="text-xs text-teal-900 mt-1 leading-relaxed">
                    CAMPUSLINK extracted these structured requirements from your uploaded document (<strong className="font-semibold">{selectedFile?.name}</strong>). Please verify every requirement, branch whitelist, and skill proficiency before saving or publishing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selector Tabs: Create Manually vs Upload JD */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-sm">
            <button
              type="button"
              onClick={() => setActiveTab('MANUAL')}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                activeTab === 'MANUAL'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Manually
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'UPLOAD'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="h-3.5 w-3.5 text-teal-600" />
              <span>Upload JD Document</span>
            </button>
          </div>

          {/* METHOD 2: UPLOAD JD VIEW */}
          {activeTab === 'UPLOAD' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload Job Description Document</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload an existing job description in PDF or DOCX format. CAMPUSLINK will extract structured requirements for your review.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) validateAndSetFile(file);
                }}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                  selectedFile
                    ? 'border-teal-500 bg-teal-50/30'
                    : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-3 shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>

                <div className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Drop your JD document here or browse files'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: PDF or DOCX • Maximum file size: 5 MB
                </p>

                {selectedFile && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs">
                    <FileText className="h-3.5 w-3.5 text-teal-600" />
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-1 text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleParseJD}
                  disabled={!selectedFile || isParsing}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Parsing JD with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Parse Document with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* METHOD 1 / REVIEW MODE: COMPREHENSIVE JOB CREATION FORM */}
          {activeTab === 'MANUAL' && (
            <div className="space-y-6">
              {/* SECTION A: BASIC INFORMATION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-teal-600" />
                      1. Position & Basic Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Core organizational identity and role specifications.
                    </p>
                  </div>
                  {aiFieldTracker.title && (
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      AI Populated
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Job Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Graduate Software Engineer (2026 Batch)"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bhubaneswar / Bengaluru"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Work Mode */}
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

                  {/* Employment Type */}
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

                  {/* Salary Minimum & Maximum */}
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
                      placeholder="e.g. 6.5"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
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
                      placeholder="e.g. 10.0"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  {/* Openings */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Number of Openings
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={openings}
                      onChange={(e) => setOpenings(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  {/* Application Deadline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={applicationDeadline}
                      onChange={(e) => setApplicationDeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Job Description Textarea */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    Describe responsibilities, required qualifications, preferred qualifications and role expectations.
                  </p>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed description of the role, day-to-day responsibilities, and team structure..."
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* SECTION B: ELIGIBILITY REQUIREMENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-teal-600" />
                      2. Mandatory Eligibility Criteria
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Institutional threshold criteria used by CAMPUSLINK for deterministic student qualification.
                    </p>
                  </div>
                  {aiFieldTracker.eligibility && (
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      AI Populated
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Min CGPA */}
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

                  {/* Max Backlogs */}
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

                  {/* Min Experience */}
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

                {/* Eligible Branches */}
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

                {/* Required Certifications */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Mandatory Certifications (Optional)
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCert();
                        }
                      }}
                      placeholder="e.g. AWS Certified Developer..."
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

              {/* SECTION C: REQUIRED SKILLS (MANDATORY) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-teal-600" />
                      3. Required Technical Skills (Mandatory)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Required skills represent mandatory competencies. Target proficiency (0–100).
                    </p>
                  </div>
                  {aiFieldTracker.skills && (
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      AI Populated
                    </span>
                  )}
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
                            Target Proficiency: {sk.requiredLevel} / 100
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add required skill input */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={newReqSkillName}
                    onChange={(e) => setNewReqSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Python, SQL, React)..."
                    className="w-full sm:flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Level (0-100):</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newReqSkillLevel}
                      onChange={(e) => setNewReqSkillLevel(parseInt(e.target.value, 10) || 70)}
                      className="w-20 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequiredSkill}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                    >
                      Add Required
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION D: PREFERRED SKILLS (NICE TO HAVE) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-teal-600" />
                    4. Preferred Skills (Nice to Have)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preferred skills are useful but not mandatory. Clearly separated from hard requirements.
                  </p>
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
                            Preferred Proficiency: {sk.preferredLevel} / 100
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreferredSkills(preferredSkills.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add preferred skill input */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={newPrefSkillName}
                    onChange={(e) => setNewPrefSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Docker, AWS, GraphQL)..."
                    className="w-full sm:flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Level (0-100):</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPrefSkillLevel}
                      onChange={(e) => setNewPrefSkillLevel(parseInt(e.target.value, 10) || 50)}
                      className="w-20 rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreferredSkill}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                    >
                      Add Preferred
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Saving stores this job in Firestore at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">jobs/{`{jobId}`}</code>.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSaveJob('DRAFT')}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>Save as Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishConfirmModal(true)}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Publish Job Opening</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PUBLISH CONFIRMATION MODAL */}
          {publishConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Publish Campus Job Opening</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Publishing this job will make it active (OPEN) and available for candidate application tracking. Continue?
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPublishConfirmModal(false)}
                    disabled={isSaving}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveJob('OPEN')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirm & Publish</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-lg mb-4 shadow-sm animate-pulse">
            CL
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            <span>Loading job studio...</span>
          </div>
        </div>
      }
    >
      <CreateJobContent />
    </Suspense>
  );
}
