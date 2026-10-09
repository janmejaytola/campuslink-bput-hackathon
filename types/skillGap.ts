export type SkillStatus = 'STRONG' | 'DEVELOPING' | 'MISSING';
export type SkillPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface SkillGapItem {
  skill: string;
  source: 'required' | 'preferred';
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  status: SkillStatus;
  priority: SkillPriority;
  recommendation: string;
  assessed: boolean; // whether student has explicitly declared/calibrated proficiency
}

export interface RoleRequirement {
  roleId: string;
  title: string;
  requiredSkills: Record<string, number>;
  preferredSkills?: Record<string, number>;
  isBenchmark: boolean;
  benchmarkLabel?: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  targetRoleId: string;
  analyzedAt: string;
  coverage: number; // percentage of strong required skills / total required skills * 100
  strongCount: number;
  criticalCount: number;
  developingCount: number;
  missingCount: number;
  totalRequired: number;
  gaps: SkillGapItem[];
  biggestOpportunities: SkillGapItem[];
  aiSummary?: string | null;
}

// Transparent synthetic role benchmarks for BPUT campus drives
export const SYNTHETIC_ROLE_BENCHMARKS: Record<string, RoleRequirement> = {
  'software-engineer': {
    roleId: 'software-engineer',
    title: 'Software Engineer',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'Data Structures': 80,
      'Algorithms': 75,
      'Java': 70,
      'Python': 65,
      'SQL': 60,
      'Git': 60,
    },
    preferredSkills: {
      'React': 60,
      'Docker': 50,
      'AWS': 50,
    },
  },
  'data-analyst': {
    roleId: 'data-analyst',
    title: 'Data Analyst',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'SQL': 80,
      'Python': 75,
      'Data Analysis': 75,
      'Power BI': 70,
      'Excel': 70,
      'Statistics': 65,
    },
    preferredSkills: {
      'Tableau': 60,
      'R': 50,
      'Machine Learning': 45,
    },
  },
  'data-scientist': {
    roleId: 'data-scientist',
    title: 'Data Scientist',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'Python': 85,
      'Machine Learning': 80,
      'Statistics': 80,
      'SQL': 70,
      'Data Structures': 70,
      'Deep Learning': 65,
    },
    preferredSkills: {
      'TensorFlow': 65,
      'NLP': 60,
      'Cloud ML': 50,
    },
  },
  'web-developer': {
    roleId: 'web-developer',
    title: 'Web Developer',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'JavaScript': 80,
      'HTML/CSS': 80,
      'React': 75,
      'Tailwind CSS': 70,
      'Git': 65,
      'REST APIs': 65,
    },
    preferredSkills: {
      'TypeScript': 60,
      'Node.js': 55,
      'Next.js': 55,
    },
  },
  'full-stack-developer': {
    roleId: 'full-stack-developer',
    title: 'Full Stack Developer',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'React': 80,
      'Node.js': 75,
      'JavaScript': 80,
      'SQL': 70,
      'REST APIs': 75,
      'Git': 65,
      'Data Structures': 65,
    },
    preferredSkills: {
      'TypeScript': 65,
      'Docker': 55,
      'MongoDB': 60,
      'AWS': 50,
    },
  },
  'cloud-engineer': {
    roleId: 'cloud-engineer',
    title: 'Cloud Engineer',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'Linux': 80,
      'AWS': 75,
      'Networking': 70,
      'Docker': 70,
      'Python': 65,
      'Git': 65,
    },
    preferredSkills: {
      'Kubernetes': 60,
      'Terraform': 55,
      'CI/CD': 60,
    },
  },
  'aiml-engineer': {
    roleId: 'aiml-engineer',
    title: 'AI/ML Engineer',
    isBenchmark: true,
    benchmarkLabel: 'Synthetic role benchmark',
    requiredSkills: {
      'Python': 85,
      'Machine Learning': 80,
      'Deep Learning': 75,
      'PyTorch': 70,
      'Algorithms': 75,
      'Math & Linear Algebra': 70,
    },
    preferredSkills: {
      'Generative AI': 65,
      'MLOps': 60,
      'Docker': 55,
    },
  },
};

export function normalizeRoleId(roleTitle: string): string {
  const lower = (roleTitle || '').toLowerCase().trim();
  if (lower.includes('data sci')) return 'data-scientist';
  if (lower.includes('data anal')) return 'data-analyst';
  if (lower.includes('full stack') || lower.includes('full-stack')) return 'full-stack-developer';
  if (lower.includes('web dev') || lower.includes('frontend')) return 'web-developer';
  if (lower.includes('cloud') || lower.includes('devops')) return 'cloud-engineer';
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) return 'aiml-engineer';
  return 'software-engineer';
}
