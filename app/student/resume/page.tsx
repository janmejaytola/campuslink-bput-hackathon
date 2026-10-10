'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Plus,
  X,
  FileCheck2,
  Loader2,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  User,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { useAuth } from '@/context/AuthContext';
import {
  ResumeRecord,
  ExtractedResumeData,
} from '@/types/resume';
import { resumeService } from '@/lib/services/resumeService';
import { studentService } from '@/lib/services/studentService';
import {
  MAX_RESUME_SIZE_BYTES,
  validateResumeFileMeta,
  mapExtractedResumeToProfileUpdates,
} from '@/lib/services/resumeExtractionUtils';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

function formatUserFacingError(err: unknown, fallbackMessage: string): string {
  if (!(err instanceof Error)) return fallbackMessage;
  const msg = err.message || fallbackMessage;
  // Parse structured FirestoreErrorInfo JSON if thrown by formatFirestoreError
  if (msg.startsWith('{') && msg.endsWith('}')) {
    try {
      const parsed = JSON.parse(msg);
      if (parsed && typeof parsed.error === 'string') {
        return `Database permission/write error (${parsed.operationType || 'write'} on ${parsed.path || 'Firestore'}): ${parsed.error}`;
      }
    } catch {
      // fall through
    }
  }
  return msg;
}

