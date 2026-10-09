import { RecruiterJob } from '@/types/job';
import { StudentProfile, ProjectItem, CertificationItem, InternshipItem } from '@/types/student';
import { EligibilityEvaluation } from '@/types/eligibility';
import { CandidateMatchResult, MatchingTestCase, MatchingTestCaseResult } from '@/types/matching';
import { calculateMatchScore, rankEligibleCandidates } from './matchingEngine';
import { evaluateEligibility } from './eligibilityEngine';

/**
 * Standard Baseline Benchmark Student Profile
 */
export const MATCH_BASELINE_STUDENT: Partial<StudentProfile> = {
  uid: 'std_priyanshu_01',
  fullName: 'Priyanshu Mohanty',
  email: 'priyanshu@bput.ac.in',
  branch: 'Computer Science and Engineering',
  graduationYear: '2026',
  cgpa: 8.5,
  backlogs: 0,
  skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
  skillProficiencies: {
    Python: 85,
    Java: 80,
    SQL: 75,
    'Data Structures': 82,
    Git: 78,
  },
  careerGoal: {
    targetRole: 'Software Engineer',
    preferredLocation: 'Bengaluru, Bhubaneswar',
    workMode: 'Hybrid',
  },
};

/**
 * Standard Baseline Benchmark Job Opening
 */
export const MATCH_BASELINE_JOB: Partial<RecruiterJob> = {
  id: 'job_matching_benchmark',
  recruiterId: 'rec_campuslink_01',
  title: 'Software Engineer',
  company: 'Tata Consultancy Services',
  status: 'OPEN',
  location: 'Bengaluru',
  workMode: 'HYBRID',
  employmentType: 'FULL_TIME',
  eligibility: {
    minCgpa: 7.0,
    maxBacklogs: 0,
    graduationYears: ['2026'],
    branches: ['Computer Science and Engineering', 'Information Technology'],
    minExperienceMonths: 0,
    requiredCertifications: [],
  },
  requiredSkills: [
    { name: 'Python', requiredLevel: 80 },
    { name: 'SQL', requiredLevel: 70 },
  ],
  preferredSkills: [
    { name: 'AWS', preferredLevel: 60 },
  ],
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
};

export const MATCH_BASELINE_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_01',
    title: 'Customer Churn Prediction Platform',
    description: 'Enterprise data engineering pipeline and machine learning churn classification using Python, Pandas, and SQL.',
    technologies: ['Python', 'SQL', 'Scikit-learn', 'Pandas'],
    role: 'Backend Engineer',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

