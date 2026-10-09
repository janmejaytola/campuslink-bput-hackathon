'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  Target,
  Briefcase,
  Award,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code2,
  BookOpen,
  Building2,
  Calendar,
  X,
  TrendingUp,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  StudentProfile,
  ProjectItem,
  CertificationItem,
  InternshipItem,
  TARGET_ROLE_OPTIONS,
  WORK_MODE_OPTIONS,
  JOB_TYPE_OPTIONS,
  DEFAULT_STUDENT_PROFILE,
} from '@/types/student';
import {
  studentService,
  calculateCompletion,
  CompletionAudit,
} from '@/lib/services/studentService';

const SUGGESTED_SKILLS = [
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Data Structures',
  'Algorithms',
  'Machine Learning',
  'Deep Learning',
  'Cloud Computing',
  'AWS',
  'Docker',
  'Git',
  'Spring Boot',
  'Communication',
];

export default function StudentProfilePage() {
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core profile state
  const [profile, setProfile] = useState<StudentProfile>({
    uid: currentUser?.uid || '',
    fullName: currentUser?.name || currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dateOfBirth: '',
    gender: 'Male',
    photoURL: currentUser?.photoURL || '',
    bputRegistrationNumber: currentUser?.regNumber || '',
    college: currentUser?.institution || 'BPUT Affiliated Engineering Institute',
    department: currentUser?.department || 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    semester: '7th Semester',
    graduationYear: '2026',
    cgpa: 8.0,
    backlogs: 0,
    skills: ['Java', 'Python', 'SQL', 'Data Structures'],
    careerGoal: {
      targetRole: 'Software Engineer',
      jobType: 'Full-time',
      preferredLocation: 'Bhubaneswar, Bengaluru, Hyderabad',
      workMode: 'Hybrid',
      expectedSalary: '6-9 LPA',
    },
    readinessInputs: {
      aptitudeScore: 75,
      technicalScore: 80,
      communicationScore: 78,
    },
    profileCompletion: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Subcollection states
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [internships, setInternships] = useState<InternshipItem[]>([]);

  // Skill input state
  const [skillInput, setSkillInput] = useState('');

  // Modals / Item Editors
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [editingCert, setEditingCert] = useState<Partial<CertificationItem> | null>(null);
  const [editingInternship, setEditingInternship] = useState<Partial<InternshipItem> | null>(null);

  // Dynamic profile completion audit computed via useMemo
  const completionAudit = useMemo(() => {
    return calculateCompletion(
      profile,
      projects.length,
      certifications.length,
      internships.length
    );
  }, [profile, projects.length, certifications.length, internships.length]);

  // Load student profile & subcollections from Firestore
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (!currentUser?.uid) return;
      try {
        const [fetchedProfile, fetchedProjects, fetchedCerts, fetchedInterns] =
          await Promise.all([
            studentService.getStudentProfile(currentUser.uid),
            studentService.getProjects(currentUser.uid),
            studentService.getCertifications(currentUser.uid),
            studentService.getInternships(currentUser.uid),
          ]);

        if (isCancelled) return;

        if (fetchedProfile) {
          setProfile(fetchedProfile);
        } else {
          setProfile((prev) => ({
            ...DEFAULT_STUDENT_PROFILE,
            ...prev,
            uid: currentUser.uid,
            fullName: currentUser.name || currentUser.displayName || prev.fullName,
            email: currentUser.email || prev.email,
            phone: currentUser.phone || prev.phone,
            bputRegistrationNumber: currentUser.regNumber || prev.bputRegistrationNumber,
            department: currentUser.department || prev.department,
            college: currentUser.institution || prev.college,
          }));
        }

        setProjects(fetchedProjects);
        setCertifications(fetchedCerts);
        setInternships(fetchedInterns);
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('Error loading student profile from Firestore:', err);
          setErrorMessage('Failed to load profile from Firestore. Please refresh the page.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [currentUser]);

  // Save profile to Firestore
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!currentUser?.uid) {
      setErrorMessage('User session not found. Please log in again.');
      return;
    }

    if (!profile.fullName || profile.fullName.trim().length < 2) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    if (profile.cgpa < 0 || profile.cgpa > 10) {
      setErrorMessage('CGPA must be between 0.00 and 10.00.');
      return;
    }

    if (profile.backlogs < 0) {
      setErrorMessage('Active backlogs cannot be negative.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile: StudentProfile = {
        ...profile,
        uid: currentUser.uid,
        email: currentUser.email || profile.email,
        profileCompletion: completionAudit.percentage,
        updatedAt: new Date().toISOString(),
      };

      await studentService.saveStudentProfile(updatedProfile);
      setProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      console.error('Error saving student profile:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save student profile to Firestore.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Skill management
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (profile.skills.includes(trimmed)) return;
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Project management
  const handleSaveProjectModal = async () => {
    if (!editingProject?.title?.trim()) {
      alert('Project title is required.');
      return;
    }
    if (!currentUser?.uid) return;

    try {
      await studentService.saveProject(
        currentUser.uid,
        {
          title: editingProject.title.trim(),
          description: editingProject.description?.trim() || '',
          technologies: editingProject.technologies || [],
          projectUrl: editingProject.projectUrl?.trim() || '',
          githubUrl: editingProject.githubUrl?.trim() || '',
          role: editingProject.role?.trim() || 'Lead Developer',
          duration: editingProject.duration?.trim() || '3 months',
        },
        editingProject.id
      );

      const refreshed = await studentService.getProjects(currentUser.uid);
      setProjects(refreshed);
      setEditingProject(null);
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save project. Please check your connection.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    if (!currentUser?.uid) return;
    try {
      await studentService.deleteProject(currentUser.uid, id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // Certification management
  const handleSaveCertModal = async () => {
    if (!editingCert?.name?.trim() || !editingCert?.issuingOrganization?.trim()) {
      alert('Certification Name and Issuing Organization are required.');
      return;
    }
    if (!currentUser?.uid) return;

    try {
      await studentService.saveCertification(
        currentUser.uid,
        {
          name: editingCert.name.trim(),
          issuingOrganization: editingCert.issuingOrganization.trim(),
          issueDate: editingCert.issueDate || '2026',
          credentialId: editingCert.credentialId?.trim() || '',
          credentialUrl: editingCert.credentialUrl?.trim() || '',
        },
        editingCert.id
      );

      const refreshed = await studentService.getCertifications(currentUser.uid);
      setCertifications(refreshed);
      setEditingCert(null);
    } catch (err) {
      console.error('Error saving certification:', err);
      alert('Failed to save certification.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    if (!currentUser?.uid) return;
    try {
      await studentService.deleteCertification(currentUser.uid, id);
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting certification:', err);
    }
  };

  // Internship management
  const handleSaveInternshipModal = async () => {
    if (!editingInternship?.company?.trim() || !editingInternship?.role?.trim()) {
      alert('Company Name and Role are required.');
      return;
    }
    if (!currentUser?.uid) return;

    try {
      await studentService.saveInternship(
        currentUser.uid,
        {
          company: editingInternship.company.trim(),
          role: editingInternship.role.trim(),
          startDate: editingInternship.startDate || '',
          endDate: editingInternship.endDate || 'Present',
          description: editingInternship.description?.trim() || '',
          skillsUsed: editingInternship.skillsUsed || [],
        },
        editingInternship.id
      );

      const refreshed = await studentService.getInternships(currentUser.uid);
      setInternships(refreshed);
      setEditingInternship(null);
    } catch (err) {
      console.error('Error saving internship:', err);
      alert('Failed to save internship.');
    }
  };

  const handleDeleteInternship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship record?')) return;
    if (!currentUser?.uid) return;
    try {
      await studentService.deleteInternship(currentUser.uid, id);
      setInternships((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Error deleting internship:', err);
    }
  };

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/60">
                  <User className="h-3 w-3 text-teal-600" />
                  Official Student Profile
                </span>
                <span className="text-[11px] text-slate-400">UID: {currentUser?.uid?.substring(0, 10)}...</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Student Profile
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Keep your placement profile updated for accurate AI insights and job matching.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveProfile()}
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Profile information successfully synced and persisted in Firestore (students/{currentUser?.uid}).</span>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-3 text-xs font-medium text-slate-600">Retrieving student profile from Firestore...</p>
            </div>
          ) : (
            <>
              {/* Profile Completion Bar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      <h3 className="text-sm font-bold text-slate-900">Profile Completion</h3>
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700 border border-teal-200">
                        {completionAudit.percentage}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Calculated dynamically based on verified BPUT academic details, skills, and subcollection records.
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-600">
                    {completionAudit.percentage === 100 ? 'Fully Completed' : `${completionAudit.missingItems.length} items to complete`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionAudit.percentage}%` }}
                  />
                </div>

                {/* Missing Items Guidance */}
                {completionAudit.missingItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      Suggested actions to reach 100% completion:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {completionAudit.missingItems.slice(0, 4).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/60"
                        >
                          + Add {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Layout */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* SECTION A: Personal Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <User className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-bold text-slate-900">A. Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="Aarav Mohapatra"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address <span className="text-[11px] text-slate-400">(Firebase Auth)</span>
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profile.email}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Profile Photo URL
                      </label>
                      <input
                        type="url"
                        value={profile.photoURL || ''}
                        onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION B: Academic Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <GraduationCap className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-bold text-slate-900">B. Academic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        BPUT Registration No. <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.bputRegistrationNumber}
                        onChange={(e) => setProfile({ ...profile, bputRegistrationNumber: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 font-mono focus:border-teal-500 focus:outline-hidden"
                        placeholder="2201106284"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Affiliated College / Institute
                      </label>
                      <input
                        type="text"
                        value={profile.college}
                        onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="BPUT Constituent College, Rourkela"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="Computer Science & Engineering"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={profile.branch}
                        onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="CSE"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Current Semester
                      </label>
                      <select
                        value={profile.semester}
                        onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      >
                        <option value="5th Semester">5th Semester</option>
                        <option value="6th Semester">6th Semester</option>
                        <option value="7th Semester">7th Semester</option>
                        <option value="8th Semester">8th Semester</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        value={profile.graduationYear}
                        onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="2026"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        CGPA (0.00 - 10.00) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={profile.cgpa}
                        onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 font-semibold focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Active Backlogs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profile.backlogs}
                        onChange={(e) => setProfile({ ...profile, backlogs: parseInt(e.target.value, 10) || 0 })}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION C: Skills */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <Code2 className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-bold text-slate-900">C. Technical & Professional Skills</h2>
                  </div>

                  {/* Add skill input */}
                  <div className="flex items-center gap-2 max-w-md mb-4">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                      placeholder="Type a skill (e.g. React, SQL, Java)..."
                      className="flex-1 rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(skillInput)}
                      className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Current Skills Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No skills added yet. Add skills below.</p>
                    ) : (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 border border-slate-200"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick suggestions */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500 mb-2">Recommended Industry Competencies:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.filter((s) => !profile.skills.includes(s)).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-colors cursor-pointer"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION D: Projects */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-teal-600" />
                      <h2 className="text-sm font-bold text-slate-900">
                        D. Projects ({projects.length})
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProject({
                          title: '',
                          description: '',
                          technologies: [],
                          projectUrl: '',
                          githubUrl: '',
                          role: 'Lead Developer',
                          duration: '3 months',
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                      <Code2 className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-xs font-medium text-slate-600">No project records added to Firestore yet.</p>
                      <p className="text-[11px] text-slate-400">Click &quot;Add Project&quot; above to showcase your academic or capstone work.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                              <p className="text-[11px] text-slate-500">
                                {proj.role} • {proj.duration}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingProject(proj)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {proj.description || 'No description provided.'}
                          </p>

                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {proj.technologies.map((t, i) => (
                                <span
                                  key={i}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-3 pt-2 border-t border-slate-100 text-[11px]">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                              >
                                GitHub <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                            {proj.projectUrl && (
                              <a
                                href={proj.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                              >
                                Live Demo <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION E: Certifications */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-teal-600" />
                      <h2 className="text-sm font-bold text-slate-900">
                        E. Certifications ({certifications.length})
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCert({
                          name: '',
                          issuingOrganization: '',
                          issueDate: '2026',
                          credentialId: '',
                          credentialUrl: '',
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Certification</span>
                    </button>
                  </div>

                  {certifications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                      <Award className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-xs font-medium text-slate-600">No professional certifications recorded.</p>
                      <p className="text-[11px] text-slate-400">Add AWS, Google Cloud, Oracle, or Coursera credentials.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                              <p className="text-[11px] text-slate-500">
                                {cert.issuingOrganization} • Issued {cert.issueDate}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingCert(cert)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCert(cert.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {cert.credentialId && (
                            <p className="mt-2 text-[11px] font-mono text-slate-500 truncate">
                              ID: {cert.credentialId}
                            </p>
                          )}

                          {cert.credentialUrl && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px]">
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                              >
                                View Credential <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION F: Internships / Experience */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-teal-600" />
                      <h2 className="text-sm font-bold text-slate-900">
                        F. Internships & Practical Training ({internships.length})
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingInternship({
                          company: '',
                          role: 'Software Development Intern',
                          startDate: 'June 2025',
                          endDate: 'August 2025',
                          description: '',
                          skillsUsed: [],
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Internship</span>
                    </button>
                  </div>

                  {internships.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                      <Building2 className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-xs font-medium text-slate-600">No internship records added.</p>
                      <p className="text-[11px] text-slate-400">Add industry training or summer internship experience.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {internships.map((intern) => (
                        <div key={intern.id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{intern.role}</h4>
                              <p className="text-[11px] font-semibold text-teal-800">
                                {intern.company} ({intern.startDate} - {intern.endDate})
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingInternship(intern)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteInternship(intern.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {intern.description && (
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                              {intern.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION G: Placement Preferences & Career Goal */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <Target className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-bold text-slate-900">G. Placement Preferences & Career Goal</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Target Career Role
                      </label>
                      <select
                        value={profile.careerGoal.targetRole}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            careerGoal: { ...profile.careerGoal, targetRole: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      >
                        {TARGET_ROLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Preferred Job Type
                      </label>
                      <select
                        value={profile.careerGoal.jobType}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            careerGoal: { ...profile.careerGoal, jobType: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      >
                        {JOB_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Preferred Work Mode
                      </label>
                      <select
                        value={profile.careerGoal.workMode}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            careerGoal: { ...profile.careerGoal, workMode: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      >
                        {WORK_MODE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Preferred Locations
                      </label>
                      <input
                        type="text"
                        value={profile.careerGoal.preferredLocation}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            careerGoal: { ...profile.careerGoal, preferredLocation: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="Bhubaneswar, Bengaluru, Hyderabad, Pune, Noida"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Expected Compensation (CTC)
                      </label>
                      <input
                        type="text"
                        value={profile.careerGoal.expectedSalary}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            careerGoal: { ...profile.careerGoal, expectedSalary: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                        placeholder="6-9 LPA"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION H: Placement Readiness Diagnostic Inputs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      H. Placement Readiness Inputs (0-100 Scale)
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-5">
                    Self-assessment diagnostic scores. Note: The final automated AI Readiness benchmark will be calculated
                    separately inside the AI Readiness module without modifying these baseline inputs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-slate-700">Aptitude Score</span>
                        <span className="font-bold text-teal-700">{profile.readinessInputs.aptitudeScore} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profile.readinessInputs.aptitudeScore}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            readinessInputs: {
                              ...profile.readinessInputs,
                              aptitudeScore: parseInt(e.target.value, 10),
                            },
                          })
                        }
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-slate-700">Technical Score</span>
                        <span className="font-bold text-teal-700">{profile.readinessInputs.technicalScore} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profile.readinessInputs.technicalScore}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            readinessInputs: {
                              ...profile.readinessInputs,
                              technicalScore: parseInt(e.target.value, 10),
                            },
                          })
                        }
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-slate-700">Communication Score</span>
                        <span className="font-bold text-teal-700">{profile.readinessInputs.communicationScore} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profile.readinessInputs.communicationScore}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            readinessInputs: {
                              ...profile.readinessInputs,
                              communicationScore: parseInt(e.target.value, 10),
                            },
                          })
                        }
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Submit Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500">
                    All updates are securely synced with Firestore path <strong className="font-mono text-slate-700">students/{currentUser?.uid}</strong>.
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Student Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* PROJECT MODAL */}
          {editingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingProject.id ? 'Edit Project' : 'Add Project Showcase'}
                  </h3>
                  <button
                    onClick={() => setEditingProject(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Project Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingProject.title || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="e.g., Campus Placement Intelligence System"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Your Role</label>
                      <input
                        type="text"
                        value={editingProject.role || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                        placeholder="Lead Full-Stack Developer"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={editingProject.duration || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                        placeholder="3 Months"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Technologies Used (comma separated)
                    </label>
                    <input
                      type="text"
                      value={(editingProject.technologies || []).join(', ')}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          technologies: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="React, Next.js, Firebase, TypeScript, Tailwind"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">GitHub Repo URL</label>
                      <input
                        type="url"
                        value={editingProject.githubUrl || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Live Demo URL</label>
                      <input
                        type="url"
                        value={editingProject.projectUrl || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, projectUrl: e.target.value })}
                        placeholder="https://app.com"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editingProject.description || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      placeholder="Describe the problem solved, architecture, and impact..."
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProjectModal}
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATION MODAL */}
          {editingCert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCert.id ? 'Edit Certification' : 'Add Certification'}
                  </h3>
                  <button onClick={() => setEditingCert(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Certification Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCert.name || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, name: e.target.value })}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Issuing Organization <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCert.issuingOrganization || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, issuingOrganization: e.target.value })}
                      placeholder="Amazon Web Services / Google / Oracle"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Issue Date</label>
                      <input
                        type="text"
                        value={editingCert.issueDate || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                        placeholder="Oct 2025"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Credential ID</label>
                      <input
                        type="text"
                        value={editingCert.credentialId || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                        placeholder="AWS-8899221"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Verification URL</label>
                    <input
                      type="url"
                      value={editingCert.credentialUrl || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, credentialUrl: e.target.value })}
                      placeholder="https://www.credly.com/..."
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingCert(null)}
                    className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCertModal}
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
                  >
                    Save Certification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INTERNSHIP MODAL */}
          {editingInternship && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingInternship.id ? 'Edit Internship' : 'Add Internship Experience'}
                  </h3>
                  <button onClick={() => setEditingInternship(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingInternship.company || ''}
                      onChange={(e) => setEditingInternship({ ...editingInternship, company: e.target.value })}
                      placeholder="e.g. Tata Consultancy Services"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Role / Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingInternship.role || ''}
                      onChange={(e) => setEditingInternship({ ...editingInternship, role: e.target.value })}
                      placeholder="Software Development Intern"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={editingInternship.startDate || ''}
                        onChange={(e) => setEditingInternship({ ...editingInternship, startDate: e.target.value })}
                        placeholder="June 2025"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                      <input
                        type="text"
                        value={editingInternship.endDate || ''}
                        onChange={(e) => setEditingInternship({ ...editingInternship, endDate: e.target.value })}
                        placeholder="August 2025"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Key Responsibilities / Impact</label>
                    <textarea
                      rows={3}
                      value={editingInternship.description || ''}
                      onChange={(e) => setEditingInternship({ ...editingInternship, description: e.target.value })}
                      placeholder="Developed backend microservices, optimized database queries..."
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingInternship(null)}
                    className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInternshipModal}
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
                  >
                    Save Internship
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
