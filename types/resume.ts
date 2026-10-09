export interface ExtractedEducation {
  institution: string | null;
  degree: string | null;
  branch: string | null;
  graduationYear: string | null;
  cgpa: number | string | null;
}

export interface ExtractedProject {
  title: string;
  description: string | null;
  technologies: string[];
  projectUrl: string | null;
  githubUrl: string | null;
}

export interface ExtractedCertification {
  name: string;
  issuingOrganization: string | null;
  issueDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
}

export interface ExtractedInternship {
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  skills: string[];
}

export interface ExtractedExperience {
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface ExtractedResumeData {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  education: ExtractedEducation[];
  skills: string[];
  projects: ExtractedProject[];
  certifications: ExtractedCertification[];
  internships: ExtractedInternship[];
  experience: ExtractedExperience[];
  achievements: string[];
  careerKeywords: string[];
}

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ResumeRecord {
  id: string;
  uid: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadURL: string;
  uploadedAt: string;
  updatedAt: string;
  extractionStatus: ExtractionStatus;
  extractedData?: ExtractedResumeData | null;
  errorMessage?: string | null;
  syncStatus?: 'not_synced' | 'synced';
}