export const MATCH_BASELINE_INTERNSHIPS: InternshipItem[] = [
  {
    id: 'intern_01',
    company: 'Fintech Solutions Ltd',
    role: 'Software Development Intern',
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    description: 'Developed Python backend microservices and automated SQL database schema migration scripts.',
    skillsUsed: ['Python', 'SQL', 'Git'],
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
];

export const MATCH_BASELINE_CERTS: CertificationItem[] = [
  {
    id: 'cert_01',
    name: 'AWS Certified Cloud Practitioner',
    issuingOrganization: 'Amazon Web Services',
    issueDate: '2025-11-10',
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-10T00:00:00Z',
  },
];

/**
 * Helper to build an EligibilityEvaluation
 */
function createEligibilityEval(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>,
  isEligible: boolean
): EligibilityEvaluation {
  const evalResult = evaluateEligibility({ student, job });
  return {
    ...evalResult,
    eligible: isEligible,
    status: isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
  };
}

/**
 * Suite of 13 Deterministic Verification Test Cases
 */
export const MATCHING_TEST_CASES: MatchingTestCase[] = [
  // TEST 1: Eligible student with strong required skills
  {
    id: 'TEST-01',
    name: 'Eligible student with strong required skills',
    description: 'Student exceeds required skill levels (Python 95/80, SQL 90/70) and is fully eligible. Expected high match score (>= 85).',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      skillProficiencies: { Python: 95, SQL: 90 },
      skills: ['Python', 'SQL', 'AWS'],
    },
    mockJob: { ...MATCH_BASELINE_JOB },
    mockProjects: MATCH_BASELINE_PROJECTS,
    mockInternships: MATCH_BASELINE_INTERNSHIPS,
    mockCertifications: MATCH_BASELINE_CERTS,
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    expectedScoreMin: 85,
    verifyFn: (res) => ({
      passed: res.score >= 85 && res.breakdown.requiredSkills.score === 100,
      note: `Score: ${res.score}/100. Required skills match: ${res.breakdown.requiredSkills.score}%`,
    }),
  },

  // TEST 2: Eligible student with moderate skill coverage
  {
    id: 'TEST-02',
    name: 'Eligible student with moderate skill coverage',
    description: 'Student meets required thresholds at exact or modest ratios. Expected moderate score (60-80).',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      skillProficiencies: { Python: 70, SQL: 60 },
      skills: ['Python', 'SQL'],
    },
    mockJob: { ...MATCH_BASELINE_JOB },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    expectedScoreMin: 55,
    expectedScoreMax: 82,
    verifyFn: (res) => ({
      passed: res.score >= 55 && res.score <= 82,
      note: `Moderate match score: ${res.score}/100`,
    }),
  },

  // TEST 3: Strong projects but weaker preferred skills
  {
    id: 'TEST-03',
    name: 'Strong projects with weaker preferred skills',
    description: 'Preferred skills missing or weak. Preferred skill deficit must NOT cause eligibility failure.',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      skillProficiencies: { Python: 85, SQL: 80, AWS: 0 },
      skills: ['Python', 'SQL'],
    },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      preferredSkills: [{ name: 'AWS', preferredLevel: 80 }],
    },
    mockProjects: MATCH_BASELINE_PROJECTS,
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    expectedScoreMin: 70,
    verifyFn: (res) => ({
      passed: res.eligible === true && res.rankingEligible === true && res.score >= 70,
      note: `Student remained ELIGIBLE despite missing preferred skill. Match: ${res.score}/100.`,
    }),
  },

  // TEST 4: NOT_ELIGIBLE student with high skill match
  {
    id: 'TEST-04',
    name: 'NOT_ELIGIBLE student with high skill match',
    description: 'Student has 100% skills but failed mandatory CGPA/backlog eligibility cutoff. Must NOT be rankingEligible.',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      cgpa: 5.8, // Fails cutoff
      skillProficiencies: { Python: 100, SQL: 100 },
    },
    mockJob: { ...MATCH_BASELINE_JOB },
    mockEligibility: {
      ...createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, false),
      eligible: false,
      status: 'NOT_ELIGIBLE',
    },
    expectedEligible: false,
    expectedRankingEligible: false,
    verifyFn: (res) => {
      const rankedList = rankEligibleCandidates([res]);
      const isExcluded = !rankedList.some((r) => r.studentId === res.studentId);
      return {
        passed: res.eligible === false && res.rankingEligible === false && isExcluded,
        note: `Candidate marked ineligible and excluded from rank list: ${isExcluded}. Reason: ${res.reason}`,
      };
    },
  },

  // TEST 5: No certifications on student & no cert requirement on job
  {
    id: 'TEST-05',
    name: 'No certifications required & none present',
    description: 'Certification dimension must be marked NOT_APPLICABLE and its 5% weight redistributed without penalty.',
    mockStudent: { ...MATCH_BASELINE_STUDENT },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      eligibility: {
        ...MATCH_BASELINE_JOB.eligibility!,
        requiredCertifications: [],
      },
    },
    mockCertifications: [],
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => ({
      passed: res.breakdown.certifications.status === 'NOT_APPLICABLE' && res.score > 0,
      note: `Certifications status: ${res.breakdown.certifications.status}, normalized score: ${res.score}/100`,
    }),
  },

  // TEST 6: Job has no preferred skills
  {
    id: 'TEST-06',
    name: 'Job has no preferred skills',
    description: 'Preferred skills component must be NOT_APPLICABLE. Remaining 85% active weights normalized to 100%.',
    mockStudent: { ...MATCH_BASELINE_STUDENT },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      preferredSkills: [],
    },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => ({
      passed:
        res.breakdown.preferredSkills.status === 'NOT_APPLICABLE' &&
        res.breakdown.preferredSkills.normalizedWeight === 0 &&
        res.score > 0,
      note: `Preferred skills marked NOT_APPLICABLE without lowering candidate score. Match: ${res.score}`,
    }),
  },

  // TEST 7: Student has no career goal declared
  {
    id: 'TEST-07',
    name: 'Student has no career goal declared',
    description: 'Career goal component must be NOT_APPLICABLE and weight redistributed.',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      careerGoal: { targetRole: '' },
    },
    mockJob: { ...MATCH_BASELINE_JOB },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => ({
      passed: res.breakdown.careerGoal.status === 'NOT_APPLICABLE',
      note: `Career goal dimension marked NOT_APPLICABLE.`,
    }),
  },

  // TEST 8: Student has no preferred location declared
  {
    id: 'TEST-08',
    name: 'Student has open / no location preference',
    description: 'Location preference must not unfairly penalize candidate.',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      careerGoal: {
        targetRole: 'Software Engineer',
        preferredLocation: 'Anywhere in India',
        workMode: 'Hybrid',
      },
    },
    mockJob: { ...MATCH_BASELINE_JOB, location: 'Pune' },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => ({
      passed: res.breakdown.locationWorkMode.score >= 90,
      note: `Open location preference scored full alignment: ${res.breakdown.locationWorkMode.score}/100`,
    }),
  },

  // TEST 9: Required skill: Python = 80, Student = 100
  {
    id: 'TEST-09',
    name: 'Student exceeds required level (Python 100 vs 80)',
    description: 'Ratio min(100/80, 1) = 1.0 (100% required skill coverage contribution).',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      skillProficiencies: { Python: 100, SQL: 70 },
    },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      requiredSkills: [{ name: 'Python', requiredLevel: 80 }],
    },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => {
      const pyDetail = res.breakdown.requiredSkills.details?.items?.find((i: any) => i.name === 'Python');
      const ratioPct = (pyDetail?.ratio ?? 0) * 100;
      return {
        passed: pyDetail?.ratio === 1 && res.breakdown.requiredSkills.score === 100,
        note: `Python coverage: ${ratioPct}% (${pyDetail?.actualLevel ?? 0}/${pyDetail?.targetLevel ?? 0})`,
      };
    },
  },

  // TEST 10: Required skill: Python = 80, Student = 60
  {
    id: 'TEST-10',
    name: 'Required skill below threshold (Python 60 vs 80)',
    description: 'Eligibility gate marks NOT_ELIGIBLE. Final ranked list must exclude student.',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      skillProficiencies: { Python: 60 },
    },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      requiredSkills: [{ name: 'Python', requiredLevel: 80 }],
    },
    mockEligibility: {
      ...createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, false),
      eligible: false,
      status: 'NOT_ELIGIBLE',
    },
    expectedEligible: false,
    expectedRankingEligible: false,
    verifyFn: (res) => {
      const ranked = rankEligibleCandidates([res]);
      return {
        passed: res.rankingEligible === false && ranked.length === 0,
        note: `Ineligible student excluded from ranked shortlist. List size: ${ranked.length}`,
      };
    },
  },

  // TEST 11: Preferred skill: AWS = 60, Student missing AWS
  {
    id: 'TEST-11',
    name: 'Preferred skill missing (AWS 60 vs missing)',
    description: 'Candidate remains ELIGIBLE if all mandatory criteria pass. Preferred score reflects missing skill.',
    mockStudent: {
      ...MATCH_BASELINE_STUDENT,
      skills: ['Python', 'SQL'],
      skillProficiencies: { Python: 85, SQL: 75 },
    },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      preferredSkills: [{ name: 'AWS', preferredLevel: 60 }],
    },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => ({
      passed: res.eligible === true && res.breakdown.preferredSkills.score === 0,
      note: `Student remained ELIGIBLE. Preferred score: ${res.breakdown.preferredSkills.score}`,
    }),
  },

  // TEST 12: Two candidates with identical score
  {
    id: 'TEST-12',
    name: 'Deterministic tie-breaker for identical match scores',
    description: 'Rank ordering must be stable and deterministic using studentId tie-breaker without randomness.',
    mockStudent: { ...MATCH_BASELINE_STUDENT, uid: 'std_candidate_b' },
    mockJob: { ...MATCH_BASELINE_JOB },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (resB) => {
      // Create duplicate candidate with lower studentId string
      const resA: CandidateMatchResult = {
        ...resB,
        studentId: 'std_candidate_a',
        studentName: 'Candidate A',
      };
      const ranked = rankEligibleCandidates([resB, resA]);
      const firstIsA = ranked[0].studentId === 'std_candidate_a';
      return {
        passed: firstIsA && ranked[0].rank === 1 && ranked[1].rank === 2,
        note: `Tie-breaker resolved deterministically: Rank #1 is ${ranked[0].studentId}, Rank #2 is ${ranked[1].studentId}`,
      };
    },
  },

  // TEST 13: Job requirementsVersion change
  {
    id: 'TEST-13',
    name: 'Job requirementsVersion change invalidation',
    description: 'Changing job updatedAt increments requirementsVersion, flagging older cached matches as stale.',
    mockStudent: { ...MATCH_BASELINE_STUDENT },
    mockJob: {
      ...MATCH_BASELINE_JOB,
      updatedAt: '2026-10-05T09:00:00Z',
    },
    mockEligibility: createEligibilityEval(MATCH_BASELINE_STUDENT, MATCH_BASELINE_JOB, true),
    expectedEligible: true,
    expectedRankingEligible: true,
    verifyFn: (res) => {
      const oldVersion = '2026-09-01T10:00:00Z';
      const isStale = res.requirementsVersion !== oldVersion;
      return {
        passed: isStale && res.requirementsVersion === '2026-10-05T09:00:00Z',
        note: `requirementsVersion updated to ${res.requirementsVersion}, successfully flagging prior version '${oldVersion}' as stale.`,
      };
    },
  },
];

