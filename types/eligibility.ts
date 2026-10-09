import { RecruiterJob } from './job';
import { StudentProfile, CertificationItem, InternshipItem } from './student';

export type RuleResultStatus = 'PASS' | 'FAIL' | 'NOT_APPLICABLE';

export type EligibilityRuleType =
  | 'CGPA'
  | 'BACKLOGS'
  | 'GRADUATION_YEAR'
  | 'BRANCH'
  | 'COLLEGE'
  | 'EXPERIENCE'
  | 'REQUIRED_CERTIFICATIONS'
  | 'REQUIRED_SKILLS';

export interface EligibilitySubItem {
  name: string;
  required: string;
  actual: string;
  status: RuleResultStatus;
  reason?: string;
}

export interface EligibilityRuleDetail {
  rule: EligibilityRuleType;
  ruleName: string;
  requirement: string;
  actual: string;
  result: RuleResultStatus;
  reason: string;
  subItems?: EligibilitySubItem[];
}

export interface EligibilitySummary {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  notApplicableRules: number;
}

export interface EligibilityEvaluation {
  jobId: string;
  studentId: string;
  jobTitle: string;
  company: string;
  eligible: boolean;
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE';
  evaluatedAt: string;
  rules: EligibilityRuleDetail[];
  summary: EligibilitySummary;
  preferredSkillsNote?: string;
  evaluatedBy?: string;
}

export interface EligibilityTestCase {
  id: string;
  name: string;
  description: string;
  expectedEligible: boolean;
  expectedFailedRule?: EligibilityRuleType;
  mockStudent: Partial<StudentProfile>;
  mockCertifications?: CertificationItem[];
  mockInternships?: InternshipItem[];
  mockJob: Partial<RecruiterJob>;
}

export interface TestCaseExecutionResult {
  testCase: EligibilityTestCase;
  evaluation: EligibilityEvaluation;
  passed: boolean;
  actualEligible: boolean;
  notes: string;
}
