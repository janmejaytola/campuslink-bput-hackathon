import { RecruiterJob, JobSkillRequirement, JobPreferredSkill, WorkMode } from '@/types/job';
import {
  StudentProfile,
  ProjectItem,
  CertificationItem,
  InternshipItem,
  CareerGoal,
} from '@/types/student';
import { EligibilityEvaluation } from '@/types/eligibility';
import {
  CandidateMatchResult,
  MatchBreakdown,
  MatchComponentScore,
  MatchComponentStatus,
  RankedCandidate,
} from '@/types/matching';

/**
 * ============================================================================
 * CAMPUSLINK EXPLAINABLE DETERMINISTIC CANDIDATE MATCHING ENGINE
 * ============================================================================
 *
 * Core Principle:
 *   Eligibility answers: "Does this student meet the mandatory requirements?"
 *   Matching answers:    "How strongly does this eligible student match this role?"
 *
 * Requirements:
 *   - Strictly deterministic, explainable, reproducible.
 *   - Pure functional execution with zero LLM/Gemini dependencies.
 *   - Completely decoupled from eligibility, placement readiness, and skill gaps.
 *   - Mandatory ELIGIBILITY GATE: If eligibility.status !== 'ELIGIBLE', the candidate
 *     is marked eligible: false, rankingEligible: false, and is NEVER ranked
 *     in the final shortlist.
 *   - 7 canonical dimensions totaling 100% base weight:
 *       1. Required Skill Match:         45%
 *       2. Preferred Skill Match:        15%
 *       3. Project Relevance:            15%
 *       4. Experience Relevance:         10%
 *       5. Certification Relevance:       5%
 *       6. Career Goal Alignment:         5%
 *       7. Location / Work Mode Alignment: 5%
 *   - Transparent score normalization when categories are NOT_APPLICABLE.
 *   - Strict normalization rules without aggressive fuzzy false positives
 *     (Java != JavaScript, React != Angular, AWS != Azure, SQL != MongoDB).
 * ============================================================================
 */

export const BASE_MATCH_WEIGHTS = {
  requiredSkills: 45,
  preferredSkills: 15,
  projects: 15,
  experience: 10,
  certifications: 5,
  careerGoal: 5,
  locationWorkMode: 5,
} as const;

/* ============================================================================
 * REUSABLE NORMALIZATION UTILITIES
 * ============================================================================ */

export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalizes skill names for exact & canonical matching.
 * Preserves strict technological boundaries (Python != Java != JavaScript).
 */
const CANONICAL_SKILL_MAP: Record<string, string> = {
  python: 'python',
  python3: 'python',
  py: 'python',

  java: 'java',
  'core java': 'java',
  'java se': 'java',

  javascript: 'javascript',
  js: 'javascript',
  'es6': 'javascript',
  'es6+': 'javascript',

  typescript: 'typescript',
  ts: 'typescript',

  'c++': 'c++',
  cpp: 'c++',

  'c#': 'c#',
  csharp: 'c#',

  c: 'c',

  react: 'react',
  'react.js': 'react',
  reactjs: 'react',

  'react native': 'react native',

  angular: 'angular',
  angularjs: 'angular',

  vue: 'vue',
  'vue.js': 'vue',
  vuejs: 'vue',

  node: 'node.js',
  nodejs: 'node.js',
  'node.js': 'node.js',

  express: 'express',
  'express.js': 'express',

  sql: 'sql',
  mysql: 'mysql',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  redis: 'redis',

  aws: 'aws',
  'amazon web services': 'aws',
  azure: 'azure',
  'microsoft azure': 'azure',
  gcp: 'gcp',
  'google cloud platform': 'gcp',

  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',

  git: 'git',
  github: 'github',

  html: 'html',
  html5: 'html',
  css: 'css',
  css3: 'css',
  tailwind: 'tailwind css',
  tailwindcss: 'tailwind css',

  'data structures': 'data structures',
  dsa: 'data structures',
  'data structures and algorithms': 'data structures',
  'data structures & algorithms': 'data structures',

  'machine learning': 'machine learning',
  ml: 'machine learning',
  'deep learning': 'deep learning',
  dl: 'deep learning',
  ai: 'artificial intelligence',
  'artificial intelligence': 'artificial intelligence',
  nlp: 'natural language processing',

  pandas: 'pandas',
  numpy: 'numpy',
  'scikit-learn': 'scikit-learn',
  sklearn: 'scikit-learn',
  pytorch: 'pytorch',
  tensorflow: 'tensorflow',
};

export function normalizeSkillName(skill: string | null | undefined): string {
  if (!skill) return '';
  const cleaned = normalizeText(skill);
  return CANONICAL_SKILL_MAP[cleaned] || cleaned;
}

