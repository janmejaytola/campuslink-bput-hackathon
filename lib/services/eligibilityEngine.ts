import { RecruiterJob, JobSkillRequirement } from '@/types/job';
import { StudentProfile, CertificationItem, InternshipItem } from '@/types/student';
import {
  EligibilityEvaluation,
  EligibilityRuleDetail,
  EligibilitySubItem,
  RuleResultStatus,
} from '@/types/eligibility';

/**
 * ============================================================================
 * CAMPUSLINK DETERMINISTIC STUDENT ELIGIBILITY ENGINE
 * ============================================================================
 *
 * Core Principle:
 * Eligibility is strictly DETERMINISTIC application code.
 * Gemini or LLMs must NEVER:
 *   - decide eligibility
 *   - rank students
 *   - override eligibility
 *   - guess missing student data
 *   - infer that a student satisfies a requirement
 *   - convert weak signals into eligibility
 *
 * Each rule produces:
 *   - PASS
 *   - FAIL
 *   - NOT_APPLICABLE
 *
 * Overall status:
 *   - ELIGIBLE: All applicable rules evaluated to PASS
 *   - NOT_ELIGIBLE: One or more applicable rules evaluated to FAIL
 *
 * Eligibility is completely decoupled from Match Score, Readiness Score,
 * Skill Gap Intelligence, or AI Recommendations.
 * ============================================================================
 */

/**
 * Normalizes strings by trimming and converting to lowercase for robust exact comparisons.
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Canonical Academic Branch Mapping.
 * Normalizes abbreviations to standardized canonical names.
 * Strictly avoids merging unrelated disciplines (e.g. Mechanical != Computer Science).
 */
const CANONICAL_BRANCH_MAP: Record<string, string> = {
  cse: 'computer science & engineering',
  cs: 'computer science & engineering',
  'computer science': 'computer science & engineering',
  'computer science engineering': 'computer science & engineering',
  'computer science and engineering': 'computer science & engineering',
  'computer science & engineering': 'computer science & engineering',

  it: 'information technology',
  'information tech': 'information technology',
  'information technology': 'information technology',

  ece: 'electronics & communication engineering',
  'electronics and communication': 'electronics & communication engineering',
  'electronics and communication engineering': 'electronics & communication engineering',
  'electronics & communication engineering': 'electronics & communication engineering',
  etc: 'electronics & telecommunication engineering',
  'electronics and telecommunication engineering': 'electronics & telecommunication engineering',

  ee: 'electrical engineering',
  'electrical engineering': 'electrical engineering',

  eee: 'electrical & electronics engineering',
  'electrical and electronics engineering': 'electrical & electronics engineering',
  'electrical & electronics engineering': 'electrical & electronics engineering',

  me: 'mechanical engineering',
  mech: 'mechanical engineering',
  'mechanical engineering': 'mechanical engineering',

  ce: 'civil engineering',
  civil: 'civil engineering',
  'civil engineering': 'civil engineering',

  che: 'chemical engineering',
  chemical: 'chemical engineering',
  'chemical engineering': 'chemical engineering',

  biotech: 'biotechnology',
  'bio technology': 'biotechnology',
  biotechnology: 'biotechnology',

  mca: 'master of computer applications',
  'master of computer applications': 'master of computer applications',
  bca: 'bachelor of computer applications',
  'bachelor of computer applications': 'bachelor of computer applications',
};

export function getCanonicalBranch(branch: string | null | undefined): string {
  if (!branch) return '';
  const normalized = normalizeText(branch);
  return CANONICAL_BRANCH_MAP[normalized] || normalized;
}

export function areBranchesEquivalent(b1: string, b2: string): boolean {
  if (!b1 || !b2) return false;
  const c1 = getCanonicalBranch(b1);
  const c2 = getCanonicalBranch(b2);
  return c1 === c2;
}

/**
 * Normalizes skill names for comparison.
 * Strictly prevents incorrect technology equivalence (e.g., Java != JavaScript, React != React Native).
 */
