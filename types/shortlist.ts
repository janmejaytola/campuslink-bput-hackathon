export type ShortlistStatus = 'NOT_REVIEWED' | 'SHORTLISTED' | 'REJECTED';

export interface ShortlistRecord {
  id: string; // Deterministic format: `${jobId}_${candidateId}`
  recruiterId: string;
  jobId: string;
  candidateId: string; // studentId

  // Snapshot metadata
  candidateName: string;
  candidateBranch: string;
  candidateBatch: string;
  candidateRegNo: string;
  jobTitle: string;
  company: string;

  // Decision & Scoring
  status: ShortlistStatus;
  matchScoreSnapshot: number; // 0-100 deterministic match score
  eligible: boolean; // Must be true to shortlist
  reason: string; // Recruiter explanation or notes
  strengthsSnapshot?: string[];

  // Timestamps & Audit
  createdAt: string;
  updatedAt: string;
  reviewedBy: string;
}

export interface ShortlistUpdateParams {
  jobId: string;
  candidateId: string;
  recruiterId: string;
  status: ShortlistStatus;
  matchScoreSnapshot: number;
  eligible: boolean;
  reason?: string;
  candidateName?: string;
  candidateBranch?: string;
  candidateBatch?: string;
  candidateRegNo?: string;
  jobTitle?: string;
  company?: string;
  strengthsSnapshot?: string[];
}