export function areSkillsMatching(s1: string, s2: string): boolean {
  if (!s1 || !s2) return false;
  return normalizeSkillName(s1) === normalizeSkillName(s2);
}

/**
 * Normalizes location strings.
 */
export function normalizeLocation(loc: string | null | undefined): string {
  if (!loc) return '';
  const cleaned = normalizeText(loc).replace(/[,/\\-]/g, ' ');
  return cleaned;
}

export function areLocationsMatching(studentLoc: string, jobLoc: string): boolean {
  if (!studentLoc || !jobLoc) return false;
  const nStudent = normalizeLocation(studentLoc);
  const nJob = normalizeLocation(jobLoc);

  if (nStudent.includes('anywhere') || nStudent.includes('open to all') || nStudent.includes('india')) {
    return true;
  }
  if (nJob.includes('remote') || nStudent.includes('remote')) {
    return true;
  }

  // Check city matches
  const majorCities = [
    'bhubaneswar',
    'bengaluru',
    'bangalore',
    'hyderabad',
    'pune',
    'chennai',
    'mumbai',
    'delhi',
    'noida',
    'gurgaon',
    'kolkata',
  ];

  for (const city of majorCities) {
    const studentHas = nStudent.includes(city) || (city === 'bengaluru' && nStudent.includes('bangalore')) || (city === 'bangalore' && nStudent.includes('bengaluru'));
    const jobHas = nJob.includes(city) || (city === 'bengaluru' && nJob.includes('bangalore')) || (city === 'bangalore' && nJob.includes('bengaluru'));
    if (studentHas && jobHas) return true;
  }

  return nJob.includes(nStudent) || nStudent.includes(nJob);
}

/**
 * Normalizes work mode strings (ON_SITE, HYBRID, REMOTE).
 */
export function normalizeWorkMode(mode: string | null | undefined): WorkMode | 'ANY' {
  if (!mode) return 'ANY';
  const c = normalizeText(mode);
  if (c.includes('remote')) return 'REMOTE';
  if (c.includes('hybrid')) return 'HYBRID';
  if (c.includes('on-site') || c.includes('onsite') || c.includes('office')) return 'ON_SITE';
  return 'ANY';
}

/**
 * Canonical Role Families for deterministic alignment scoring.
 */
const ROLE_FAMILIES: Record<string, string[]> = {
  software_engineering: [
    'software engineer',
    'graduate software engineer',
    'systems development engineer',
    'sde',
    'sde-i',
    'sde 1',
    'junior software engineer',
    'associate software engineer',
    'backend developer',
    'backend engineer',
  ],
  full_stack: [
    'full stack developer',
    'full stack engineer',
    'web developer',
    'frontend developer',
    'frontend engineer',
    'ui engineer',
  ],
  data_ai: [
    'data analyst',
    'associate data analyst',
    'business analyst',
    'data scientist',
    'ai/ml engineer',
    'machine learning engineer',
    'ai engineer',
  ],
  cloud_devops: [
    'cloud engineer',
    'associate cloud consultant',
    'devops engineer',
    'cloud consultant',
    'site reliability engineer',
    'sre',
    'infrastructure engineer',
  ],
  systems_embedded: [
    'embedded systems engineer',
    'firmware engineer',
    'iot engineer',
    'hardware engineer',
    'vlsi engineer',
  ],
};

export function getRoleFamily(roleTitle: string | null | undefined): string | null {
  if (!roleTitle) return null;
  const n = normalizeText(roleTitle);

  for (const [family, roles] of Object.entries(ROLE_FAMILIES)) {
    for (const r of roles) {
      if (n === r || n.includes(r) || r.includes(n)) {
        return family;
      }
    }
  }
  return null;
}

/* ============================================================================
 * COMPONENT EVALUATORS
 * ============================================================================ */

/**
 * Component 1: Required Skills (Base: 45%)
 */
