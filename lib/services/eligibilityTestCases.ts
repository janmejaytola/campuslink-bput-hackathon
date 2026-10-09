import { RecruiterJob } from '@/types/job';
import { StudentProfile, CertificationItem, InternshipItem } from '@/types/student';
import { EligibilityTestCase, TestCaseExecutionResult } from '@/types/eligibility';
import { evaluateEligibility } from './eligibilityEngine';

/**
 * Standard Baseline Benchmark Student Profile
 */
export const BASELINE_STUDENT: Partial<StudentProfile> = {
  uid: 'std_baseline_01',
  fullName: 'Priyanshu Mohanty',
  email: 'priyanshu@bput.ac.in',
  college: 'Silicon Institute of Technology',
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
};

/**
 * Standard Baseline Benchmark Job Posting
 */
export const BASELINE_JOB: Partial<RecruiterJob> = {
  id: 'job_baseline_01',
  title: 'Graduate Software Engineer 2026',
  company: 'Tata Consultancy Services',
  status: 'OPEN',
  eligibility: {
    minCgpa: 7.0,
    maxBacklogs: 0,
    graduationYears: ['2026'],
    branches: ['Computer Science and Engineering', 'Information Technology'],
    colleges: ['Silicon Institute of Technology', 'College of Engineering and Technology (OUTR)'],
    minExperienceMonths: 0,
    requiredCertifications: [],
  },
  requiredSkills: [
    { name: 'Python', requiredLevel: 70 },
  ],
  preferredSkills: [
    { name: 'AWS', preferredLevel: 60 },
  ],
};

/**
 * Suite of 16 Deterministic Verification Test Cases
 */
