export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type WorkMode = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
export type JdSource = 'MANUAL' | 'AI_PARSED';

export interface JobEligibility {
  minCgpa: number | null;
  maxBacklogs: number | null;
  graduationYears: string[];
  branches: string[];
  colleges?: string[];
  minExperienceMonths: number;
  requiredCertifications: string[];
}

export interface JobSkillRequirement {
  name: string;
  requiredLevel: number; // 0-100
}

export interface JobPreferredSkill {
  name: string;
  preferredLevel: number; // 0-100
}

export interface RecruiterJob {
  id: string;
  recruiterId: string;
  title: string;
  company: string;
  description: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;

  salaryMin: number | null;
  salaryMax: number | null;

  openings: number | null;

  applicationDeadline: string;
  driveDate?: string | null;

  status: JobStatus;

  eligibility: JobEligibility;

  requiredSkills: JobSkillRequirement[];
  preferredSkills: JobPreferredSkill[];

  jdSource: JdSource;
  jdFileName?: string;
  jdStoragePath?: string;

  aiParsed: boolean;
  aiParsedAt?: string;

  requirementsVersion?: number;

  createdAt: string;
  updatedAt: string;
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ON_SITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

export const COMMON_BPUT_BRANCHES = [
  'CSE',
  'IT',
  'ECE',
  'EE',
  'ME',
  'Civil',
  'Data Science & AI',
  'All Engineering Disciplines',
];

export const COMMON_GRADUATION_YEARS = ['2025', '2026', '2027', '2028'];