export function evaluateRequiredSkillsMatch(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  const reqSkills = job.requiredSkills || [];

  if (reqSkills.length === 0) {
    return {
      score: 0,
      status: 'NOT_APPLICABLE',
      reason: 'Job opening has no mandatory required technical skills specified.',
      details: { totalCount: 0, matchedCount: 0, items: [] },
      strengths: [],
      gaps: [],
    };
  }

  const studentSkills = (student.skills || []).map((s) => normalizeSkillName(s));
  const proficiencies = student.skillProficiencies || {};

  const items: Array<{
    name: string;
    targetLevel: number;
    actualLevel: number;
    ratio: number;
    status: string;
  }> = [];

  const strengths: string[] = [];
  const gaps: string[] = [];
  let totalRatio = 0;

  for (const req of reqSkills) {
    const normReqName = normalizeSkillName(req.name);
    const targetLevel = req.requiredLevel > 0 ? req.requiredLevel : 70;

    // Check proficiency map by exact or normalized key
    let actualLevel = 0;
    for (const [profSkill, level] of Object.entries(proficiencies)) {
      if (normalizeSkillName(profSkill) === normReqName) {
        actualLevel = typeof level === 'number' ? level : 0;
        break;
      }
    }

    // Fallback: If in student.skills array but missing from proficiencies map
    if (actualLevel === 0 && studentSkills.includes(normReqName)) {
      actualLevel = 75; // Baseline credited proficiency for verified listed skill
    }

    const ratio = Math.min(1, Math.max(0, actualLevel / targetLevel));
    totalRatio += ratio;

    const itemStatus = ratio >= 1 ? 'FULL_MATCH' : ratio >= 0.75 ? 'STRONG_MATCH' : ratio > 0 ? 'PARTIAL_MATCH' : 'MISSING';
    items.push({
      name: req.name,
      targetLevel,
      actualLevel,
      ratio: Math.round(ratio * 100) / 100,
      status: itemStatus,
    });

    if (ratio >= 0.85) {
      strengths.push(`Strong required competency: ${req.name} (${actualLevel}% vs ${targetLevel}% required)`);
    } else if (ratio < 0.7) {
      gaps.push(`Required skill deficit: ${req.name} (Demonstrated ${actualLevel}% vs ${targetLevel}% required)`);
    }
  }

  const averageRatio = totalRatio / reqSkills.length;
  const score = Math.round(averageRatio * 1000) / 10; // 0-100 to 1 decimal place

  return {
    score: Math.min(100, Math.max(0, score)),
    status: 'APPLICABLE',
    reason: `Candidate satisfies ${Math.round(averageRatio * 100)}% of required skill expectations across ${reqSkills.length} competencies.`,
    details: {
      totalCount: reqSkills.length,
      matchedCount: items.filter((i) => i.ratio >= 0.7).length,
      items,
    },
    strengths,
    gaps,
  };
}

/**
 * Component 2: Preferred Skills (Base: 15%)
 */
export function evaluatePreferredSkillsMatch(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  const prefSkills = job.preferredSkills || [];

  if (prefSkills.length === 0) {
    return {
      score: 0,
      status: 'NOT_APPLICABLE',
      reason: 'Job opening has no optional preferred skills specified.',
      details: { totalCount: 0, matchedCount: 0, items: [] },
      strengths: [],
      gaps: [],
    };
  }

  const studentSkills = (student.skills || []).map((s) => normalizeSkillName(s));
  const proficiencies = student.skillProficiencies || {};

  const items: Array<{
    name: string;
    targetLevel: number;
    actualLevel: number;
    ratio: number;
    status: string;
  }> = [];

  const strengths: string[] = [];
  const gaps: string[] = [];
  let totalRatio = 0;

  for (const pref of prefSkills) {
    const normPrefName = normalizeSkillName(pref.name);
    const targetLevel = pref.preferredLevel > 0 ? pref.preferredLevel : 60;

    let actualLevel = 0;
    for (const [profSkill, level] of Object.entries(proficiencies)) {
      if (normalizeSkillName(profSkill) === normPrefName) {
        actualLevel = typeof level === 'number' ? level : 0;
        break;
      }
    }

    if (actualLevel === 0 && studentSkills.includes(normPrefName)) {
      actualLevel = 70;
    }

    const ratio = Math.min(1, Math.max(0, actualLevel / targetLevel));
    totalRatio += ratio;

    const itemStatus = ratio >= 0.8 ? 'PREFERRED_PRESENT' : ratio > 0 ? 'PARTIAL' : 'NOT_DEMONSTRATED';
    items.push({
      name: pref.name,
      targetLevel,
      actualLevel,
      ratio: Math.round(ratio * 100) / 100,
      status: itemStatus,
    });

    if (ratio >= 0.8) {
      strengths.push(`Preferred advantage: Demonstrated ${pref.name} (${actualLevel}% proficiency)`);
    } else if (ratio === 0) {
      gaps.push(`Preferred skill not demonstrated: ${pref.name}`);
    }
  }

  const averageRatio = totalRatio / prefSkills.length;
  const score = Math.round(averageRatio * 1000) / 10;

  return {
    score: Math.min(100, Math.max(0, score)),
    status: 'APPLICABLE',
    reason: `Candidate matches ${Math.round(averageRatio * 100)}% of preferred skill criteria across ${prefSkills.length} competencies.`,
    details: {
      totalCount: prefSkills.length,
      matchedCount: items.filter((i) => i.ratio > 0).length,
      items,
    },
    strengths,
    gaps,
  };
}

/**
 * Component 3: Project Relevance (Base: 15%)
 */