export function normalizeSkillName(skill: string | null | undefined): string {
  if (!skill) return '';
  return skill.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calculates total verified internship/work experience in months.
 * Parses explicit month numbers or calculates start/end dates.
 * Strictly ignores random projects or unverified resume keywords.
 */
export function calculateVerifiedExperienceMonths(internships: InternshipItem[] = []): number {
  if (!internships || internships.length === 0) return 0;

  let totalMonths = 0;

  for (const item of internships) {
    // 1. If startDate and endDate are valid ISO strings (YYYY-MM or YYYY-MM-DD)
    if (item.startDate) {
      const start = new Date(item.startDate);
      const end = item.endDate ? new Date(item.endDate) : new Date();

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const yearsDiff = end.getFullYear() - start.getFullYear();
        const monthsDiff = end.getMonth() - start.getMonth();
        const calculated = yearsDiff * 12 + monthsDiff;
        // At least 1 month if date is valid
        totalMonths += Math.max(1, calculated);
        continue;
      }
    }

    // 2. Fallback check for description or role mention like "3 months", "6 months"
    const durationMatch = (item.description || item.role || '').match(/(\d+)\s*(?:month|months|mo)/i);
    if (durationMatch && durationMatch[1]) {
      const parsed = parseInt(durationMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) {
        totalMonths += parsed;
        continue;
      }
    }

    // Default to minimum 1 verified month per structured internship record if listed
    totalMonths += 1;
  }

  return totalMonths;
}

// ----------------------------------------------------------------------------
// RULE EVALUATORS
// ----------------------------------------------------------------------------

/**
 * Rule 1: CGPA
 */
export function evaluateCgpaRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): EligibilityRuleDetail {
  const minCgpa = job.eligibility?.minCgpa;

  if (minCgpa === null || minCgpa === undefined || isNaN(Number(minCgpa))) {
    return {
      rule: 'CGPA',
      ruleName: 'Minimum CGPA Cutoff',
      requirement: 'No minimum CGPA required',
      actual: student.cgpa !== undefined && student.cgpa !== null ? `${student.cgpa}` : 'Not provided',
      result: 'NOT_APPLICABLE',
      reason: 'The employer has not set a minimum CGPA eligibility barrier for this position.',
    };
  }

  const reqNum = Number(minCgpa);
  const studentCgpa = student.cgpa;

  if (studentCgpa === undefined || studentCgpa === null || isNaN(Number(studentCgpa))) {
    return {
      rule: 'CGPA',
      ruleName: 'Minimum CGPA Cutoff',
      requirement: `Minimum CGPA of ${reqNum.toFixed(2)}`,
      actual: 'Missing / Null',
      result: 'FAIL',
      reason: 'CGPA is required by this job, but the student profile is missing a verified CGPA.',
    };
  }

  const actualNum = Number(studentCgpa);
  const passed = actualNum >= reqNum;

  return {
    rule: 'CGPA',
    ruleName: 'Minimum CGPA Cutoff',
    requirement: `Minimum CGPA of ${reqNum.toFixed(2)}`,
    actual: `${actualNum.toFixed(2)}`,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `Student CGPA (${actualNum.toFixed(2)}) meets or exceeds the required threshold of ${reqNum.toFixed(2)}.`
      : `Student CGPA (${actualNum.toFixed(2)}) is below the required cutoff of ${reqNum.toFixed(2)}.`,
  };
}

/**
 * Rule 2: Backlogs
 */
