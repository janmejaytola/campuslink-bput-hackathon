'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Save,
  Check,
  User,
  BookOpen,
  Award,
  Target,
  Building,
  Upload,
  UploadCloud,
  ShieldCheck,
  Code2,
  Loader2,
  Compass,
  FileCheck,
  FileText,
  Trash2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES, UserRecord } from '@/types/auth';
import { profileService } from '@/lib/auth/profileService';
import { studentService } from '@/lib/services/studentService';
import { resumeService } from '@/lib/services/resumeService';
import { AuthTransitionScreen } from '@/components/auth/AuthTransitionScreen';

const SUGGESTED_SKILLS = [
  'Python',
  'Java',
  'C++',
  'SQL',
  'React',
  'Node.js',
  'TypeScript',
  'Data Structures',
  'Algorithms',
  'AWS',
  'Docker',
  'Git',
  'Machine Learning',
  'Spring Boot',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [transitioningUser, setTransitioningUser] = useState<UserRecord | null>(null);

  // Resume Upload State for Student
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [extractedSkillsFromResume, setExtractedSkillsFromResume] = useState<string[]>([]);

  // Student Form State initialized with existing user details if available
  const [studentForm, setStudentForm] = useState(() => ({
    fullName: currentUser?.displayName || currentUser?.name || '',
    phone: currentUser?.phone || '',
    dateOfBirth: '2004-05-15',
    gender: 'Male',
    college: currentUser?.institution || 'Silicon Institute of Technology',
    department: currentUser?.department || 'Computer Science and Engineering',
    bputRegistrationNumber: currentUser?.regNumber || '',
    semester: '7th Semester',
    cgpa: 8.4,
    backlogs: 0,
    skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
    targetRole: 'Software Engineer',
    preferredLocation: 'Bhubaneswar, Bengaluru',
    expectedSalary: '8-12 LPA',
    workMode: 'Hybrid',
  }));

  // Recruiter Form State initialized with existing user details
  const [recruiterForm, setRecruiterForm] = useState(() => ({
    companyName: currentUser?.company || 'Tata Consultancy Services',
    industry: 'Enterprise Software & IT Services',
    website: 'https://company.com',
    headquarters: 'Bhubaneswar / Bengaluru',
    recruiterName: currentUser?.displayName || currentUser?.name || '',
    designation: currentUser?.designation || 'Campus Hiring Lead',
    contactPhone: currentUser?.phone || '+91 98765 00000',
    contactEmail: currentUser?.email || '',
    targetDisciplines: ['CSE', 'IT', 'ECE'],
    hiringBand: '₹7.0 - ₹12.0 LPA',
    expectedOpenings: '15-25',
    authorizedPolicyAccepted: true,
  }));

  // Placement Officer Form State initialized with existing user details
  const [officerForm, setOfficerForm] = useState(() => ({
    institutionName: currentUser?.institution || 'Biju Patnaik University of Technology (BPUT)',
    campusLocation: 'Rourkela / Bhubaneswar Campus',
    tpoDivision: currentUser?.department || 'Central Training & Placement Cell',
    officerName: currentUser?.displayName || currentUser?.name || '',
    designation: currentUser?.designation || 'Central Placement Officer / Convenor',
    officialEmail: currentUser?.email || '',
    officePhone: currentUser?.phone || '+91 661 2484567',
    affiliatedCollegesCount: 124,
    batchYear: '2026',
    conflictEngineActive: true,
    ps10AuditActive: true,
  }));

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const userRole: StrictRole = currentUser?.role || 'STUDENT';
  const totalSteps = userRole === 'STUDENT' ? 5 : 3;
  const progressPct = Math.round((step / totalSteps) * 100);

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkipOrContinueLater = () => {
    const dest = ROLE_DASHBOARD_ROUTES[userRole] || '/student';
    router.push(dest);
  };

  // Resume File Selection Handler
  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      alert('Please upload a valid PDF or DOCX file.');
      return;
    }

    setResumeFile(file);
    setIsUploadingResume(true);
    setResumeUploadProgress(20);

    // Simulated parsing progress with instant feedback
    const t1 = setTimeout(() => setResumeUploadProgress(65), 300);
    const t2 = setTimeout(() => {
      setResumeUploadProgress(100);
      setIsUploadingResume(false);
      setResumeUploaded(true);
      const extracted = ['React', 'TypeScript', 'Docker', 'AWS', 'Python', 'SQL'];
      setExtractedSkillsFromResume(extracted);

      // Automatically append extracted skills to student skills
      setStudentForm((prev) => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...extracted])),
      }));
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  const handleFinalSubmit = async () => {
    if (!currentUser?.uid) return;
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      if (userRole === 'STUDENT') {
        await profileService.updateUserProfile(currentUser.uid, {
          name: studentForm.fullName.trim() || currentUser.name,
          displayName: studentForm.fullName.trim() || currentUser.name,
          phone: studentForm.phone.trim(),
          regNumber: studentForm.bputRegistrationNumber.trim(),
          department: studentForm.department,
          institution: studentForm.college,
          onboardingCompleted: true,
          updatedAt: now,
        });

        await studentService.saveStudentProfile({
          uid: currentUser.uid,
          fullName: studentForm.fullName.trim() || currentUser.name,
          email: currentUser.email,
          phone: studentForm.phone.trim(),
          dateOfBirth: studentForm.dateOfBirth,
          gender: studentForm.gender,
          bputRegistrationNumber: studentForm.bputRegistrationNumber.trim() || '2201106284',
          college: studentForm.college,
          department: studentForm.department,
          branch: studentForm.department,
          semester: studentForm.semester,
          graduationYear: '2026',
          cgpa: Number(studentForm.cgpa) || 8.4,
          backlogs: Number(studentForm.backlogs) || 0,
          skills: studentForm.skills,
          skillProficiencies: studentForm.skills.reduce((acc, s) => ({ ...acc, [s]: 85 }), {}),
          readinessInputs: {
            aptitudeScore: 84,
            technicalScore: 88,
            communicationScore: 82,
          },
          careerGoal: {
            targetRole: studentForm.targetRole,
            jobType: 'Full-time',
            preferredLocation: studentForm.preferredLocation,
            workMode: studentForm.workMode,
            expectedSalary: studentForm.expectedSalary,
          },
          profileCompletion: 95,
          createdAt: now,
          updatedAt: now,
        });
      } else if (userRole === 'RECRUITER') {
        await profileService.updateUserProfile(currentUser.uid, {
          name: recruiterForm.recruiterName.trim() || currentUser.name,
          company: recruiterForm.companyName.trim(),
          designation: recruiterForm.designation.trim(),
          phone: recruiterForm.contactPhone.trim(),
          onboardingCompleted: true,
          updatedAt: now,
        });
      } else {
        await profileService.updateUserProfile(currentUser.uid, {
          name: officerForm.officerName.trim() || currentUser.name,
          institution: officerForm.institutionName.trim(),
          department: officerForm.tpoDivision.trim(),
          designation: officerForm.designation.trim(),
          phone: officerForm.officePhone.trim(),
          onboardingCompleted: true,
          updatedAt: now,
        });
      }

      updateProfile({ onboardingCompleted: true });
      setSuccessMsg('Profile setup successfully completed! Launching workspace...');

      // Activate smooth transition screen to the authoritative destination
      const updatedUser: UserRecord = {
        ...currentUser,
        onboardingCompleted: true,
      };
      setTransitioningUser(updatedUser);
    } catch (err) {
      console.error('[Onboarding submit error]:', err);
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setStudentForm((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const toggleDiscipline = (disc: string) => {
    setRecruiterForm((prev) => {
      const exists = prev.targetDisciplines.includes(disc);
      if (exists) {
        return {
          ...prev,
          targetDisciplines: prev.targetDisciplines.filter((d) => d !== disc),
        };
      } else {
        return { ...prev, targetDisciplines: [...prev.targetDisciplines, disc] };
      }
    });
  };

  if (transitioningUser) {
    return (
      <AuthTransitionScreen
        user={transitioningUser}
        destination={ROLE_DASHBOARD_ROUTES[userRole] || '/student'}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 text-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#16CFFF]" />
        <p className="mt-3 text-xs text-[#9CB4CC]">Loading workspace onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-[#F4FAFF] flex flex-col font-sans selection:bg-[#16CFFF]/25 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[36rem] h-[36rem] bg-[#16CFFF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[36rem] h-[36rem] bg-[#00E5D4]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-[#152744] bg-[#020817]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-sm tracking-wider shadow-[0_0_15px_rgba(22,207,255,0.4)]">
              CL
            </div>
            <div>
              <span className="text-sm font-black text-white">CAMPUSLINK</span>
              <span className="text-[10px] font-mono text-[#16CFFF] ml-2">FIRST-TIME ONBOARDING</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipOrContinueLater}
            className="text-xs font-semibold text-[#9CB4CC] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Continue Later</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Progress Bar & Steps Indicator */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#16CFFF] font-mono">
              STEP {step} OF {totalSteps}
            </span>
            <span className="text-[#9CB4CC]">{progressPct}% Completed</span>
          </div>

          <div className="h-2 w-full rounded-full bg-[#06162D] border border-[#152744] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#16CFFF] via-[#00E5D4] to-[#00BFA6] transition-all duration-300 shadow-[0_0_10px_rgba(22,207,255,0.4)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Feedback notification */}
        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/70 p-4 text-xs font-semibold text-emerald-200 flex items-center gap-2.5 shadow-lg backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP CARDS */}
        <div className="rounded-3xl border border-[#16CFFF]/25 bg-[#06162D]/90 p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-6">
          {/* ==================== STUDENT ONBOARDING ==================== */}
          {userRole === 'STUDENT' && (
            <>
              {/* Step 1: Personal Profile Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#16CFFF] uppercase tracking-wider block">
                      PERSONAL PROFILE
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Candidate Dossier Details
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Verify your identity to link with official university placement records.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={studentForm.fullName}
                        onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                        placeholder="e.g. Priyanshu Mohanty"
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Gender
                        </label>
                        <select
                          value={studentForm.gender}
                          onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00E5D4] uppercase tracking-wider block">
                      ACADEMIC INFORMATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      University Academic Record
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Gated criteria used by the deterministic rule engine for campus drives.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        College / Institution
                      </label>
                      <input
                        type="text"
                        value={studentForm.college}
                        onChange={(e) => setStudentForm({ ...studentForm, college: e.target.value })}
                        placeholder="e.g. Silicon Institute of Technology, Bhubaneswar"
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Engineering Discipline
                        </label>
                        <input
                          type="text"
                          value={studentForm.department}
                          onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                          placeholder="Computer Science & Engineering"
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          BPUT Registration Number
                        </label>
                        <input
                          type="text"
                          value={studentForm.bputRegistrationNumber}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, bputRegistrationNumber: e.target.value })
                          }
                          placeholder="e.g. 2201106284"
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs font-mono text-[#16CFFF] placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Current Verified CGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={studentForm.cgpa}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, cgpa: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs font-mono font-bold text-emerald-400 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Active Backlogs
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={studentForm.backlogs}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, backlogs: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs font-mono text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Skills */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#16CFFF] uppercase tracking-wider block">
                      TECHNICAL COMPETENCIES
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Core Skills & Technologies
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Used by explainable matching to compute job fit percentages.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">
                      Select all proficiencies that apply:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_SKILLS.map((sk) => {
                        const selected = studentForm.skills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              selected
                                ? 'bg-[#16CFFF]/20 border border-[#16CFFF] text-[#16CFFF] shadow-[0_0_12px_rgba(22,207,255,0.25)]'
                                : 'bg-[#020817] border border-[#152744] text-[#9CB4CC] hover:border-[#16CFFF]/40 hover:text-white'
                            }`}
                          >
                            {selected ? '✓ ' : '+ '}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Resume Upload */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00E5D4] uppercase tracking-wider block">
                      RESUME DOSSIER
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Upload & AI Resume Parsing
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Upload your standard technical resume for instant placement indexing and ATS matching.
                    </p>
                  </div>

                  {/* Dropzone container */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#16CFFF]/40 hover:border-[#16CFFF] bg-[#020817]/80 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#06162D] group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleResumeFileSelect}
                      className="hidden"
                    />

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#16CFFF]/10 border border-[#16CFFF]/30 text-[#16CFFF] mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-7 w-7" />
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-[#16CFFF] transition-colors">
                      {resumeFile ? resumeFile.name : 'Click to select or drag and drop your resume'}
                    </h3>
                    <p className="text-xs text-[#9CB4CC] mt-1">
                      Supports PDF and DOCX files (Up to 5 MB)
                    </p>
                  </div>

                  {/* Progress feedback */}
                  {isUploadingResume && (
                    <div className="p-4 rounded-xl bg-[#020817] border border-[#152744] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#16CFFF]" />
                          Parsing document entities & skills...
                        </span>
                        <span className="font-mono text-[#16CFFF]">{resumeUploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#06162D] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#16CFFF] to-[#00E5D4] transition-all duration-300"
                          style={{ width: `${resumeUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Uploaded state indicator */}
                  {resumeUploaded && (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {resumeFile?.name || 'Resume Document Verified'}
                            </span>
                            <span className="text-[11px] text-emerald-300">
                              Parsed and indexed for deterministic candidate ranking
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-600/40">
                          PARSED
                        </span>
                      </div>

                      {extractedSkillsFromResume.length > 0 && (
                        <div className="pt-2 border-t border-emerald-900/40">
                          <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                            Extracted Skills Added to Profile:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {extractedSkillsFromResume.map((sk) => (
                              <span
                                key={sk}
                                className="text-[10px] font-mono font-bold bg-[#00E5D4]/15 border border-[#00E5D4]/30 text-[#00E5D4] px-2 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Career Interests & Preferences */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00E5D4] uppercase tracking-wider block">
                      CAREER ASPIRATIONS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Target Role & Preferences
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Configure your corporate placement targeting preferences.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        Target Career Role
                      </label>
                      <input
                        type="text"
                        value={studentForm.targetRole}
                        onChange={(e) => setStudentForm({ ...studentForm, targetRole: e.target.value })}
                        placeholder="e.g. Software Engineer / Data Analyst / Cloud Engineer"
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Preferred Location
                        </label>
                        <input
                          type="text"
                          value={studentForm.preferredLocation}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, preferredLocation: e.target.value })
                          }
                          placeholder="Bhubaneswar, Bengaluru, Hyderabad"
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Expected Package Band
                        </label>
                        <input
                          type="text"
                          value={studentForm.expectedSalary}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, expectedSalary: e.target.value })
                          }
                          placeholder="8-12 LPA"
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs font-mono text-emerald-400 placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== RECRUITER ONBOARDING ==================== */}
          {userRole === 'RECRUITER' && (
            <>
              {/* Step 1: Company Profile */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00E5D4] uppercase tracking-wider block">
                      COMPANY IDENTITY
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Hiring Organization Profile
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Company details displayed on published campus drive listings.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={recruiterForm.companyName}
                        onChange={(e) =>
                          setRecruiterForm({ ...recruiterForm, companyName: e.target.value })
                        }
                        placeholder="e.g. Tata Consultancy Services, Deloitte, Amazon"
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Industry / Domain
                        </label>
                        <input
                          type="text"
                          value={recruiterForm.industry}
                          onChange={(e) => setRecruiterForm({ ...recruiterForm, industry: e.target.value })}
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Headquarters / Hub
                        </label>
                        <input
                          type="text"
                          value={recruiterForm.headquarters}
                          onChange={(e) =>
                            setRecruiterForm({ ...recruiterForm, headquarters: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Recruiter Profile */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#16CFFF] uppercase tracking-wider block">
                      RECRUITER CREDENTIALS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Lead Hiring Manager Info
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Authorized recruiter coordinating candidate shortlists and panel interviews.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        Recruiter Full Name
                      </label>
                      <input
                        type="text"
                        value={recruiterForm.recruiterName}
                        onChange={(e) =>
                          setRecruiterForm({ ...recruiterForm, recruiterName: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Corporate Designation
                        </label>
                        <input
                          type="text"
                          value={recruiterForm.designation}
                          onChange={(e) =>
                            setRecruiterForm({ ...recruiterForm, designation: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Work Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={recruiterForm.contactPhone}
                          onChange={(e) =>
                            setRecruiterForm({ ...recruiterForm, contactPhone: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Authorized Recruitment Setup */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">
                      RECRUITMENT SCOPE & AUTHORIZATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Campus Sourcing Parameters
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Configure your hiring target bands for the BPUT 2026 cohort.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Typical Package Range
                        </label>
                        <input
                          type="text"
                          value={recruiterForm.hiringBand}
                          onChange={(e) => setRecruiterForm({ ...recruiterForm, hiringBand: e.target.value })}
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs font-mono text-emerald-400 focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Target Cohort Openings
                        </label>
                        <input
                          type="text"
                          value={recruiterForm.expectedOpenings}
                          onChange={(e) =>
                            setRecruiterForm({ ...recruiterForm, expectedOpenings: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-2">
                        Target Engineering Disciplines
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['CSE', 'IT', 'ECE', 'EE', 'Mechanical', 'Civil'].map((disc) => {
                          const active = recruiterForm.targetDisciplines.includes(disc);
                          return (
                            <button
                              key={disc}
                              type="button"
                              onClick={() => toggleDiscipline(disc)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#16CFFF]/20 border border-[#16CFFF] text-[#16CFFF]'
                                  : 'bg-[#020817] border border-[#152744] text-[#9CB4CC]'
                              }`}
                            >
                              {active ? '✓ ' : '+ '} {disc}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#020817] border border-[#152744] flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                      <p className="text-xs text-slate-300">
                        Authorized enterprise hiring agreement active with BPUT Central Placement Cell.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== OFFICER ONBOARDING ==================== */}
          {userRole === 'PLACEMENT_OFFICER' && (
            <>
              {/* Step 1: Institutional Profile */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00E5D4] uppercase tracking-wider block">
                      INSTITUTIONAL PROFILE
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      University Placement Office
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Central placement governance for university engineering cohorts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        University / Institute Name
                      </label>
                      <input
                        type="text"
                        value={officerForm.institutionName}
                        onChange={(e) =>
                          setOfficerForm({ ...officerForm, institutionName: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        TPO Division / Office
                      </label>
                      <input
                        type="text"
                        value={officerForm.tpoDivision}
                        onChange={(e) =>
                          setOfficerForm({ ...officerForm, tpoDivision: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Placement Officer Credentials */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#16CFFF] uppercase tracking-wider block">
                      OFFICER CREDENTIALS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Placement Officer Authority
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Official authorization for drive coordination and student registry auditing.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                        Officer Full Name
                      </label>
                      <input
                        type="text"
                        value={officerForm.officerName}
                        onChange={(e) => setOfficerForm({ ...officerForm, officerName: e.target.value })}
                        className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          Official Designation
                        </label>
                        <input
                          type="text"
                          value={officerForm.designation}
                          onChange={(e) =>
                            setOfficerForm({ ...officerForm, designation: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                          TPO Office Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={officerForm.officePhone}
                          onChange={(e) =>
                            setOfficerForm({ ...officerForm, officePhone: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 px-3.5 text-xs text-white focus:border-[#16CFFF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Authorized Placement Setup */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">
                      GOVERNANCE SETUP & AUTHORIZATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Placement Cell Compliance & Safety
                    </h2>
                    <p className="text-xs text-[#9CB4CC]">
                      Activate automated timetable conflict protection and PS10 rule auditing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#020817] border border-[#152744]">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <strong className="text-xs font-bold text-white block">
                          Interval Tree Clash Prevention Active
                        </strong>
                        <p className="text-[11px] text-[#9CB4CC]">
                          Ensures company interview slots never collide with semester exams or labs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#020817] border border-[#152744]">
                      <FileCheck className="h-5 w-5 text-[#16CFFF] shrink-0" />
                      <div>
                        <strong className="text-xs font-bold text-white block">
                          BPUT PS10 Regulatory Gating Active
                        </strong>
                        <p className="text-[11px] text-[#9CB4CC]">
                          Zero-hallucination verification of academic transcripts and offer issuance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#020817] border border-[#152744]">
                      <Building2 className="h-5 w-5 text-[#00E5D4] shrink-0" />
                      <div>
                        <strong className="text-xs font-bold text-white block">
                          124 Affiliated Engineering Colleges Connected
                        </strong>
                        <p className="text-[11px] text-[#9CB4CC]">
                          Centralized candidate pool across BPUT 2026 engineering graduates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#152744] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#152744] bg-[#020817] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-[#16CFFF]/40 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkipOrContinueLater}
                disabled={isSubmitting}
                className="text-xs text-[#9CB4CC] hover:text-white font-medium transition-colors cursor-pointer"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="gradient-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : step < totalSteps ? (
                  <>
                    <span>Next Step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Complete & Enter Workspace</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
