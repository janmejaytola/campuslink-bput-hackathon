export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  role?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternshipItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  skillsUsed: string[];
  createdAt: string;
  updatedAt: string;
}

import { CareerGoal } from './careerGoal';
export type { CareerGoal };

export interface ReadinessInputs {
  aptitudeScore: number;
  technicalScore: number;
  communicationScore: number;
}

export interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  photoURL?: string;

  // Academic Information
  bputRegistrationNumber: string;
  college: string;
  department: string;
  branch: string;
  semester: string;
  graduationYear: string;
  cgpa: number;
  backlogs: number;

  // Skills
  skills: string[];
  skillProficiencies?: Record<string, number>;

  // Career Goal
  careerGoal: CareerGoal;

  // Placement Readiness Inputs
  readinessInputs: ReadinessInputs;

  // Profile completion calculated
  profileCompletion: number;

  createdAt: string;
  updatedAt: string;
}

export const TARGET_ROLE_OPTIONS = [
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer',
  'QA / Automation Engineer',
  'Systems Engineer',
];

export const WORK_MODE_OPTIONS = ['On-site', 'Hybrid', 'Remote'];

export const JOB_TYPE_OPTIONS = ['Full-time', 'Internship + PPO', 'Internship', 'Contract'];

export const DEFAULT_STUDENT_PROFILE: Omit<StudentProfile, 'uid' | 'email' | 'fullName'> = {
  phone: '',
  dateOfBirth: '',
  gender: '',
  photoURL: '',
  bputRegistrationNumber: '',
  college: 'BPUT Affiliated Engineering Institute',
  department: 'Computer Science & Engineering',
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
};
