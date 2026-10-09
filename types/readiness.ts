export type ReadinessLevel = 'NOT READY' | 'DEVELOPING' | 'READY' | 'HIGHLY EMPLOYABLE';

export interface FactorScores {
  academic: number;
  technical: number;
  projects: number;
  experience: number;
  certifications: number;
  assessments: number;
  communication: number;
}

export interface FactorWeights {
  academic: number;
  technical: number;
  projects: number;
  experience: number;
  certifications: number;
  assessments: number;
  communication: number;
}

export const READINESS_WEIGHTS: FactorWeights = {
  academic: 0.20,
  technical: 0.30,
  projects: 0.15,
  experience: 0.10,
  certifications: 0.05,
  assessments: 0.10,
  communication: 0.10,
};

export interface ReadinessResult {
  score: number;
  level: ReadinessLevel;
  factorScores: FactorScores;
  factorContributions: FactorScores;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  missingInputs: string[];
  targetRole: string;
  aiExplanation?: string | null;
  calculatedAt: string;
}

export const FACTOR_CONFIG = [
  {
    key: 'technical' as const,
    label: 'Technical Skills',
    weight: 0.30,
    weightPercent: '30%',
    description: 'Practical programming languages, frameworks, and engineering competencies.',
  },
  {
    key: 'academic' as const,
    label: 'Academic Performance',
    weight: 0.20,
    weightPercent: '20%',
    description: 'BPUT cumulative grade point average (CGPA normalized to 100).',
  },
  {
    key: 'projects' as const,
    label: 'Projects',
    weight: 0.15,
    weightPercent: '15%',
    description: 'Showcase projects demonstrating real-world implementation depth.',
  },
  {
    key: 'assessments' as const,
    label: 'Assessments',
    weight: 0.10,
    weightPercent: '10%',
    description: 'Quantitative aptitude and technical screening evaluation scores.',
  },
  {
    key: 'communication' as const,
    label: 'Communication',
    weight: 0.10,
    weightPercent: '10%',
    description: 'Verbal, written, and collaborative interview presentation readiness.',
  },
  {
    key: 'experience' as const,
    label: 'Experience',
    weight: 0.10,
    weightPercent: '10%',
    description: 'Corporate internships, industrial attachments, and practical training.',
  },
  {
    key: 'certifications' as const,
    label: 'Certifications',
    weight: 0.05,
    weightPercent: '5%',
    description: 'Recognized industry credentials and professional certifications.',
  },
];