export const ELIGIBILITY_TEST_CASES: EligibilityTestCase[] = [
  // 1. Ideal Candidate
  {
    id: 'TC-01',
    name: 'Ideal Candidate — All Criteria Satisfied',
    description: 'Student meets or exceeds all academic, skill, and graduation year criteria.',
    expectedEligible: true,
    mockStudent: { ...BASELINE_STUDENT },
    mockJob: { ...BASELINE_JOB },
  },

  // 2. Below CGPA threshold
  {
    id: 'TC-02',
    name: 'CGPA Below Required Cutoff',
    description: 'Job requires min CGPA 7.5; student has 6.80.',
    expectedEligible: false,
    expectedFailedRule: 'CGPA',
    mockStudent: {
      ...BASELINE_STUDENT,
      cgpa: 6.8,
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        minCgpa: 7.5,
      },
    },
  },

  // 3. Exceeds backlog allowance
  {
    id: 'TC-03',
    name: 'Active Backlogs Exceed Allowed Limit',
    description: 'Job mandates 0 active backlogs; student has 2 active backlogs.',
    expectedEligible: false,
    expectedFailedRule: 'BACKLOGS',
    mockStudent: {
      ...BASELINE_STUDENT,
      backlogs: 2,
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        maxBacklogs: 0,
      },
    },
  },

  // 4. Ineligible graduation year
  {
    id: 'TC-04',
    name: 'Ineligible Graduation Batch Year',
    description: 'Job is restricted to 2026 batch; student is graduating in 2027.',
    expectedEligible: false,
    expectedFailedRule: 'GRADUATION_YEAR',
    mockStudent: {
      ...BASELINE_STUDENT,
      graduationYear: '2027',
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        graduationYears: ['2026'],
      },
    },
  },

  // 5. Ineligible branch
  {
    id: 'TC-05',
    name: 'Ineligible Academic Branch',
    description: 'Job requires CSE/IT; student belongs to Civil Engineering.',
    expectedEligible: false,
    expectedFailedRule: 'BRANCH',
    mockStudent: {
      ...BASELINE_STUDENT,
      branch: 'Civil Engineering',
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        branches: ['Computer Science and Engineering', 'Information Technology'],
      },
    },
  },

  // 6. Branch synonym matching
  {
    id: 'TC-06',
    name: 'Branch Controlled Synonym Normalization (CSE <-> Computer Science)',
    description: 'Job specifies "Computer Science & Engineering"; student profile states "CSE".',
    expectedEligible: true,
    mockStudent: {
      ...BASELINE_STUDENT,
      branch: 'CSE',
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        branches: ['Computer Science and Engineering'],
      },
    },
  },

  // 7. Ineligible college
  {
    id: 'TC-07',
    name: 'Ineligible Institutional Affiliation',
    description: 'Job is restricted to CET and Silicon; student is from an unlisted college.',
    expectedEligible: false,
    expectedFailedRule: 'COLLEGE',
    mockStudent: {
      ...BASELINE_STUDENT,
      college: 'Autonomous Engineering College Rourkela',
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        colleges: ['Silicon Institute of Technology', 'College of Engineering and Technology (OUTR)'],
      },
    },
  },

  // 8. Insufficient experience months
  {
    id: 'TC-08',
    name: 'Insufficient Verified Experience',
    description: 'Job mandates minimum 6 months experience; student has 2 verified months.',
    expectedEligible: false,
    expectedFailedRule: 'EXPERIENCE',
    mockStudent: { ...BASELINE_STUDENT },
    mockInternships: [
      {
        id: 'int_01',
        company: 'Local IT Services',
        role: 'Intern',
        startDate: '2024-05-01',
        endDate: '2024-06-30',
        description: '2 months web dev internship',
        skillsUsed: ['HTML', 'CSS'],
        createdAt: '2024-07-01',
        updatedAt: '2024-07-01',
      },
    ],
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        minExperienceMonths: 6,
      },
    },
  },

  // 9. Sufficient experience months
  {
    id: 'TC-09',
    name: 'Sufficient Verified Experience',
    description: 'Job mandates minimum 6 months experience; student has 8 verified months.',
    expectedEligible: true,
    mockStudent: { ...BASELINE_STUDENT },
    mockInternships: [
      {
        id: 'int_01',
        company: 'Tech Corp',
        role: 'Software Intern',
        startDate: '2023-06-01',
        endDate: '2024-02-01',
        description: '8 months backend development',
        skillsUsed: ['Python', 'Django'],
        createdAt: '2024-02-02',
        updatedAt: '2024-02-02',
      },
    ],
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        minExperienceMonths: 6,
      },
    },
  },

  // 10. Missing required certification
  {
    id: 'TC-10',
    name: 'Missing Required Professional Certification',
    description: 'Job mandates "AWS Cloud Practitioner"; student has no certifications.',
    expectedEligible: false,
    expectedFailedRule: 'REQUIRED_CERTIFICATIONS',
    mockStudent: { ...BASELINE_STUDENT },
    mockCertifications: [],
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        requiredCertifications: ['AWS Cloud Practitioner'],
      },
    },
  },

  // 11. Has all required certifications
  {
    id: 'TC-11',
    name: 'All Required Certifications Verified',
    description: 'Job requires "AWS Cloud Practitioner"; student holds verified credential.',
    expectedEligible: true,
    mockStudent: { ...BASELINE_STUDENT },
    mockCertifications: [
      {
        id: 'cert_01',
        name: 'AWS Certified Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2024-03-15',
        credentialId: 'AWS-9921',
        createdAt: '2024-03-15',
        updatedAt: '2024-03-15',
      },
    ],
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        requiredCertifications: ['AWS Cloud Practitioner'],
      },
    },
  },

  // 12. Missing required skill
  {
    id: 'TC-12',
    name: 'Missing Mandatory Technical Skill',
    description: 'Job requires "Go / Golang"; student does not possess the skill.',
    expectedEligible: false,
    expectedFailedRule: 'REQUIRED_SKILLS',
    mockStudent: { ...BASELINE_STUDENT },
    mockJob: {
      ...BASELINE_JOB,
      requiredSkills: [
        { name: 'Golang', requiredLevel: 60 },
      ],
    },
  },

  // 13. Has required skill but insufficient proficiency
  {
    id: 'TC-13',
    name: 'Skill Proficiency Below Required Threshold',
    description: 'Job requires Python >= 80%; student has verified Python at 65%.',
    expectedEligible: false,
    expectedFailedRule: 'REQUIRED_SKILLS',
    mockStudent: {
      ...BASELINE_STUDENT,
      skills: ['Python'],
      skillProficiencies: {
        Python: 65,
      },
    },
    mockJob: {
      ...BASELINE_JOB,
      requiredSkills: [
        { name: 'Python', requiredLevel: 80 },
      ],
    },
  },

  // 14. Has required skill with sufficient proficiency
  {
    id: 'TC-14',
    name: 'Skill Proficiency Meets Required Threshold',
    description: 'Job requires Python >= 70%; student has verified Python at 85%.',
    expectedEligible: true,
    mockStudent: {
      ...BASELINE_STUDENT,
      skills: ['Python'],
      skillProficiencies: {
        Python: 85,
      },
    },
    mockJob: {
      ...BASELINE_JOB,
      requiredSkills: [
        { name: 'Python', requiredLevel: 70 },
      ],
    },
  },

  // 15. Has required skills, missing preferred skill (Rule Independence)
  {
    id: 'TC-15',
    name: 'Missing Preferred Skill Does NOT Fail Eligibility',
    description: 'Student has required Python, but lacks preferred AWS. Result must be ELIGIBLE.',
    expectedEligible: true,
    mockStudent: {
      ...BASELINE_STUDENT,
      skills: ['Python'],
      skillProficiencies: {
        Python: 85,
      },
    },
    mockJob: {
      ...BASELINE_JOB,
      requiredSkills: [
        { name: 'Python', requiredLevel: 70 },
      ],
      preferredSkills: [
        { name: 'AWS Cloud', preferredLevel: 70 },
        { name: 'Docker', preferredLevel: 60 },
      ],
    },
  },

  // 16. Missing data rule (e.g. CGPA is null when required)
  {
    id: 'TC-16',
    name: 'Missing Data Rule — Missing CGPA Causes Definite Failure',
    description: 'Job requires CGPA 7.0; student profile has null/undefined CGPA. Must FAIL with clear reason.',
    expectedEligible: false,
    expectedFailedRule: 'CGPA',
    mockStudent: {
      ...BASELINE_STUDENT,
      cgpa: undefined as unknown as number,
    },
    mockJob: {
      ...BASELINE_JOB,
      eligibility: {
        ...BASELINE_JOB.eligibility!,
        minCgpa: 7.0,
      },
    },
  },
];