export function evaluateBacklogsRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): EligibilityRuleDetail {
  const maxBacklogs = job.eligibility?.maxBacklogs;

  if (maxBacklogs === null || maxBacklogs === undefined || isNaN(Number(maxBacklogs))) {
    return {
      rule: 'BACKLOGS',
      ruleName: 'Active Backlog Limit',
      requirement: 'No backlog restriction specified',
      actual: student.backlogs !== undefined && student.backlogs !== null ? `${student.backlogs}` : 'Not provided',
      result: 'NOT_APPLICABLE',
      reason: 'The employer has not specified any restriction on active student backlogs.',
    };
  }

  const maxAllowed = Number(maxBacklogs);
  const studentBacklogs = student.backlogs;

  if (studentBacklogs === undefined || studentBacklogs === null || isNaN(Number(studentBacklogs))) {
    return {
      rule: 'BACKLOGS',
      ruleName: 'Active Backlog Limit',
      requirement: `Maximum ${maxAllowed} active backlog(s)`,
      actual: 'Missing / Null',
      result: 'FAIL',
      reason: 'Maximum backlog limit is specified, but student active backlogs count is missing.',
    };
  }

  const actualNum = Number(studentBacklogs);
  const passed = actualNum <= maxAllowed;

  return {
    rule: 'BACKLOGS',
    ruleName: 'Active Backlog Limit',
    requirement: `Maximum ${maxAllowed} active backlog(s)`,
    actual: `${actualNum}`,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `Student active backlogs (${actualNum}) is within the permitted allowance of ${maxAllowed}.`
      : `Student has ${actualNum} active backlog(s), which exceeds the permitted maximum of ${maxAllowed}.`,
  };
}

/**
 * Rule 3: Graduation Year
 */
export function evaluateGraduationYearRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): EligibilityRuleDetail {
  const eligibleYears = (job.eligibility?.graduationYears || [])
    .map((y) => String(y).trim())
    .filter(Boolean);

  if (eligibleYears.length === 0) {
    return {
      rule: 'GRADUATION_YEAR',
      ruleName: 'Eligible Graduation Batch',
      requirement: 'Open to all graduation batches',
      actual: student.graduationYear ? String(student.graduationYear).trim() : 'Not provided',
      result: 'NOT_APPLICABLE',
      reason: 'No restrictions on student graduation batch year.',
    };
  }

  const studentYear = student.graduationYear ? String(student.graduationYear).trim() : '';

  if (!studentYear) {
    return {
      rule: 'GRADUATION_YEAR',
      ruleName: 'Eligible Graduation Batch',
      requirement: `Batch ${eligibleYears.join(' or ')}`,
      actual: 'Missing / Null',
      result: 'FAIL',
      reason: 'Job requires specific graduation batch year, but the student graduation year is missing.',
    };
  }

  const passed = eligibleYears.includes(studentYear);

  return {
    rule: 'GRADUATION_YEAR',
    ruleName: 'Eligible Graduation Batch',
    requirement: `Batch ${eligibleYears.join(' or ')}`,
    actual: studentYear,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `Student graduation year (${studentYear}) belongs to the eligible batch list (${eligibleYears.join(', ')}).`
      : `Student graduation year (${studentYear}) is not eligible. Allowed batches: ${eligibleYears.join(', ')}.`,
  };
}

/**
 * Rule 4: Branch
 */
export function evaluateBranchRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): EligibilityRuleDetail {
  const eligibleBranches = (job.eligibility?.branches || [])
    .map((b) => b.trim())
    .filter(Boolean);

  if (eligibleBranches.length === 0) {
    return {
      rule: 'BRANCH',
      ruleName: 'Eligible Academic Branch',
      requirement: 'Open to all academic disciplines / branches',
      actual: student.branch ? student.branch.trim() : 'Not provided',
      result: 'NOT_APPLICABLE',
      reason: 'No restrictions on academic branch or discipline.',
    };
  }

  const studentBranch = student.branch ? student.branch.trim() : '';

  if (!studentBranch) {
    return {
      rule: 'BRANCH',
      ruleName: 'Eligible Academic Branch',
      requirement: `Allowed branches: ${eligibleBranches.join(', ')}`,
      actual: 'Missing / Null',
      result: 'FAIL',
      reason: 'Eligible branches are specified by the employer, but student branch is missing.',
    };
  }

  // Check matching with canonical branch normalization
  const passed = eligibleBranches.some((b) => areBranchesEquivalent(b, studentBranch));

  return {
    rule: 'BRANCH',
    ruleName: 'Eligible Academic Branch',
    requirement: `Allowed branches: ${eligibleBranches.join(', ')}`,
    actual: studentBranch,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `Student branch (${studentBranch}) matches eligible discipline criteria.`
      : `Student branch (${studentBranch}) is not in the eligible branches list (${eligibleBranches.join(', ')}).`,
  };
}