/**
 * Runner that executes all 13 test cases and returns structured evaluation metrics.
 */
export function runAllMatchingTests(): {
  total: number;
  passed: number;
  failed: number;
  results: MatchingTestCaseResult[];
} {
  const results: MatchingTestCaseResult[] = [];
  let passedCount = 0;

  for (const tc of MATCHING_TEST_CASES) {
    const matchResult = calculateMatchScore({
      student: tc.mockStudent,
      job: tc.mockJob,
      eligibilityResult: tc.mockEligibility,
      projects: tc.mockProjects,
      certifications: tc.mockCertifications,
      internships: tc.mockInternships,
    });

    let pass = true;
    let note = '';

    if (matchResult.eligible !== tc.expectedEligible) {
      pass = false;
      note += `Eligibility mismatch: expected ${tc.expectedEligible}, got ${matchResult.eligible}. `;
    }
    if (matchResult.rankingEligible !== tc.expectedRankingEligible) {
      pass = false;
      note += `RankingEligibility mismatch: expected ${tc.expectedRankingEligible}, got ${matchResult.rankingEligible}. `;
    }
    if (tc.expectedScoreMin !== undefined && matchResult.score < tc.expectedScoreMin) {
      pass = false;
      note += `Score ${matchResult.score} below minimum expected ${tc.expectedScoreMin}. `;
    }
    if (tc.expectedScoreMax !== undefined && matchResult.score > tc.expectedScoreMax) {
      pass = false;
      note += `Score ${matchResult.score} exceeds maximum expected ${tc.expectedScoreMax}. `;
    }

    if (tc.verifyFn) {
      const customVerif = tc.verifyFn(matchResult);
      if (!customVerif.passed) {
        pass = false;
        note += customVerif.note;
      } else if (!note) {
        note = customVerif.note;
      }
    }

    if (pass) passedCount++;

    results.push({
      testCase: tc,
      result: matchResult,
      passed: pass,
      notes: note || 'All constraints satisfied deterministically.',
    });
  }

  return {
    total: MATCHING_TEST_CASES.length,
    passed: passedCount,
    failed: MATCHING_TEST_CASES.length - passedCount,
    results,
  };
}