export function evaluateProjectRelevance(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>,
  projects: ProjectItem[] = []
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  if (!projects || projects.length === 0) {
    return {
      score: 0,
      status: 'NOT_APPLICABLE',
      reason: 'No showcase projects recorded in student profile dossier.',
      details: { projectCount: 0, evaluatedProjects: [] },
      strengths: [],
      gaps: ['No showcase projects recorded in verified profile'],
    };
  }

  const allJobSkills = [
    ...(job.requiredSkills || []).map((s) => normalizeSkillName(s.name)),
    ...(job.preferredSkills || []).map((s) => normalizeSkillName(s.name)),
  ];

  const jobDescWords = normalizeText(job.description).split(/[^a-z0-9+#.]+/).filter((w) => w.length > 2);
  const jobTitleNorm = normalizeText(job.title);

  const evaluatedProjects: Array<{
    title: string;
    techOverlapCount: number;
    techScore: number;
    roleScore: number;
    domainScore: number;
    projectScore: number;
    matchingTechnologies: string[];
  }> = [];

  for (const proj of projects) {
    const projTechs = (proj.technologies || []).map((t) => normalizeSkillName(t));
    const matchingTechnologies = projTechs.filter((t) => allJobSkills.some((js) => js === t || t.includes(js) || js.includes(t)));

    // 1. Tech score (0-100)
    const techScore = allJobSkills.length > 0
      ? Math.min(100, Math.round((matchingTechnologies.length / Math.min(allJobSkills.length, 3)) * 100))
      : matchingTechnologies.length > 0 ? 80 : 50;

    // 2. Role score (0-100)
    const projTitleNorm = normalizeText(proj.title);
    const projRoleNorm = normalizeText(proj.role);
    let roleScore = 40;
    if (getRoleFamily(jobTitleNorm) && (getRoleFamily(jobTitleNorm) === getRoleFamily(projTitleNorm) || getRoleFamily(jobTitleNorm) === getRoleFamily(projRoleNorm))) {
      roleScore = 95;
    } else if (jobDescWords.some((w) => projTitleNorm.includes(w) || projRoleNorm.includes(w))) {
      roleScore = 75;
    }

    // 3. Domain score (0-100)
    const projDescWords = normalizeText(proj.description).split(/[^a-z0-9+#.]+/).filter((w) => w.length > 2);
    const overlapWords = projDescWords.filter((w) => jobDescWords.includes(w));
    const domainScore = Math.min(100, overlapWords.length * 15);

    const projectScore = Math.min(100, Math.round(techScore * 0.55 + roleScore * 0.3 + domainScore * 0.15));

    evaluatedProjects.push({
      title: proj.title,
      techOverlapCount: matchingTechnologies.length,
      techScore,
      roleScore,
      domainScore,
      projectScore,
      matchingTechnologies,
    });
  }

  // Sort descending by projectScore
  evaluatedProjects.sort((a, b) => b.projectScore - a.projectScore);
  const bestProject = evaluatedProjects[0];

  // Primary project plus depth bonus for multiple relevant projects (up to +15 pts, capped at 100)
  const additionalRelevant = evaluatedProjects.slice(1).filter((p) => p.projectScore >= 60).length;
  const depthBonus = Math.min(15, additionalRelevant * 7.5);
  const finalScore = Math.min(100, Math.round((bestProject.projectScore * 0.85 + depthBonus + (bestProject.projectScore >= 80 ? 15 : 0)) * 10) / 10);

  const strengths: string[] = [];
  const gaps: string[] = [];

  if (bestProject.projectScore >= 70) {
    strengths.push(
      `Relevant project '${bestProject.title}' demonstrates technology overlap (${bestProject.matchingTechnologies.join(', ') || 'Domain aligned'})`
    );
  } else {
    gaps.push(`Project portfolio has limited direct overlap with position technology stack.`);
  }

  return {
    score: finalScore,
    status: 'APPLICABLE',
    reason: `Evaluated ${projects.length} showcase project(s). Highest relevance project '${bestProject.title}' scored ${bestProject.projectScore}/100.`,
    details: {
      projectCount: projects.length,
      bestProjectScore: bestProject.projectScore,
      evaluatedProjects,
    },
    strengths,
    gaps,
  };
}

/**
 * Component 4: Experience Relevance (Base: 10%)
 */
export function evaluateExperienceRelevance(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>,
  internships: InternshipItem[] = []
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  const minRequiredMonths = job.eligibility?.minExperienceMonths || 0;

  if (!internships || internships.length === 0) {
    if (minRequiredMonths === 0) {
      return {
        score: 0,
        status: 'NOT_APPLICABLE',
        reason: 'Position does not require prior experience and candidate has no internships recorded.',
        details: { internshipCount: 0 },
        strengths: [],
        gaps: [],
      };
    }
    return {
      score: 0,
      status: 'APPLICABLE',
      reason: `Position expects prior experience (${minRequiredMonths} months), but student profile lists 0 internships.`,
      details: { internshipCount: 0 },
      strengths: [],
      gaps: ['No verified corporate internship or training experience recorded'],
    };
  }

  const allJobSkills = [
    ...(job.requiredSkills || []).map((s) => normalizeSkillName(s.name)),
    ...(job.preferredSkills || []).map((s) => normalizeSkillName(s.name)),
  ];
  const jobTitleNorm = normalizeText(job.title);
  const jobFamily = getRoleFamily(jobTitleNorm);

  const evaluatedInternships = internships.map((item) => {
    const itemSkills = (item.skillsUsed || []).map((s) => normalizeSkillName(s));
    const matchingSkills = itemSkills.filter((s) => allJobSkills.some((js) => js === s || s.includes(js) || js.includes(s)));

    // 1. Tech overlap (0-100)
    const techScore = allJobSkills.length > 0
      ? Math.min(100, Math.round((matchingSkills.length / Math.min(allJobSkills.length, 2)) * 100))
      : 75;

    // 2. Role relevance (0-100)
    const roleNorm = normalizeText(item.role);
    const internFamily = getRoleFamily(roleNorm);
    let roleScore = 50;
    if (jobFamily && internFamily && jobFamily === internFamily) {
      roleScore = 100;
    } else if (jobTitleNorm.includes(roleNorm) || roleNorm.includes('developer') || roleNorm.includes('engineer') || roleNorm.includes('intern')) {
      roleScore = 80;
    }

    // 3. Duration score (0-100)
    let months = 1;
    if (item.startDate) {
      const start = new Date(item.startDate);
      const end = item.endDate ? new Date(item.endDate) : new Date();
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        months = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      }
    }
    const durationScore = months >= 6 ? 100 : months >= 3 ? 85 : 70;

    const itemScore = Math.min(100, Math.round(techScore * 0.45 + roleScore * 0.35 + durationScore * 0.2));

    return {
      company: item.company,
      role: item.role,
      months,
      matchingSkills,
      itemScore,
    };
  });

  evaluatedInternships.sort((a, b) => b.itemScore - a.itemScore);
  const topInternship = evaluatedInternships[0];
  const score = topInternship.itemScore;

  const strengths: string[] = [];
  const gaps: string[] = [];

  if (score >= 75) {
    strengths.push(
      `Relevant internship experience at ${topInternship.company} as ${topInternship.role} (${topInternship.months} mo)`
    );
  } else if (score < 60) {
    gaps.push(`Internship experience (${topInternship.role}) has limited functional overlap with role.`);
  }

  return {
    score,
    status: 'APPLICABLE',
    reason: `Evaluated ${internships.length} internship record(s). Highest match: ${topInternship.role} at ${topInternship.company} (${score}/100).`,
    details: {
      internshipCount: internships.length,
      evaluatedInternships,
    },
    strengths,
    gaps,
  };
}

/**
 * Component 5: Certification Relevance (Base: 5%)
 */
export function evaluateCertificationRelevance(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>,
  certifications: CertificationItem[] = []
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  const reqCerts = job.eligibility?.requiredCertifications || [];

  if (reqCerts.length === 0 && (!certifications || certifications.length === 0)) {
    return {
      score: 0,
      status: 'NOT_APPLICABLE',
      reason: 'No certifications required for position and none listed in student profile.',
      details: { certCount: 0 },
      strengths: [],
      gaps: [],
    };
  }

  if (!certifications || certifications.length === 0) {
    return {
      score: 0,
      status: 'APPLICABLE',
      reason: `Position notes certification criteria, but candidate has no verified credentials.`,
      details: { certCount: 0 },
      strengths: [],
      gaps: ['No verified professional certifications on file'],
    };
  }

  const jobTitleNorm = normalizeText(job.title);
  const jobFamily = getRoleFamily(jobTitleNorm);
  const allJobSkills = [
    ...(job.requiredSkills || []).map((s) => normalizeSkillName(s.name)),
    ...(job.preferredSkills || []).map((s) => normalizeSkillName(s.name)),
  ];

  let bestCertScore = 60;
  let matchingCertName = certifications[0].name;

  for (const cert of certifications) {
    const certNorm = normalizeText(cert.name);

    // Exact or direct match with job certification
    if (reqCerts.some((rc) => normalizeText(rc) === certNorm || certNorm.includes(normalizeText(rc)))) {
      bestCertScore = 100;
      matchingCertName = cert.name;
      break;
    }

    // Technology match
    if (allJobSkills.some((s) => certNorm.includes(s))) {
      bestCertScore = Math.max(bestCertScore, 90);
      matchingCertName = cert.name;
    }

    // Domain match
    if (
      (jobFamily === 'cloud_devops' && (certNorm.includes('aws') || certNorm.includes('azure') || certNorm.includes('cloud'))) ||
      (jobFamily === 'data_ai' && (certNorm.includes('machine learning') || certNorm.includes('data') || certNorm.includes('deep learning'))) ||
      (jobFamily === 'software_engineering' && (certNorm.includes('java') || certNorm.includes('python') || certNorm.includes('full stack')))
    ) {
      bestCertScore = Math.max(bestCertScore, 85);
      matchingCertName = cert.name;
    }
  }

  const strengths = bestCertScore >= 80 ? [`Relevant certification: ${matchingCertName}`] : [];

  return {
    score: bestCertScore,
    status: 'APPLICABLE',
    reason: `Candidate holds ${certifications.length} verified certification(s). Best match '${matchingCertName}' scored ${bestCertScore}/100.`,
    details: {
      certCount: certifications.length,
      bestCertScore,
      matchingCertName,
    },
    strengths,
    gaps: [],
  };
}

/**
 * Component 6: Career Goal Alignment (Base: 5%)
 */
export function evaluateCareerGoalAlignment(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  const goal = student.careerGoal;
  const targetRole = goal?.targetRole;

  if (!goal || !targetRole || normalizeText(targetRole).length === 0) {
    return {
      score: 0,
      status: 'NOT_APPLICABLE',
      reason: 'Student has not declared target career roles in profile.',
      details: {},
      strengths: [],
      gaps: [],
    };
  }

  const jobTitleNorm = normalizeText(job.title);
  const targetRoleNorm = normalizeText(targetRole);

  const jobFamily = getRoleFamily(jobTitleNorm);
  const studentFamily = getRoleFamily(targetRoleNorm);

  let score = 50;
  if (jobTitleNorm === targetRoleNorm || jobTitleNorm.includes(targetRoleNorm) || targetRoleNorm.includes(jobTitleNorm)) {
    score = 100;
  } else if (jobFamily && studentFamily && jobFamily === studentFamily) {
    score = 85;
  } else {
    // Check alternative roles
    const altRoles = (goal.alternativeRoles || []).map((r) => normalizeText(r));
    if (altRoles.some((r) => r === jobTitleNorm || r.includes(jobTitleNorm) || jobTitleNorm.includes(r))) {
      score = 80;
    } else if (altRoles.some((r) => getRoleFamily(r) === jobFamily)) {
      score = 75;
    } else {
      score = 40; // Different functional domain
    }
  }

  const strengths = score >= 80 ? [`Career goal directly aligns: Student targets '${targetRole}'`] : [];
  const gaps = score <= 50 ? [`Career goal preference '${targetRole}' differs from position functional track`] : [];

  return {
    score,
    status: 'APPLICABLE',
    reason: `Target role '${targetRole}' aligns at ${score}/100 with job position '${job.title}'.`,
    details: {
      targetRole,
      jobTitle: job.title,
      score,
    },
    strengths,
    gaps,
  };
}

/**
 * Component 7: Location & Work Mode Alignment (Base: 5%)
 */
export function evaluateLocationWorkModeAlignment(
  student: Partial<StudentProfile>,
  job: Partial<RecruiterJob>
): {
  score: number;
  status: MatchComponentStatus;
  reason: string;
  details: any;
  strengths: string[];
  gaps: string[];
} {
  const goal = student.careerGoal;

  // 1. Locations
  const prefLocs = [
    ...(goal?.preferredLocations || []),
    ...(goal?.preferredLocation ? [goal.preferredLocation] : []),
  ].filter(Boolean);

  let locationScore: number | null = null;
  const jobLocation = job.location || '';

  if (prefLocs.length > 0) {
    const isMatched = prefLocs.some((loc) => areLocationsMatching(loc, jobLocation));
    locationScore = isMatched ? 100 : 50;
  }

  // 2. Work Mode
  const prefModes = [
    ...(goal?.workModes || []),
    ...(goal?.workMode ? [goal.workMode] : []),
  ].filter(Boolean);

  let modeScore: number | null = null;
  const jobMode = job.workMode || 'HYBRID';

  if (prefModes.length > 0) {
    const studentModes = prefModes.map((m) => normalizeWorkMode(m));
    const normalizedJobMode = normalizeWorkMode(jobMode);

    if (studentModes.includes('ANY') || studentModes.includes(normalizedJobMode)) {
      modeScore = 100;
    } else if (normalizedJobMode === 'HYBRID' || studentModes.includes('HYBRID')) {
      modeScore = 85;
    } else {
      modeScore = 40;
    }
  }

  // Both missing -> NOT_APPLICABLE
  if (locationScore === null && modeScore === null) {
    return {
      score: 0,
      status: 'NOT_APPLICABLE',
      reason: 'No location or work mode restrictions declared by student.',
      details: {},
      strengths: [],
      gaps: [],
    };
  }

  // Single preference provided or both
  let score = 100;
  if (locationScore !== null && modeScore !== null) {
    score = Math.round(locationScore * 0.5 + modeScore * 0.5);
  } else if (locationScore !== null) {
    score = locationScore;
  } else if (modeScore !== null) {
    score = modeScore;
  }

  const strengths: string[] = [];
  const gaps: string[] = [];

  if (locationScore === 100) {
    strengths.push(`Location preference matches job location (${job.location})`);
  } else if (locationScore !== null && locationScore < 70) {
    gaps.push(`Preferred location differs from position office location (${job.location})`);
  }

  if (modeScore === 100) {
    strengths.push(`Work mode preference aligns with ${jobMode}`);
  }

  return {
    score,
    status: 'APPLICABLE',
    reason: `Location alignment (${locationScore ?? 'Open'}) & work mode alignment (${modeScore ?? 'Open'}) averaged to ${score}/100.`,
    details: {
      locationScore,
      modeScore,
      jobLocation,
      jobMode,
    },
    strengths,
    gaps,
  };
}

/* ============================================================================
 * CORE MATCHING ENGINE
 * ============================================================================ */

/**
 * Calculates a pure, deterministic match score for a student against a job opening.
 *
 * Rules:
 *   - ELIGIBILITY GATE: If eligibilityResult.status !== 'ELIGIBLE',
 *     the candidate has eligible: false, rankingEligible: false.
 *   - Weights for APPLICABLE components are normalized to exactly 100%.
 *   - Categories with no data are marked NOT_APPLICABLE, not penalized to 0.
 */
export function calculateMatchScore(params: {
  student: Partial<StudentProfile>;
  job: Partial<RecruiterJob>;
  eligibilityResult: EligibilityEvaluation;
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  internships?: InternshipItem[];
}): CandidateMatchResult {
  const {
    student,
    job,
    eligibilityResult,
    projects = [],
    certifications = [],
    internships = [],
  } = params;

  // 1. Mandatory ELIGIBILITY GATE
  const isEligible = !!(eligibilityResult && eligibilityResult.eligible && eligibilityResult.status === 'ELIGIBLE');

  // 2. Evaluate all 7 dimensions independently
  const reqRes = evaluateRequiredSkillsMatch(student, job);
  const prefRes = evaluatePreferredSkillsMatch(student, job);
  const projRes = evaluateProjectRelevance(student, job, projects);
  const expRes = evaluateExperienceRelevance(student, job, internships);
  const certRes = evaluateCertificationRelevance(student, job, certifications);
  const goalRes = evaluateCareerGoalAlignment(student, job);
  const locRes = evaluateLocationWorkModeAlignment(student, job);

  // 3. Score Normalization & Weight Redistribution
  const rawComponents = {
    requiredSkills: { result: reqRes, baseWeight: BASE_MATCH_WEIGHTS.requiredSkills },
    preferredSkills: { result: prefRes, baseWeight: BASE_MATCH_WEIGHTS.preferredSkills },
    projects: { result: projRes, baseWeight: BASE_MATCH_WEIGHTS.projects },
    experience: { result: expRes, baseWeight: BASE_MATCH_WEIGHTS.experience },
    certifications: { result: certRes, baseWeight: BASE_MATCH_WEIGHTS.certifications },
    careerGoal: { result: goalRes, baseWeight: BASE_MATCH_WEIGHTS.careerGoal },
    locationWorkMode: { result: locRes, baseWeight: BASE_MATCH_WEIGHTS.locationWorkMode },
  };

  // Calculate sum of weights for APPLICABLE dimensions
  let totalActiveWeight = 0;
  for (const comp of Object.values(rawComponents)) {
    if (comp.result.status === 'APPLICABLE') {
      totalActiveWeight += comp.baseWeight;
    }
  }

  // Safety fallback: if no component is applicable (should be impossible)
  if (totalActiveWeight === 0) totalActiveWeight = 100;

  const breakdown: any = {};
  let totalContribution = 0;
  const allStrengths: string[] = [];
  const allGaps: string[] = [];

  for (const [key, comp] of Object.entries(rawComponents)) {
    const isApplicable = comp.result.status === 'APPLICABLE';
    // Normalized weight: redistributes missing weights proportionally so sum = 100
    const normalizedWeight = isApplicable
      ? Math.round((comp.baseWeight / totalActiveWeight) * 1000) / 10
      : 0;

    const contribution = isApplicable
      ? Math.round((comp.result.score * (normalizedWeight / 100)) * 10) / 10
      : 0;

    totalContribution += contribution;

    breakdown[key] = {
      score: comp.result.score,
      weight: comp.baseWeight,
      normalizedWeight,
      contribution,
      status: comp.result.status,
      reason: comp.result.reason,
      details: comp.result.details,
    } as MatchComponentScore;

    if (isApplicable) {
      allStrengths.push(...comp.result.strengths);
      allGaps.push(...comp.result.gaps);
    }
  }

  // Round final score to 1 decimal place, bounded [0, 100]
  const finalScore = Math.min(100, Math.max(0, Math.round(totalContribution * 10) / 10));

  // Explanations synthesis
  const explanation: string[] = [];
  if (isEligible) {
    explanation.push(`Candidate passed all mandatory eligibility cutoff requirements.`);
    explanation.push(`Overall role compatibility calculated at ${finalScore}/100 across verified profile dimensions.`);
    if (breakdown.requiredSkills.status === 'APPLICABLE') {
      explanation.push(`Required skills: ${breakdown.requiredSkills.score}% match (contributed ${breakdown.requiredSkills.contribution} pts).`);
    }
    if (breakdown.preferredSkills.status === 'APPLICABLE') {
      explanation.push(`Preferred skills: ${breakdown.preferredSkills.score}% match (contributed ${breakdown.preferredSkills.contribution} pts).`);
    } else {
      explanation.push(`Preferred skills not required by job — weight redistributed proportionally.`);
    }
    if (breakdown.projects.status === 'APPLICABLE') {
      explanation.push(`Project portfolio relevance: ${breakdown.projects.score}% (contributed ${breakdown.projects.contribution} pts).`);
    }
    if (breakdown.experience.status === 'APPLICABLE') {
      explanation.push(`Internship experience relevance: ${breakdown.experience.score}% (contributed ${breakdown.experience.contribution} pts).`);
    }
  } else {
    explanation.push(`Candidate is NOT ELIGIBLE due to failing one or more mandatory job criteria.`);
    explanation.push(`Match score (${finalScore}/100) is informational and excluded from final recruitment rankings.`);
  }

  const requirementsVersion = String(job.updatedAt || job.createdAt || '1');

  return {
    studentId: student.uid || 'unknown_student',
    jobId: job.id || 'unknown_job',
    jobTitle: job.title || 'Untitled Opening',
    company: job.company || 'Unknown Employer',
    studentName: student.fullName,
    studentBranch: student.branch,
    studentBatch: student.graduationYear,
    studentRegNo: student.bputRegistrationNumber,

    eligible: isEligible,
    rankingEligible: isEligible,
    reason: isEligible
      ? 'Candidate meets all mandatory criteria and is ranked for recruitment matching.'
      : 'Candidate does not meet one or more mandatory job requirements.',

    score: finalScore,
    breakdown: breakdown as MatchBreakdown,

    strengths: Array.from(new Set(allStrengths)),
    gaps: Array.from(new Set(allGaps)),
    explanation,

    evaluatedAt: new Date().toISOString(),
    requirementsVersion,
  };
}

/**
 * Deterministically ranks candidates for a job:
 *   1. Strictly REMOVES NOT_ELIGIBLE candidates (rankingEligible === false).
 *   2. Sorts by Match Score descending.
 *   3. Tie-breaker 1: Required Skills score descending.
 *   4. Tie-breaker 2: Project relevance score descending.
 *   5. Tie-breaker 3: Stable studentId ascending.
 */
export function rankEligibleCandidates(
  candidates: CandidateMatchResult[]
): RankedCandidate[] {
  // Step 1: Remove ineligible candidates
  const eligibleOnly = candidates.filter((c) => c.eligible && c.rankingEligible);

  // Step 2: Deterministic multi-tier sort
  eligibleOnly.sort((a, b) => {
    // 1. Match score descending
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // 2. Required skills score descending
    const bReq = b.breakdown?.requiredSkills?.score ?? 0;
    const aReq = a.breakdown?.requiredSkills?.score ?? 0;
    if (bReq !== aReq) {
      return bReq - aReq;
    }

    // 3. Project relevance score descending
    const bProj = b.breakdown?.projects?.score ?? 0;
    const aProj = a.breakdown?.projects?.score ?? 0;
    if (bProj !== aProj) {
      return bProj - aProj;
    }

    // 4. Stable deterministic tie-breaker: studentId ascending
    return a.studentId.localeCompare(b.studentId);
  });

  // Step 3: Assign ordinal rank
  return eligibleOnly.map((cand, idx) => ({
    ...cand,
    rank: idx + 1,
  }));
}