/**
 * Rule 5: College
 */
export function evaluateCollegeRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): EligibilityRuleDetail {
  const eligibleColleges = (job.eligibility?.colleges || [])
    .map((c) => c.trim())
    .filter(Boolean);

  if (eligibleColleges.length === 0) {
    return {
      rule: 'COLLEGE',
      ruleName: 'Eligible Institutional Affiliation',
      requirement: 'Open to all registered / affiliated institutes',
      actual: student.college ? student.college.trim() : 'Not provided',
      result: 'NOT_APPLICABLE',
      reason: 'The employer has not restricted eligibility to specific colleges.',
    };
  }

  const studentCollege = student.college ? student.college.trim() : '';

  if (!studentCollege) {
    return {
      rule: 'COLLEGE',
      ruleName: 'Eligible Institutional Affiliation',
      requirement: `Allowed colleges: ${eligibleColleges.join(', ')}`,
      actual: 'Missing / Null',
      result: 'FAIL',
      reason: 'Eligible colleges are specified, but student institute affiliation is missing.',
    };
  }

  const normStudentCollege = normalizeText(studentCollege);
  const passed = eligibleColleges.some((c) => normalizeText(c) === normStudentCollege);

  return {
    rule: 'COLLEGE',
    ruleName: 'Eligible Institutional Affiliation',
    requirement: `Allowed colleges: ${eligibleColleges.join(', ')}`,
    actual: studentCollege,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `Student college (${studentCollege}) matches authorized hiring institutions.`
      : `Student college (${studentCollege}) is not on the list of eligible colleges (${eligibleColleges.join(', ')}).`,
  };
}

/**
 * Rule 6: Experience
 */
export function evaluateExperienceRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>,
  internships: InternshipItem[] = []
): EligibilityRuleDetail {
  const minMonths = Number(job.eligibility?.minExperienceMonths || 0);

  if (minMonths <= 0) {
    const verifiedMonths = calculateVerifiedExperienceMonths(internships);
    return {
      rule: 'EXPERIENCE',
      ruleName: 'Minimum Prior Experience',
      requirement: '0 months (Fresher / No prior experience required)',
      actual: `${verifiedMonths} month(s) verified`,
      result: 'NOT_APPLICABLE',
      reason: 'Fresher eligible. No minimum prior employment or internship experience is mandated.',
    };
  }

  const verifiedMonths = calculateVerifiedExperienceMonths(internships);
  const passed = verifiedMonths >= minMonths;

  return {
    rule: 'EXPERIENCE',
    ruleName: 'Minimum Prior Experience',
    requirement: `Minimum ${minMonths} month(s) verified internship / employment`,
    actual: `${verifiedMonths} month(s)`,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `Student possesses ${verifiedMonths} verified experience month(s), meeting the required ${minMonths} month(s).`
      : `Student possesses ${verifiedMonths} verified experience month(s), below the required minimum of ${minMonths} month(s).`,
  };
}

/**
 * Rule 7: Required Certifications
 */
