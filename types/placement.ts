export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Intern + PPO';
  packageCTC: string; // e.g., '₹9.00 - 12.00 LPA'
  minCGPA: number;
  branches: string[];
  batch: string;
  status: 'Active' | 'Upcoming' | 'Closed';
  deadline: string;
  rolesDescription: string;
  applicantsCount: number;
  shortlistedCount: number;
  offersCount: number;
  rounds: string[];
}

export interface StudentApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  stage: 'Applied' | 'Eligibility Verified' | 'Shortlisted' | 'Assessment' | 'Technical Round' | 'HR Round' | 'Offered' | 'Declined';
  statusBadge: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  nextActionDate?: string;
  nextActionTitle?: string;
  eligibilityMet: boolean;
}

export interface DriveEvent {
  id: string;
  title: string;
  company: string;
  eventType: 'Online Assessment' | 'PPT / Pre-Placement Talk' | 'Technical Interview' | 'HR Interview' | 'Offer Rollout';
  date: string;
  timeSlot: string;
  venueOrLink: string;
  targetRole: string;
  conflictsDetected: number;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Pending Venue';
}

export interface PlacementOffer {
  id: string;
  company: string;
  role: string;
  ctc: string;
  baseSalary: string;
  joiningLocation: string;
  offerDate: string;
  acceptanceDeadline: string;
  status: 'Offer Released' | 'Accepted' | 'Pending Review' | 'Declined';
  documentRef: string;
}

export interface SkillGapItem {
  skill: string;
  category: 'Core Computer Science' | 'Modern Frameworks' | 'System Design' | 'Soft Skills';
  currentLevel: 'Proficient' | 'Intermediate' | 'Novice' | 'Missing';
  requiredLevel: 'Proficient' | 'Expert' | 'Intermediate';
  status: 'Met' | 'Gap Detected' | 'Priority Focus';
  targetRoleRelevance: string;
}

export interface ReadinessCategory {
  title: string;
  score: number; // 0 - 100
  benchmark: number;
  summary: string;
  status: 'Good' | 'Needs Attention' | 'Strong';
}
