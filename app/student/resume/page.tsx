'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Plus,
  X,
  FileCheck2,
  ArrowRight,
  Loader2,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  User,
  Info,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  ResumeRecord,
  ExtractedResumeData,
  ExtractedProject,
  ExtractedCertification,
  ExtractedInternship,
  ExtractedEducation,
} from '@/types/resume';
import { resumeService } from '@/lib/services/resumeService';
import { studentService } from '@/lib/services/studentService';
import { StudentProfile } from '@/types/student';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

export default function ResumePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [resumeHistory, setResumeHistory] = useState<ResumeRecord[]>([]);
  const [activeResumeRecord, setActiveResumeRecord] = useState<ResumeRecord | null>(null);

  // Extracted data for review
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSavingToProfile, setIsSavingToProfile] = useState<boolean>(false);

  // Load resume history
  const loadHistory = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const records = await resumeService.getResumeRecords(currentUser.uid);
      setResumeHistory(records);
      if (records.length > 0) {
        const latest = records[0];
        setActiveResumeRecord((prev) => prev || latest);
        if (latest.extractedData) {
          setExtractedData((prev) => prev || latest.extractedData || null);
        }
      }
    } catch (err) {
      console.error('[Error loading resume history]:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser?.uid) return;
      try {
        const records = await resumeService.getResumeRecords(currentUser.uid);
        if (!active) return;
        setResumeHistory(records);
        if (records.length > 0) {
          const latest = records[0];
          setActiveResumeRecord((prev) => prev || latest);
          if (latest.extractedData) {
            setExtractedData((prev) => prev || latest.extractedData || null);
          }
        }
      } catch (err) {
        if (active) console.error('[Error loading resume history]:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Validation function
  const validateFile = (file: File): string | null => {
    if (file.size === 0) {
      return 'The selected file is empty. Please upload a valid resume document.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Resume must be smaller than 5 MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
    }

    const lowerName = file.name.toLowerCase();
    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword';

    if (!hasValidExt && !hasValidMime) {
      return 'Please upload a PDF or DOCX file.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // strip data url prefix
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Upload and Extract Handler
  const handleUploadAndExtract = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a PDF or DOCX resume to upload.');
      return;
    }
    if (!currentUser?.uid) {
      setErrorMessage('User session not found. Please log in again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      // 1. Upload to Firebase Storage
      setProcessingStep('Uploading resume file to Firebase Storage...');
      let storagePath = '';
      let downloadURL = '';

      try {
        const uploadRes = await resumeService.uploadFileToStorage(
          currentUser.uid,
          selectedFile,
          (pct) => setUploadProgress(pct)
        );
        storagePath = uploadRes.storagePath;
        downloadURL = uploadRes.downloadURL;
      } catch (storageErr) {
        console.warn('[Storage upload warning - proceeding with text extraction]:', storageErr);
        storagePath = `resumes/${currentUser.uid}/${selectedFile.name}`;
      }

      // 2. Save initial metadata in Firestore
      setProcessingStep('Initializing resume record in Firestore...');
      const initialRecord: ResumeRecord = {
        id: resumeId,
        uid: currentUser.uid,
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/pdf',
        fileSize: selectedFile.size,
        storagePath,
        downloadURL,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extractionStatus: 'processing',
        syncStatus: 'not_synced',
      };
      await resumeService.saveResumeRecord(initialRecord);

      // 3. Prepare file for AI Extraction
      setProcessingStep('Extracting document contents...');
      const base64Data = await fileToBase64(selectedFile);

      // 4. Send to server-side Gemini API route
      setProcessingStep('AI Career Assistant is analyzing resume structure...');
      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileType: selectedFile.type,
          fileName: selectedFile.name,
        }),
      });

      const responseJson = await res.json();

      if (!res.ok || !responseJson.success) {
        throw new Error(responseJson.error || 'Failed to extract structured information from resume.');
      }

      const extracted: ExtractedResumeData = responseJson.data;

      // 5. Update Firestore with extraction results
      setProcessingStep('Persisting extraction results in Firestore...');
      const completedRecord: ResumeRecord = {
        ...initialRecord,
        extractionStatus: 'completed',
        extractedData: extracted,
        updatedAt: new Date().toISOString(),
      };
      await resumeService.saveResumeRecord(completedRecord);

      setActiveResumeRecord(completedRecord);
      setExtractedData(extracted);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setSuccessMessage('AI Extraction Complete! Review extracted details below before syncing to your profile.');
      await loadHistory();
    } catch (err: unknown) {
      console.error('[Resume Processing Error]:', err);
      const msg = err instanceof Error ? err.message : 'Upload and extraction failed. Please try again.';
      setErrorMessage(msg);

      // Record failure in Firestore
      try {
        await resumeService.saveResumeRecord({
          id: resumeId,
          uid: currentUser.uid,
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'application/pdf',
          fileSize: selectedFile.size,
          storagePath: `resumes/${currentUser.uid}/${selectedFile.name}`,
          downloadURL: '',
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          extractionStatus: 'failed',
          errorMessage: msg,
        });
        await loadHistory();
      } catch (logErr) {
        console.error('[Error saving failure state]:', logErr);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Reprocess existing resume
  const handleReprocess = async (record: ResumeRecord) => {
    if (!currentUser?.uid) return;
    setIsProcessing(true);
    setProcessingStep('Re-running AI analysis on uploaded resume...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // If we don't have the original local file, prompt user or use download URL
      if (!record.downloadURL) {
        throw new Error('Original file binary not directly accessible. Please upload the file again to reprocess.');
      }

      const fileRes = await fetch(record.downloadURL);
      const blob = await fileRes.blob();
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileType: record.fileType,
          fileName: record.fileName,
        }),
      });

      const responseJson = await res.json();
      if (!res.ok || !responseJson.success) {
        throw new Error(responseJson.error || 'Failed to reprocess resume.');
      }

      const extracted: ExtractedResumeData = responseJson.data;

      await resumeService.updateResumeRecord(currentUser.uid, record.id, {
        extractionStatus: 'completed',
        extractedData: extracted,
      });

      setExtractedData(extracted);
      setActiveResumeRecord({ ...record, extractedData: extracted, extractionStatus: 'completed' });
      setSuccessMessage('Resume reprocessed successfully. Review the refreshed extraction below.');
      await loadHistory();
    } catch (err: unknown) {
      console.error('[Reprocess Error]:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reprocess resume.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Delete resume
  const handleDeleteResume = async (record: ResumeRecord) => {
    if (!confirm(`Are you sure you want to delete "${record.fileName}"? This will not delete information already saved in your Student Profile.`)) {
      return;
    }
    if (!currentUser?.uid) return;

    try {
      await resumeService.deleteResume(currentUser.uid, record.id, record.storagePath);
      setResumeHistory((prev) => prev.filter((r) => r.id !== record.id));
      if (activeResumeRecord?.id === record.id) {
        setActiveResumeRecord(null);
        setExtractedData(null);
      }
      setSuccessMessage(`Resume "${record.fileName}" deleted.`);
    } catch (err) {
      console.error('[Delete Resume Error]:', err);
      setErrorMessage('Failed to delete resume file.');
    }
  };

  // Approve & Save to Student Profile
  const handleApproveAndSave = async () => {
    if (!currentUser?.uid || !extractedData) return;

    setIsSavingToProfile(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Fetch current student profile
      const currentProfile = await studentService.getStudentProfile(currentUser.uid);

      // 2. Merge skills safely without duplicates
      const existingSkills = currentProfile?.skills || [];
      const newSkills = extractedData.skills || [];
      const mergedSkills = Array.from(new Set([...existingSkills, ...newSkills]));

      // 3. Prepare updated profile fields (fill in missing data without overwriting verified fields)
      const updatedProfile: StudentProfile = {
        uid: currentUser.uid,
        fullName: currentProfile?.fullName || extractedData.fullName || currentUser.name || '',
        email: currentUser.email || currentProfile?.email || extractedData.email || '',
        phone: currentProfile?.phone || extractedData.phone || '',
        dateOfBirth: currentProfile?.dateOfBirth || '',
        gender: currentProfile?.gender || 'Male',
        photoURL: currentProfile?.photoURL || currentUser.photoURL || '',
        bputRegistrationNumber: currentProfile?.bputRegistrationNumber || currentUser.regNumber || '',
        college: currentProfile?.college || currentUser.institution || 'BPUT Affiliated Institute',
        department: currentProfile?.department || currentUser.department || 'Computer Science & Engineering',
        branch: currentProfile?.branch || 'Computer Science & Engineering',
        semester: currentProfile?.semester || '7th Semester',
        graduationYear: currentProfile?.graduationYear || extractedData.education?.[0]?.graduationYear || '2026',
        cgpa: currentProfile?.cgpa ?? (typeof extractedData.education?.[0]?.cgpa === 'number' ? extractedData.education[0].cgpa : 8.0),
        backlogs: currentProfile?.backlogs ?? 0,
        skills: mergedSkills,
        careerGoal: currentProfile?.careerGoal || {
          targetRole: extractedData.careerKeywords?.[0] || 'Software Engineer',
          jobType: 'Full-time',
          preferredLocation: 'Bhubaneswar, Bengaluru, Hyderabad',
          workMode: 'Hybrid',
          expectedSalary: '6-9 LPA',
        },
        readinessInputs: currentProfile?.readinessInputs || {
          aptitudeScore: 75,
          technicalScore: 80,
          communicationScore: 78,
        },
        profileCompletion: currentProfile?.profileCompletion || 60,
        createdAt: currentProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 4. Save main profile to Firestore students/{uid}
      await studentService.saveStudentProfile(updatedProfile);

      // 5. Save projects to subcollection students/{uid}/projects
      if (extractedData.projects && extractedData.projects.length > 0) {
        for (const proj of extractedData.projects) {
          if (proj.title?.trim()) {
            await studentService.saveProject(currentUser.uid, {
              title: proj.title,
              description: proj.description || '',
              technologies: proj.technologies || [],
              projectUrl: proj.projectUrl || '',
              githubUrl: proj.githubUrl || '',
              role: 'Developer',
              duration: 'Project',
            });
          }
        }
      }

      // 6. Save certifications to subcollection students/{uid}/certifications
      if (extractedData.certifications && extractedData.certifications.length > 0) {
        for (const cert of extractedData.certifications) {
          if (cert.name?.trim()) {
            await studentService.saveCertification(currentUser.uid, {
              name: cert.name,
              issuingOrganization: cert.issuingOrganization || 'Professional Authority',
              issueDate: cert.issueDate || '2025',
              credentialId: cert.credentialId || '',
              credentialUrl: cert.credentialUrl || '',
            });
          }
        }
      }

      // 7. Save internships to subcollection students/{uid}/internships
      if (extractedData.internships && extractedData.internships.length > 0) {
        for (const intern of extractedData.internships) {
          if (intern.company?.trim()) {
            await studentService.saveInternship(currentUser.uid, {
              company: intern.company,
              role: intern.role || 'Intern',
              startDate: intern.startDate || '2025',
              endDate: intern.endDate || '2025',
              description: intern.description || '',
              skillsUsed: intern.skills || [],
            });
          }
        }
      }

      // 8. Mark resume as synced
      if (activeResumeRecord) {
        await resumeService.updateResumeRecord(currentUser.uid, activeResumeRecord.id, {
          syncStatus: 'synced',
        });
      }

      setSuccessMessage(
        'Resume data successfully merged and synchronized into your Student Profile and subcollections!'
      );
      await loadHistory();
    } catch (err) {
      console.error('[Error saving to profile]:', err);
      setErrorMessage('Failed to sync extracted data into Student Profile. Please try again.');
    } finally {
      setIsSavingToProfile(false);
    }
  };

  // Skill editing handlers
  const handleRemoveSkill = (skillToRemove: string) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      skills: extractedData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleAddSkill = () => {
    if (!extractedData || !newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!extractedData.skills.includes(trimmed)) {
      setExtractedData({
        ...extractedData,
        skills: [...extractedData.skills, trimmed],
      });
    }
    setNewSkillInput('');
  };

  // Project removal
  const handleRemoveProject = (index: number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      projects: extractedData.projects.filter((_, i) => i !== index),
    });
  };

  // Certification removal
  const handleRemoveCert = (index: number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      certifications: extractedData.certifications.filter((_, i) => i !== index),
    });
  };

  // Internship removal
  const handleRemoveInternship = (index: number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      internships: extractedData.internships.filter((_, i) => i !== index),
    });
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
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  Resume Analysis
                </span>
                <span className="text-[11px] font-medium text-slate-500">Document Parsing & Profile Sync</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                Resume & AI Extraction
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Upload your resume and let CAMPUSLINK extract structured career information automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/student/profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <span>View My Profile</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="flex-1">{successMessage}</span>
            </div>
          )}

          {/* Status pipeline indicator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 max-w-3xl mx-auto">
              <div className="flex items-center gap-1.5 text-teal-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">1</span>
                <span>Upload PDF/DOCX</span>
              </div>
              <span className="text-slate-300">→</span>

              <div className={`flex items-center gap-1.5 ${isProcessing ? 'text-teal-700 font-bold animate-pulse' : activeResumeRecord ? 'text-teal-700' : 'text-slate-400'}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">2</span>
                <span>AI Extraction</span>
              </div>
              <span className="text-slate-300">→</span>

              <div className={`flex items-center gap-1.5 ${extractedData ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">3</span>
                <span>Student Review</span>
              </div>
              <span className="text-slate-300">→</span>

              <div className={`flex items-center gap-1.5 ${activeResumeRecord?.syncStatus === 'synced' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">4</span>
                <span>Profile Sync</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: UPLOAD CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-teal-600" />
                Resume Document Upload
              </h2>
              <span className="text-[11px] font-medium text-slate-500">PDF or DOCX • Max 5 MB</span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                selectedFile
                  ? 'border-teal-400 bg-teal-50/30'
                  : 'border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-slate-50'
              }`}
            >
              <FileText className="mx-auto h-10 w-10 text-teal-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : 'Drop your resume here'}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction`
                  : 'or click Browse Files to select from your device'}
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-file-input"
                />

                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Browse Files</span>
                </label>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 px-2 py-1 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Bar for Selected File */}
            {selectedFile && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                    {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'DOC'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUploadAndExtract}
                  disabled={isProcessing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{processingStep || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Upload & Extract with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Upload progress indicator */}
            {isProcessing && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Uploading to Firebase Storage...</span>
                  <span className="font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: EXTRACTION REVIEW SCREEN */}
          {extractedData && (
            <div className="space-y-6">
              {/* Review Banner */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">AI Extraction Complete</h3>
                    <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                      Extracted from resume
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    AI-generated extraction — please review, edit, or delete items below before saving to your profile.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApproveAndSave}
                    disabled={isSavingToProfile}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingToProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Syncing with Profile...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="h-4 w-4" />
                        <span>Review & Save to Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Extracted Details Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal & Academic Overview */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-teal-600" />
                      Extracted Personal Details
                    </h4>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Extracted from resume
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500">Full Name:</span>{' '}
                      <strong className="text-slate-800">{extractedData.fullName || 'Not detected'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span>{' '}
                      <span className="text-slate-800 font-mono">{extractedData.email || 'Not detected'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Phone:</span>{' '}
                      <span className="text-slate-800">{extractedData.phone || 'Not detected'}</span>
                    </div>
                  </div>

                  {extractedData.education && extractedData.education.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                        Education
                      </h5>
                      <div className="space-y-2">
                        {extractedData.education.map((edu, idx) => (
                          <div key={idx} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 text-xs">
                            <p className="font-semibold text-slate-900">{edu.institution || 'University / College'}</p>
                            <p className="text-[11px] text-slate-600">
                              {edu.degree || ''} {edu.branch ? `• ${edu.branch}` : ''}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                              {edu.graduationYear && <span>Year: {edu.graduationYear}</span>}
                              {edu.cgpa !== null && (
                                <span className="font-semibold text-teal-700">CGPA: {edu.cgpa}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Extracted Skills */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-teal-600" />
                      Extracted Skills ({extractedData.skills.length})
                    </h4>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Review & filter
                    </span>
                  </div>

                  {/* Add skill input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add an additional skill..."
                      className="flex-1 rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {extractedData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 border border-slate-200"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          aria-label={`Remove skill ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {extractedData.careerKeywords && extractedData.careerKeywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500 mb-1.5">Detected Career Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {extractedData.careerKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded bg-teal-50 text-teal-800 px-2 py-0.5 text-[10px] font-medium border border-teal-200/60"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects Extracted */}
              {extractedData.projects && extractedData.projects.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-teal-600" />
                      Extracted Projects ({extractedData.projects.length})
                    </h4>
                    <span className="text-[10px] text-slate-500">Will be saved to subcollection students/{currentUser?.uid}/projects</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {extractedData.projects.map((proj, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3.5 relative bg-slate-50/40">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{proj.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                            title="Remove project from approval"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {proj.description && (
                          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                            {proj.description}
                          </p>
                        )}

                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {proj.technologies.map((t, i) => (
                              <span key={i} className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Internships */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certifications */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-teal-600" />
                      Extracted Certifications ({extractedData.certifications.length})
                    </h4>
                  </div>

                  {extractedData.certifications.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No certifications explicitly detected in resume.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {extractedData.certifications.map((cert, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-2 bg-slate-50/40">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{cert.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {cert.issuingOrganization || 'Verified Issuer'} {cert.issueDate ? `• ${cert.issueDate}` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCert(idx)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Internships */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-teal-600" />
                      Extracted Internships & Training ({extractedData.internships.length})
                    </h4>
                  </div>

                  {extractedData.internships.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No internship experience explicitly detected.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {extractedData.internships.map((intern, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 p-3 bg-slate-50/40 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{intern.role}</p>
                            <p className="text-[11px] font-semibold text-teal-800">
                              {intern.company} {intern.startDate ? `(${intern.startDate} - ${intern.endDate || 'Present'})` : ''}
                            </p>
                            {intern.description && (
                              <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                                {intern.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveInternship(idx)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sync Action Bar */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Clicking <strong>Review & Save to Profile</strong> merges non-duplicate skills, projects, and certifications into your permanent Firestore profile dossier.
                </div>

                <button
                  type="button"
                  onClick={handleApproveAndSave}
                  disabled={isSavingToProfile}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingToProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Syncing with Profile...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4" />
                      <span>Review & Save to Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: RESUME VAULT & HISTORY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                Resume Vault ({resumeHistory.length})
              </h3>
              <span className="text-[11px] text-slate-500">Maintained in resumes/{currentUser?.uid}/files</span>
            </div>

            {resumeHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-medium text-slate-600">No resumes uploaded yet.</p>
                <p className="text-[11px] text-slate-400">Upload your PDF or DOCX resume using the upload box above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumeHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-bold text-xs">
                        {item.fileName.endsWith('.pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.fileName}</h4>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>Uploaded {new Date(item.uploadedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span
                            className={`font-semibold ${
                              item.extractionStatus === 'completed'
                                ? 'text-teal-700'
                                : item.extractionStatus === 'processing'
                                ? 'text-blue-600'
                                : 'text-rose-600'
                            }`}
                          >
                            Status: {item.extractionStatus}
                          </span>
                          {item.syncStatus === 'synced' && (
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                              Synced with Profile
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.downloadURL && (
                        <a
                          href={item.downloadURL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReprocess(item)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                        title="Re-run AI extraction on this resume"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Reprocess</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteResume(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete resume from vault"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