export function evaluateCertificationsRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>,
  certifications: CertificationItem[] = []
): EligibilityRuleDetail {
  const requiredCerts = (job.eligibility?.requiredCertifications || [])
    .map((c) => c.trim())
    .filter(Boolean);

  if (requiredCerts.length === 0) {
    return {
      rule: 'REQUIRED_CERTIFICATIONS',
      ruleName: 'Mandatory Professional Certifications',
      requirement: 'None required',
      actual: certifications.length > 0 ? `${certifications.length} certification(s) recorded` : 'None',
      result: 'NOT_APPLICABLE',
      reason: 'No mandatory professional certifications required for this position.',
    };
  }

  const studentCertNames = certifications.map((c) => normalizeText(c.name));
  const subItems: EligibilitySubItem[] = [];
  const missingCerts: string[] = [];

  for (const req of requiredCerts) {
    const normReq = normalizeText(req);
    // Exact or normalized containment match for certified title
    const found = studentCertNames.some((c) => c === normReq || c.includes(normReq) || normReq.includes(c));

    if (found) {
      subItems.push({
        name: req,
        required: 'Verified certification required',
        actual: 'Verified present',
        status: 'PASS',
      });
    } else {
      missingCerts.push(req);
      subItems.push({
        name: req,
        required: 'Verified certification required',
        actual: 'Not found in profile',
        status: 'FAIL',
        reason: `Student does not possess verified certification: ${req}`,
      });
    }
  }

  const passed = missingCerts.length === 0;

  return {
    rule: 'REQUIRED_CERTIFICATIONS',
    ruleName: 'Mandatory Professional Certifications',
    requirement: `Must hold all: ${requiredCerts.join(', ')}`,
    actual: passed ? 'All required present' : `Missing: ${missingCerts.join(', ')}`,
    result: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? `All ${requiredCerts.length} mandatory certification(s) verified in student profile.`
      : `Student is missing ${missingCerts.length} required certification(s): ${missingCerts.join(', ')}.`,
    subItems,
  };
}

/**
 * Rule 8: Required Skills
 *
 * Checks student's verified skills and skillProficiencies against mandatory requirements.
 * Preferred skills DO NOT participate in eligibility (handled separately).
 * Missing proficiency for a mandatory skill conservatively causes failure as per specification.
 */
export function evaluateRequiredSkillsRule(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): EligibilityRuleDetail {
  const reqSkills: JobSkillRequirement[] = job.requiredSkills || [];

  if (reqSkills.length === 0) {
    return {
      rule: 'REQUIRED_SKILLS',
      ruleName: 'Mandatory Technical Skills & Proficiency',
      requirement: 'No mandatory skills specified',
      actual: student.skills?.length ? `${student.skills.length} skill(s) listed` : 'None',
      result: 'NOT_APPLICABLE',
      reason: 'No mandatory technical skills or minimum proficiency levels specified.',
    };
  }

  const studentSkills = (student.skills || []).map((s) => normalizeSkillName(s));
  const proficiencies = student.skillProficiencies || {};

  // Build a lookup map of normalized skill names to student proficiency
  const normalizedProficiencies: Record<string, number> = {};
  Object.entries(proficiencies).forEach(([k, v]) => {
    normalizedProficiencies[normalizeSkillName(k)] = Number(v);
  });

  const subItems: EligibilitySubItem[] = [];
  let allPass = true;
  const failureReasons: string[] = [];

  for (const skillReq of reqSkills) {
    const normName = normalizeSkillName(skillReq.name);
    const requiredLevel = Number(skillReq.requiredLevel || 0);

    const hasSkillInList = studentSkills.includes(normName);
    const studentProficiency = normalizedProficiencies[normName];

    if (!hasSkillInList && studentProficiency === undefined) {
      allPass = false;
      const msg = `Student does not possess required skill: ${skillReq.name}`;
      failureReasons.push(msg);
      subItems.push({
        name: skillReq.name,
        required: `Proficiency >= ${requiredLevel}%`,
        actual: 'Not listed',
        status: 'FAIL',
        reason: msg,
      });
      continue;
    }

    // Skill is in list, but proficiency is missing/unverified
    if (studentProficiency === undefined || isNaN(studentProficiency)) {
      allPass = false;
      const msg = `Required skill proficiency for '${skillReq.name}' could not be verified`;
      failureReasons.push(msg);
      subItems.push({
        name: skillReq.name,
        required: `Proficiency >= ${requiredLevel}%`,
        actual: 'Listed without verified level',
        status: 'FAIL',
        reason: msg,
      });
      continue;
    }

    // Proficiency exists: compare against required level
    if (studentProficiency >= requiredLevel) {
      subItems.push({
        name: skillReq.name,
        required: `Proficiency >= ${requiredLevel}%`,
        actual: `${studentProficiency}%`,
        status: 'PASS',
        reason: `Student proficiency (${studentProficiency}%) meets or exceeds required (${requiredLevel}%).`,
      });
    } else {
      allPass = false;
      const msg = `Proficiency for '${skillReq.name}' (${studentProficiency}%) is below required ${requiredLevel}%`;
      failureReasons.push(msg);
      subItems.push({
        name: skillReq.name,
        required: `Proficiency >= ${requiredLevel}%`,
        actual: `${studentProficiency}%`,
        status: 'FAIL',
        reason: msg,
      });
    }
  }

  return {
    rule: 'REQUIRED_SKILLS',
    ruleName: 'Mandatory Technical Skills & Proficiency',
    requirement: `Must satisfy all ${reqSkills.length} mandatory skill criteria`,
    actual: allPass ? 'All verified & proficient' : `${failureReasons.length} requirement(s) failed`,
    result: allPass ? 'PASS' : 'FAIL',
    reason: allPass
      ? `Student satisfies all ${reqSkills.length} mandatory skill proficiency thresholds.`
      : `Skill criteria unsatisfied: ${failureReasons.join('; ')}.`,
    subItems,
  };
}

