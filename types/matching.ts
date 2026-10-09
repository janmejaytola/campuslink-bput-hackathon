import { RecruiterJob } from './job';
import { StudentProfile, ProjectItem, CertificationItem, InternshipItem } from './student';
import { EligibilityEvaluation } from './eligibility';

export type MatchComponentStatus = 'APPLICABLE' | 'NOT_APPLICABLE';

/**
 * Detailed scoring breakdown for a single matching dimension.
 */
export interface MatchComponentScore {
  score: number; // Raw component score 0-100
  weight: number; // Base configured weight (sum of all base weights = 100)
  normalizedWeight: number; // Normalized weight after redistributing NOT_APPLICABLE components
  contribution: number; // Effective points contributed to the final 0-100 match score
  status: MatchComponentStatus;
  reason: string;
  details?: {
    matchedCount?: number;
    totalCount?: number;
    items?: Array<{
      name: string;
      targetLevel?: number;
      actualLevel?: number;
      ratio?: number;
      status: string;
    }>;
    [key: string]: any;
  };
}

/**
 * The 7 canonical matching dimensions defined by CAMPUSLINK PS10.
 */
export interface MatchBreakdown {
  requiredSkills: MatchComponentScore; // Base: 45%
  preferredSkills: MatchComponentScore; // Base: 15%
  projects: MatchComponentScore; // Base: 15%
  experience: MatchComponentScore; // Base: 10%
  certifications: MatchComponentScore; // Base: 5%
  careerGoal: MatchComponentScore; // Base: 5%
  locationWorkMode: MatchComponentScore; // Base: 5%
}

/**
 * Canonical Candidate Match Result.
 * Generated purely through deterministic calculation. Independent of Gemini or LLMs.
 */
export interface CandidateMatchResult {
  studentId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  studentName?: string;
  studentBranch?: string;
  studentBatch?: string;
  studentRegNo?: string;
  rank?: number;

  /**
   * ELIGIBILITY GATE:
   * If eligibility.status !== 'ELIGIBLE', eligible = false and rankingEligible = false.
   * High match score must NEVER override eligibility.
   */
  eligible: boolean;
  rankingEligible: boolean;
  reason?: string;

  /**
   * Deterministic score 0-100 rounded to 1 decimal place.
   */
  score: number;

  /**
   * Transparent 7-dimension breakdown.
   */
  breakdown: MatchBreakdown;

  /**
   * Deterministic explainability signals.
   */
  strengths: string[];
  gaps: string[];
  explanation: string[];

  /**
   * Audit & invalidation metadata.
   */
  evaluatedAt: string;
  requirementsVersion: string;
}

/**
 * Candidate with deterministic rank.
 */
export interface RankedCandidate extends CandidateMatchResult {
  rank: number;
}

/**
 * Structured Test Case definition for unit testing the matching engine.
 */
export interface MatchingTestCase {
  id: string;
  name: string;
  description: string;
  mockStudent: Partial<StudentProfile>;
  mockJob: Partial<RecruiterJob>;
  mockProjects?: ProjectItem[];
  mockCertifications?: CertificationItem[];
  mockInternships?: InternshipItem[];
  mockEligibility: EligibilityEvaluation;
  expectedEligible: boolean;
  expectedRankingEligible: boolean;
  expectedScoreMin?: number;
  expectedScoreMax?: number;
  verifyFn?: (result: CandidateMatchResult) => { passed: boolean; note: string };
}

export interface MatchingTestCaseResult {
  testCase: MatchingTestCase;
  result: CandidateMatchResult;
  passed: boolean;
  notes: string;
}
