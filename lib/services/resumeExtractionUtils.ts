import mammoth from 'mammoth';
import { extractText } from 'unpdf';
import {
  ExtractedResumeData,
  ExtractedEducation,
  ExtractedProject,
  ExtractedCertification,
  ExtractedInternship,
  ExtractedExperience,
} from '@/types/resume';
import {
  StudentProfile,
  ProjectItem,
  CertificationItem,
  InternshipItem,
  DEFAULT_STUDENT_PROFILE,
} from '@/types/student';
import { calculateCompletion } from './studentService';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationResult {
  valid: boolean;
  isPdf: boolean;
  isDocx: boolean;
  error?: string;
}

/**
 * Validates resume file metadata (type, extension, and size).
 */
export function validateResumeFileMeta(
  fileName: string | undefined | null,
  fileType: string | undefined | null,
  fileSizeBytes: number
): FileValidationResult {
  if (fileSizeBytes <= 0) {
    return {
      valid: false,
      isPdf: false,
      isDocx: false,
      error: 'The selected file is empty. Please upload a valid PDF or DOCX resume.',
    };
  }

  if (fileSizeBytes > MAX_RESUME_SIZE_BYTES) {
    return {
      valid: false,
      isPdf: false,
      isDocx: false,
      error: `Resume file exceeds the 5 MB limit (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  const lowerName = (fileName || '').toLowerCase().trim();
  const lowerType = (fileType || '').toLowerCase().trim();

  const isPdf = lowerName.endsWith('.pdf') || lowerType === 'application/pdf';
  const isDocx =
    lowerName.endsWith('.docx') ||
    lowerType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerType.includes('wordprocessingml');

  if (!isPdf && !isDocx) {
    return {
      valid: false,
      isPdf: false,
      isDocx: false,
      error: 'Unsupported file format. Please upload a PDF (.pdf) or Word (.docx) document.',
    };
  }

  return {
    valid: true,
    isPdf,
    isDocx,
  };
}

/**
 * Extracts readable text from a PDF or DOCX buffer.
 * Throws a descriptive error if the document is unreadable, corrupted, or contains no text.
 */
export async function extractReadableTextFromBuffer(
  buffer: Buffer,
  options: { isPdf: boolean; isDocx: boolean; fileName?: string }
): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('The uploaded resume file buffer is empty.');
  }

  if (options.isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || '').replace(/\r\n/g, '\n').trim();
      if (!text) {
        throw new Error(
          'No readable text could be extracted from this DOCX file. Please ensure the document contains selectable text and is not only embedded images.'
        );
      }
      return text;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('No readable text could be extracted')) {
        throw err;
      }
      throw new Error(
        `Unable to parse DOCX document${options.fileName ? ` (${options.fileName})` : ''}. The file may be corrupted or not a valid .docx archive.`
      );
    }
  }

  if (options.isPdf) {
    try {
      const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const { text } = await extractText(uint8Array, { mergePages: true });
      const normalized = (typeof text === 'string' ? text : Array.isArray(text) ? text.join('\n') : '')
        .replace(/\r\n/g, '\n')
        .trim();

      if (!normalized) {
        throw new Error(
          'No readable text could be extracted from this PDF file. It appears to be a scanned image or empty PDF without selectable text.'
        );
      }
      return normalized;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('No readable text could be extracted')) {
        throw err;
      }
      throw new Error(
        `Unable to read PDF document${options.fileName ? ` (${options.fileName})` : ''}. Please verify the file is a valid, unencrypted PDF.`
      );
    }
  }

  throw new Error('Unsupported document format. Only PDF and DOCX files are supported.');
}

function cleanOptionalString(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of val) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.length > 0 && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        result.push(trimmed);
      }
    }
  }
  return result;
}

function normalizeCgpa(val: unknown): number | string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return val > 0 && val <= 10 ? Number(val.toFixed(2)) : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const numericMatch = trimmed.match(/^(\d+(?:\.\d+)?)(?:\s*\/\s*10)?$/);
    if (numericMatch) {
      const parsed = parseFloat(numericMatch[1]);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 10) {
        return Number(parsed.toFixed(2));
      }
    }
    return trimmed;
  }
  return null;
}

/**
 * Safely parses and validates the raw JSON text returned by Gemini.
 * Handles markdown code fences, partial/missing fields, and ensures no invented values.
 */
export function parseAndValidateGeminiResumeResponse(rawResponseText: string): ExtractedResumeData {
  if (!rawResponseText || !rawResponseText.trim()) {
    throw new Error('Gemini returned an empty response while analyzing the resume.');
  }

  let cleaned = rawResponseText.trim();

  // Strip Markdown code fences if present
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else if (cleaned.includes('```')) {
    const innerMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (innerMatch) {
      cleaned = innerMatch[1].trim();
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Attempt to extract the first top-level JSON object if surrounded by prose
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new Error('Invalid JSON structure received from the AI extraction model.');
      }
    } else {
      throw new Error('Invalid JSON structure received from the AI extraction model.');
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Model output must be a JSON object matching the resume extraction schema.');
  }

  const obj = parsed as Record<string, unknown>;

  const education: ExtractedEducation[] = Array.isArray(obj.education)
    ? obj.education
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          institution: cleanOptionalString(item.institution),
          degree: cleanOptionalString(item.degree),
          branch: cleanOptionalString(item.branch),
          graduationYear: cleanOptionalString(
            typeof item.graduationYear === 'number' ? String(item.graduationYear) : item.graduationYear
          ),
          cgpa: normalizeCgpa(item.cgpa),
        }))
        .filter(
          (edu) =>
            edu.institution !== null ||
            edu.degree !== null ||
            edu.branch !== null ||
            edu.graduationYear !== null ||
            edu.cgpa !== null
        )
    : [];

  const projects: ExtractedProject[] = Array.isArray(obj.projects)
    ? obj.projects
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          title: cleanOptionalString(item.title) || '',
          description: cleanOptionalString(item.description),
          technologies: cleanStringArray(item.technologies),
          projectUrl: cleanOptionalString(item.projectUrl),
          githubUrl: cleanOptionalString(item.githubUrl),
        }))
        .filter((proj) => proj.title.length > 0)
    : [];

  const certifications: ExtractedCertification[] = Array.isArray(obj.certifications)
    ? obj.certifications
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          name: cleanOptionalString(item.name) || '',
          issuingOrganization: cleanOptionalString(item.issuingOrganization),
          issueDate: cleanOptionalString(item.issueDate),
          credentialId: cleanOptionalString(item.credentialId),
          credentialUrl: cleanOptionalString(item.credentialUrl),
        }))
        .filter((cert) => cert.name.length > 0)
    : [];

  const internships: ExtractedInternship[] = Array.isArray(obj.internships)
    ? obj.internships
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          company: cleanOptionalString(item.company) || '',
          role: cleanOptionalString(item.role) || '',
          startDate: cleanOptionalString(item.startDate),
          endDate: cleanOptionalString(item.endDate),
          description: cleanOptionalString(item.description),
          skills: cleanStringArray(item.skills),
        }))
        .filter((intern) => intern.company.length > 0 || intern.role.length > 0)
        .map((intern) => ({
          ...intern,
          company: intern.company || 'Organization',
          role: intern.role || 'Intern',
        }))
    : [];

  const experience: ExtractedExperience[] = Array.isArray(obj.experience)
    ? obj.experience
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          company: cleanOptionalString(item.company) || '',
          role: cleanOptionalString(item.role) || '',
          startDate: cleanOptionalString(item.startDate),
          endDate: cleanOptionalString(item.endDate),
          description: cleanOptionalString(item.description),
        }))
        .filter((exp) => exp.company.length > 0 || exp.role.length > 0)
        .map((exp) => ({
          ...exp,
          company: exp.company || 'Organization',
          role: exp.role || 'Professional',
        }))
    : [];

  const validated: ExtractedResumeData = {
    fullName: cleanOptionalString(obj.fullName ?? obj.name),
    email: cleanOptionalString(obj.email),
    phone: cleanOptionalString(obj.phone),
    education,
    skills: cleanStringArray(obj.skills),
    projects,
    certifications,
    internships,
    experience,
    achievements: cleanStringArray(obj.achievements),
    careerKeywords: cleanStringArray(obj.careerKeywords),
  };

  const hasAnyExtractedContent =
    validated.fullName !== null ||
    validated.email !== null ||
    validated.phone !== null ||
    validated.education.length > 0 ||
    validated.skills.length > 0 ||
    validated.projects.length > 0 ||
    validated.certifications.length > 0 ||
    validated.internships.length > 0 ||
    validated.experience.length > 0 ||
    validated.achievements.length > 0;

  if (!hasAnyExtractedContent) {
    throw new Error(
      'No recognizable resume fields (name, contact info, education, skills, projects, or experience) could be found in this document.'
    );
  }

  return validated;
}