export default function ResumePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);

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
        if (latest.extractedData && latest.extractionStatus === 'completed') {
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
          if (latest.extractedData && latest.extractionStatus === 'completed') {
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
    const check = validateResumeFileMeta(file.name, file.type, file.size);
    if (!check.valid) {
      return check.error || 'Please upload a valid PDF or DOCX file under 5 MB.';
    }
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt && !check.isPdf && !check.isDocx) {
      return 'Please upload a PDF (.pdf) or Word (.docx) file.';
    }
    if (file.size > MAX_RESUME_SIZE_BYTES) {
      return `Resume must be smaller than 5 MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
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
    if (isProcessing) return;
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
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Upload and Extract Handler (with duplicate submission guard)
  const handleUploadAndExtract = async () => {
    if (isSubmittingRef.current || isProcessing) {
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select a PDF or DOCX resume to upload.');
      return;
    }
    if (!currentUser?.uid) {
      setErrorMessage('User session not found. Please log in again.');
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fileToProcess = selectedFile;

    try {
      // 1. Upload to Firebase Storage
      setProcessingStep('Uploading resume file to Firebase Storage...');
      let storagePath = '';
      let downloadURL = '';

      try {
        const uploadRes = await resumeService.uploadFileToStorage(
          currentUser.uid,
          fileToProcess,
          (pct) => setUploadProgress(pct)
        );
        storagePath = uploadRes.storagePath;
        downloadURL = uploadRes.downloadURL;
      } catch (storageErr) {
        console.warn('[Storage upload warning - proceeding with text extraction]:', storageErr);
        storagePath = `resumes/${currentUser.uid}/${fileToProcess.name}`;
      }

      // 2. Save initial metadata in Firestore
      setProcessingStep('Initializing resume record in Firestore...');
      const initialRecord: ResumeRecord = {
        id: resumeId,
        uid: currentUser.uid,
        fileName: fileToProcess.name,
        fileType:
          fileToProcess.type ||
          (fileToProcess.name.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        fileSize: fileToProcess.size,
        storagePath,
        downloadURL,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extractionStatus: 'processing',
        syncStatus: 'not_synced',
      };
      await resumeService.saveResumeRecord(initialRecord);

      // 3. Prepare file for AI Extraction
      setProcessingStep('Extracting readable text from document...');
      const base64Data = await fileToBase64(fileToProcess);

      // 4. Send to server-side Gemini 3.8 Flash API route
      setProcessingStep('Gemini 3.8 Flash is extracting structured resume fields...');
      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileType: fileToProcess.type,
          fileName: fileToProcess.name,
        }),
      });

      let responseJson: { success?: boolean; data?: ExtractedResumeData; error?: string };
      try {
        responseJson = await res.json();
      } catch {
        throw new Error(`Resume extraction API returned an invalid response (HTTP ${res.status}).`);
      }

      if (!res.ok || !responseJson.success || !responseJson.data) {
        throw new Error(
          responseJson.error || 'Failed to extract structured information from resume.'
        );
      }

      const extracted: ExtractedResumeData = responseJson.data;

      // 5. Update Firestore with extraction results
      setProcessingStep('Persisting verified extraction results in Firestore...');
      const completedRecord: ResumeRecord = {
        ...initialRecord,
        extractionStatus: 'completed',
        extractedData: extracted,
        errorMessage: null,
        updatedAt: new Date().toISOString(),
      };
      await resumeService.saveResumeRecord(completedRecord);

      setActiveResumeRecord(completedRecord);
      setExtractedData(extracted);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setSuccessMessage(
        'AI Extraction Complete! Review the extracted details below before syncing to your profile.'
      );
      await loadHistory();
    } catch (err: unknown) {
      console.error('[Resume Processing Error]:', err);
      const msg = formatUserFacingError(
        err,
        'Upload and extraction failed. Please check the file and try again.'
      );
      setErrorMessage(msg);

      // Record failure state in Firestore if possible
      try {
        await resumeService.saveResumeRecord({
          id: resumeId,
          uid: currentUser.uid,
          fileName: fileToProcess.name,
          fileType: fileToProcess.type || 'application/pdf',
          fileSize: fileToProcess.size,
          storagePath: `resumes/${currentUser.uid}/${fileToProcess.name}`,
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
      isSubmittingRef.current = false;
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Reprocess existing resume
  const handleReprocess = async (record: ResumeRecord) => {
    if (!currentUser?.uid || isSubmittingRef.current || isProcessing) return;

    isSubmittingRef.current = true;
    setIsProcessing(true);
    setProcessingStep('Re-running Gemini 3.8 Flash extraction on uploaded resume...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!record.downloadURL) {
        throw new Error(
          'Original file binary is not stored in cloud storage for this record. Please re-select the file above and click "Upload & Extract with AI".'
        );
      }

      const fileRes = await fetch(record.downloadURL);
      if (!fileRes.ok) {
        throw new Error(`Could not download original resume file (HTTP ${fileRes.status}).`);
      }
      const blob = await fileRes.blob();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(((reader.result as string) || '').split(',')[1] || '');
        reader.onerror = (err) => reject(err);
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
      if (!res.ok || !responseJson.success || !responseJson.data) {
        throw new Error(responseJson.error || 'Failed to reprocess resume.');
      }

      const extracted: ExtractedResumeData = responseJson.data;

      await resumeService.updateResumeRecord(currentUser.uid, record.id, {
        extractionStatus: 'completed',
        extractedData: extracted,
        errorMessage: null,
      });

      setExtractedData(extracted);
      setActiveResumeRecord({
        ...record,
        extractedData: extracted,
        extractionStatus: 'completed',
        errorMessage: null,
      });
      setSuccessMessage('Resume reprocessed successfully. Review the refreshed extraction below.');
      await loadHistory();
    } catch (err: unknown) {
      console.error('[Reprocess Error]:', err);
      setErrorMessage(formatUserFacingError(err, 'Failed to reprocess resume.'));
    } finally {
      isSubmittingRef.current = false;
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Delete resume
  const handleDeleteResume = async (record: ResumeRecord) => {
    if (!currentUser?.uid) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await resumeService.deleteResume(currentUser.uid, record.id, record.storagePath);
      setResumeHistory((prev) => prev.filter((r) => r.id !== record.id));
      if (activeResumeRecord?.id === record.id) {
        setActiveResumeRecord(null);
        setExtractedData(null);
      }
      setSuccessMessage(`Resume "${record.fileName}" deleted from your vault.`);
    } catch (err) {
      console.error('[Delete Resume Error]:', err);
      setErrorMessage(formatUserFacingError(err, 'Failed to delete resume file.'));
    }
  };

  // Approve & Save to Student Profile (with duplicate submission & deduplication guard)
  const handleApproveAndSave = async () => {
    if (!currentUser?.uid || !extractedData || isSavingRef.current || isSavingToProfile) return;

    isSavingRef.current = true;
    setIsSavingToProfile(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Fetch current student profile and existing subcollections
      const [currentProfile, existingProjects, existingCerts, existingInterns] =
        await Promise.all([
          studentService.getStudentProfile(currentUser.uid),
          studentService.getProjects(currentUser.uid),
          studentService.getCertifications(currentUser.uid),
          studentService.getInternships(currentUser.uid),
        ]);

      // 2. Deterministically map extracted fields onto profile & subcollections without inventing or duplicating
      const {
        updatedProfile,
        projectsToSave,
        certificationsToSave,
        internshipsToSave,
      } = mapExtractedResumeToProfileUpdates(
        currentUser.uid,
        extractedData,
        currentProfile,
        existingProjects,
        existingCerts,
        existingInterns,
        {
          name: currentUser.name || currentUser.displayName,
          email: currentUser.email,
          phone: currentUser.phone,
          photoURL: currentUser.photoURL,
          regNumber: currentUser.regNumber,
          institution: currentUser.institution,
          department: currentUser.department,
        }
      );

      // 3. Save main profile to Firestore students/{uid}
      await studentService.saveStudentProfile(updatedProfile);

      // 4. Save new non-duplicate projects to subcollection students/{uid}/projects
      for (const proj of projectsToSave) {
        await studentService.saveProject(currentUser.uid, proj);
      }

      // 5. Save new non-duplicate certifications to subcollection students/{uid}/certifications
      for (const cert of certificationsToSave) {
        await studentService.saveCertification(currentUser.uid, cert);
      }

      // 6. Save new non-duplicate internships/experience to subcollection students/{uid}/internships
      for (const intern of internshipsToSave) {
        await studentService.saveInternship(currentUser.uid, intern);
      }

      // 7. Mark resume as synced in Firestore
      if (activeResumeRecord) {
        await resumeService.updateResumeRecord(currentUser.uid, activeResumeRecord.id, {
          syncStatus: 'synced',
          extractedData,
        });
        setActiveResumeRecord((prev) =>
          prev ? { ...prev, syncStatus: 'synced', extractedData } : prev
        );
      }

      setSuccessMessage(
        'Resume data successfully merged and synchronized into your Student Profile and subcollections!'
      );
      await loadHistory();
    } catch (err) {
      console.error('[Error saving to profile]:', err);
      setErrorMessage(
        formatUserFacingError(
          err,
          'Failed to sync extracted data into Student Profile. Please try again.'
        )
      );
    } finally {
      isSavingRef.current = false;
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

  // Experience removal
  const handleRemoveExperience = (index: number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      experience: extractedData.experience.filter((_, i) => i !== index),
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
                Upload your resume (PDF or DOCX) and let CAMPUSLINK extract structured career information automatically.
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
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 flex items-start justify-between gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="flex-1">{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
                aria-label="Dismiss message"
              >
                <X className="h-3.5 w-3.5" />
              </button>
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

              <div className={`flex items-center gap-1.5 ${isProcessing ? 'text-teal-700 font-bold animate-pulse' : activeResumeRecord?.extractionStatus === 'completed' ? 'text-teal-700' : 'text-slate-400'}`}>
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
                  disabled={isProcessing}
                  className="hidden"
                  id="resume-file-input"
                />

                <label
                  htmlFor="resume-file-input"
                  className={`cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors ${
                    isProcessing ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Browse Files</span>
                </label>

                {selectedFile && !isProcessing && (
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
                    {selectedFile.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
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
            {isProcessing && (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>{processingStep || 'Processing resume...'}</span>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <span className="font-bold">{uploadProgress}%</span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress > 0 ? uploadProgress : 45}%` }}
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
                      Extracted via Gemini 3.8 Flash
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Review, edit, or remove extracted items below before saving them to your Student Profile.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApproveAndSave}
                    disabled={isSavingToProfile || isProcessing}
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
                              {edu.cgpa !== null && edu.cgpa !== undefined && (
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

              {/* Certifications & Internships / Experience */}
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
                              {cert.issuingOrganization || 'Issuing Organization'} {cert.issueDate ? `• ${cert.issueDate}` : ''}
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

                {/* Internships & Experience */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-teal-600" />
                      Extracted Internships & Experience (
                      {(extractedData.internships?.length || 0) + (extractedData.experience?.length || 0)})
                    </h4>
                  </div>

                  {(extractedData.internships?.length || 0) === 0 &&
                  (extractedData.experience?.length || 0) === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No internship or work experience explicitly detected.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {extractedData.internships.map((intern, idx) => (
                        <div key={`intern-${idx}`} className="rounded-xl border border-slate-200 p-3 bg-slate-50/40 flex items-start justify-between gap-2">
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

                      {(extractedData.experience || []).map((exp, idx) => (
                        <div key={`exp-${idx}`} className="rounded-xl border border-slate-200 p-3 bg-slate-50/40 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{exp.role}</p>
                            <p className="text-[11px] font-semibold text-teal-800">
                              {exp.company} {exp.startDate ? `(${exp.startDate} - ${exp.endDate || 'Present'})` : ''}
                            </p>
                            {exp.description && (
                              <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                                {exp.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(idx)}
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
                  Clicking <strong>Review & Save to Profile</strong> merges non-duplicate skills, projects, certifications, and internships into your permanent Firestore profile dossier.
                </div>

                <button
                  type="button"
                  onClick={handleApproveAndSave}
                  disabled={isSavingToProfile || isProcessing}
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
                        {item.fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.fileName}</h4>
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>Uploaded {item.uploadedAt ? item.uploadedAt.split('T')[0] : 'Recently'}</span>
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
                        {item.extractionStatus === 'failed' && item.errorMessage && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            Reason: {item.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.extractedData && item.extractionStatus === 'completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveResumeRecord(item);
                            setExtractedData(item.extractedData || null);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span>Load Review</span>
                        </button>
                      )}

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
                        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer disabled:opacity-50"
                        title="Re-run AI extraction on this resume"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Reprocess</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteResume(item)}
                        disabled={isProcessing}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer disabled:opacity-50"
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