/**
 * Executes a single test case against the deterministic eligibility engine.
 */
export function executeTestCase(testCase: EligibilityTestCase): TestCaseExecutionResult {
  const evaluation = evaluateEligibility({
    student: testCase.mockStudent,
    job: testCase.mockJob,
    certifications: testCase.mockCertifications,
    internships: testCase.mockInternships,
    evaluatedBy: `TEST_CASE_${testCase.id}`,
  });

  const actualEligible = evaluation.eligible;
  const statusMatches = actualEligible === testCase.expectedEligible;

  let ruleMatches = true;
  if (!testCase.expectedEligible && testCase.expectedFailedRule) {
    const failedDetail = evaluation.rules.find((r) => r.rule === testCase.expectedFailedRule);
    ruleMatches = failedDetail?.result === 'FAIL';
  }

  const passed = statusMatches && ruleMatches;

  let notes = `Expected: ${testCase.expectedEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE'}, Got: ${
    actualEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE'
  }.`;
  if (!passed) {
    notes += ` Rule check failed: Expected ${testCase.expectedFailedRule} to FAIL.`;
  }

  return {
    testCase,
    evaluation,
    passed,
    actualEligible,
    notes,
  };
}

/**
 * Runs the entire test suite of 16 cases and returns aggregated results.
 */
export function runAllEligibilityTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestCaseExecutionResult[];
} {
  const results = ELIGIBILITY_TEST_CASES.map(executeTestCase);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}