/**
 * Maps validated ExtractedResumeData onto the existing StudentProfile and subcollection records
 * without inventing values or duplicating existing projects/certifications/internships.
 */
export function mapExtractedResumeToProfileUpdates(
  uid: string,
  extracted: ExtractedResumeData,
  currentProfile: StudentProfile | null,
  existingProjects: ProjectItem[] = [],
  existingCertifications: CertificationItem[] = [],
  existingInternships: InternshipItem[] = [],
  fallbackAuthUser?: {
    name?: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    regNumber?: string;
    institution?: string;
    department?: string;
  }
): {
  updatedProfile: StudentProfile;
  projectsToSave: Array<Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>>;
  certificationsToSave: Array<Omit<CertificationItem, 'id' | 'createdAt' | 'updatedAt'>>;
  internshipsToSave: Array<Omit<InternshipItem, 'id' | 'createdAt' | 'updatedAt'>>;
} {
  if (!uid) {
    throw new Error('Student UID is required to map profile updates.');
  }

  const now = new Date().toISOString();

  // Merge skills case-insensitively while preserving display casing
  const existingSkills = currentProfile?.skills || [];
  const skillMap = new Map<string, string>();
  for (const s of existingSkills) {
    if (s && s.trim()) skillMap.set(s.trim().toLowerCase(), s.trim());
  }
  for (const s of extracted.skills || []) {
    if (s && s.trim() && !skillMap.has(s.trim().toLowerCase())) {
      skillMap.set(s.trim().toLowerCase(), s.trim());
    }
  }
  const mergedSkills = Array.from(skillMap.values());

  // Extract primary education record if present
  const primaryEdu = extracted.education?.[0] || null;
  let extractedCgpa: number | null = null;
  if (primaryEdu && primaryEdu.cgpa !== null && primaryEdu.cgpa !== undefined) {
    const parsedNum =
      typeof primaryEdu.cgpa === 'number'
        ? primaryEdu.cgpa
        : parseFloat(String(primaryEdu.cgpa));
    if (!Number.isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 10) {
      extractedCgpa = Number(parsedNum.toFixed(2));
    }
  }

  // Deduplicate projects by title (case-insensitive)
  const existingProjectTitles = new Set(
    existingProjects.map((p) => p.title.trim().toLowerCase())
  );
  const projectsToSave: Array<Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>> = [];
  for (const proj of extracted.projects || []) {
    const title = (proj.title || '').trim();
    if (!title) continue;
    const key = title.toLowerCase();
    if (!existingProjectTitles.has(key)) {
      existingProjectTitles.add(key);
      projectsToSave.push({
        title,
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        projectUrl: proj.projectUrl || '',
        githubUrl: proj.githubUrl || '',
        role: 'Developer',
        duration: '',
      });
    }
  }

  // Deduplicate certifications by name (case-insensitive)
  const existingCertNames = new Set(
    existingCertifications.map((c) => c.name.trim().toLowerCase())
  );
  const certificationsToSave: Array<Omit<CertificationItem, 'id' | 'createdAt' | 'updatedAt'>> = [];
  for (const cert of extracted.certifications || []) {
    const name = (cert.name || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!existingCertNames.has(key)) {
      existingCertNames.add(key);
      certificationsToSave.push({
        name,
        issuingOrganization: cert.issuingOrganization?.trim() || 'Issuing Organization',
        issueDate: cert.issueDate?.trim() || '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
      });
    }
  }

  // Combine internships and work experience entries into internships subcollection (deduplicated by company + role)
  const existingInternKeys = new Set(
    existingInternships.map(
      (i) => `${i.company.trim().toLowerCase()}::${i.role.trim().toLowerCase()}`
    )
  );
  const internshipsToSave: Array<Omit<InternshipItem, 'id' | 'createdAt' | 'updatedAt'>> = [];

  const combinedExperiences: ExtractedInternship[] = [
    ...(extracted.internships || []),
    ...(extracted.experience || []).map((exp) => ({
      company: exp.company,
      role: exp.role,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      skills: [],
    })),
  ];

  for (const intern of combinedExperiences) {
    const company = (intern.company || '').trim();
    const role = (intern.role || '').trim() || 'Intern';
    if (!company) continue;
    const key = `${company.toLowerCase()}::${role.toLowerCase()}`;
    if (!existingInternKeys.has(key)) {
      existingInternKeys.add(key);
      internshipsToSave.push({
        company,
        role,
        startDate: intern.startDate || '',
        endDate: intern.endDate || '',
        description: intern.description || '',
        skillsUsed: Array.isArray(intern.skills) ? intern.skills : [],
      });
    }
  }

  const baseProfile: StudentProfile = {
    ...DEFAULT_STUDENT_PROFILE,
    ...(currentProfile || {}),
    uid,
    fullName:
      extracted.fullName ||
      currentProfile?.fullName ||
      fallbackAuthUser?.name ||
      '',
    email:
      currentProfile?.email ||
      fallbackAuthUser?.email ||
      extracted.email ||
      '',
    phone:
      extracted.phone ||
      currentProfile?.phone ||
      fallbackAuthUser?.phone ||
      '',
    dateOfBirth: currentProfile?.dateOfBirth || '',
    gender: currentProfile?.gender || '',
    photoURL: currentProfile?.photoURL || fallbackAuthUser?.photoURL || '',
    bputRegistrationNumber:
      currentProfile?.bputRegistrationNumber || fallbackAuthUser?.regNumber || '',
    college:
      primaryEdu?.institution ||
      currentProfile?.college ||
      fallbackAuthUser?.institution ||
      DEFAULT_STUDENT_PROFILE.college,
    department:
      primaryEdu?.branch ||
      currentProfile?.department ||
      fallbackAuthUser?.department ||
      DEFAULT_STUDENT_PROFILE.department,
    branch:
      primaryEdu?.branch ||
      currentProfile?.branch ||
      DEFAULT_STUDENT_PROFILE.branch,
    semester: currentProfile?.semester || DEFAULT_STUDENT_PROFILE.semester,
    graduationYear:
      primaryEdu?.graduationYear ||
      currentProfile?.graduationYear ||
      DEFAULT_STUDENT_PROFILE.graduationYear,
    cgpa:
      extractedCgpa !== null
        ? extractedCgpa
        : currentProfile?.cgpa ?? DEFAULT_STUDENT_PROFILE.cgpa,
    backlogs: currentProfile?.backlogs ?? 0,
    skills: mergedSkills,
    careerGoal: currentProfile?.careerGoal || {
      ...DEFAULT_STUDENT_PROFILE.careerGoal,
      targetRole:
        extracted.careerKeywords?.[0] ||
        DEFAULT_STUDENT_PROFILE.careerGoal.targetRole,
    },
    readinessInputs:
      currentProfile?.readinessInputs || DEFAULT_STUDENT_PROFILE.readinessInputs,
    profileCompletion: currentProfile?.profileCompletion || 40,
    createdAt: currentProfile?.createdAt || now,
    updatedAt: now,
  };

  const totalProjectsCount = existingProjects.length + projectsToSave.length;
  const totalCertsCount = existingCertifications.length + certificationsToSave.length;
  const totalInternsCount = existingInternships.length + internshipsToSave.length;

  const audit = calculateCompletion(
    baseProfile,
    totalProjectsCount,
    totalCertsCount,
    totalInternsCount
  );

  baseProfile.profileCompletion = audit.percentage;

  return {
    updatedProfile: baseProfile,
    projectsToSave,
    certificationsToSave,
    internshipsToSave,
  };
}