/**
 * Evaluates the full deterministic eligibility for a student against a job.
 * Pure function: No Firestore calls, no LLMs, zero side-effects.
 */
export function evaluateEligibility(params: {
  student: Partial<StudentProfile>;
  job: Partial<RecruiterJob>;
  certifications?: CertificationItem[];
  internships?: InternshipItem[];
  evaluatedBy?: string;
}): EligibilityEvaluation {
  const { student, job, certifications = [], internships = [], evaluatedBy } = params;

  const rules: EligibilityRuleDetail[] = [
    evaluateCgpaRule(student, job),
    evaluateBacklogsRule(student, job),
    evaluateGraduationYearRule(student, job),
    evaluateBranchRule(student, job),
    evaluateCollegeRule(student, job),
    evaluateExperienceRule(student, job, internships),
    evaluateCertificationsRule(student, job, certifications),
    evaluateRequiredSkillsRule(student, job),
  ];

  let passedRules = 0;
  let failedRules = 0;
  let notApplicableRules = 0;

  for (const r of rules) {
    if (r.result === 'PASS') passedRules++;
    else if (r.result === 'FAIL') failedRules++;
    else if (r.result === 'NOT_APPLICABLE') notApplicableRules++;
  }

  // Pure deterministic decision: Any failure makes candidate NOT_ELIGIBLE
  const eligible = failedRules === 0;

  // Informational note regarding Preferred Skills
  let preferredSkillsNote: string | undefined;
  if (job.preferredSkills && job.preferredSkills.length > 0) {
    const studentSkills = (student.skills || []).map((s) => normalizeSkillName(s));
    const matchingPreferred = job.preferredSkills.filter((p) =>
      studentSkills.includes(normalizeSkillName(p.name))
    );
    preferredSkillsNote = `Preferred skills (${job.preferredSkills
      .map((p) => p.name)
      .join(', ')}) do NOT participate in eligibility determination. Student possesses ${
      matchingPreferred.length
    } of ${job.preferredSkills.length} preferred skills.`;
  }

  return {
    jobId: job.id || 'unassigned_job',
    studentId: student.uid || 'unassigned_student',
    jobTitle: job.title || 'Untitled Job',
    company: job.company || 'Unknown Company',
    eligible,
    status: eligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
    evaluatedAt: new Date().toISOString(),
    rules,
    summary: {
      totalRules: rules.length,
      passedRules,
      failedRules,
      notApplicableRules,
    },
    preferredSkillsNote,
    evaluatedBy: evaluatedBy || 'DETERMINISTIC_ENGINE_V1',
  };
}
