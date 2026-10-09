import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentProfile, ProjectItem, CertificationItem, InternshipItem } from '@/types/student';
import {
  ReadinessResult,
  ReadinessLevel,
  FactorScores,
  READINESS_WEIGHTS,
} from '@/types/readiness';
import { studentService } from './studentService';

function clamp(val: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, val));
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

export function determineReadinessLevel(score: number): ReadinessLevel {
  if (score >= 80) return 'HIGHLY EMPLOYABLE';
  if (score >= 60) return 'READY';
  if (score >= 40) return 'DEVELOPING';
  return 'NOT READY';
}

/**
 * Deterministic calculation of placement readiness based strictly on student profile data.
 * Adheres to the CAMPUSLINK AI Brain reference contract calculate_readiness(student).
 */
export function calculateReadiness(
  profile: StudentProfile | null,
  projects: ProjectItem[] = [],
  certifications: CertificationItem[] = [],
  internships: InternshipItem[] = []
): ReadinessResult {
  const missingInputs: string[] = [];

  // 1. ACADEMIC FACTOR
  let academic = 0;
  if (profile?.cgpa && profile.cgpa > 0) {
    academic = clamp((profile.cgpa / 10) * 100);
  } else {
    missingInputs.push('Academic CGPA (0.00 - 10.00)');
  }

  // 2. TECHNICAL FACTOR
  let technical = 0;
  const skills = profile?.skills || [];
  if (skills.length > 0) {
    // If student declared a diagnostic technicalScore, blend it with skill breadth;
    // otherwise give standard mastery score (e.g. 75 for declared skills)
    const baseScore = profile?.readinessInputs?.technicalScore ?? 75;
    const breadthBonus = Math.min(15, skills.length * 2);
    technical = clamp(baseScore + breadthBonus - 10);
  } else {
    missingInputs.push('Technical Skills (no skills declared)');
  }

  // 3. PROJECTS FACTOR
  // Formula: projects = number of projects × 25 (clamped to 100)
  const projectCount = projects.length;
  const projectsScore = clamp(projectCount * 25);
  if (projectCount === 0) {
    missingInputs.push('Projects: 0/100 — No projects added yet');
  }

  // 4. EXPERIENCE FACTOR
  // Formula: experience = number of internships × 50 (clamped to 100)
  const internshipCount = internships.length;
  const experienceScore = clamp(internshipCount * 50);
  if (internshipCount === 0) {
    missingInputs.push('Experience: 0/100 — No internship records');
  }

  // 5. CERTIFICATIONS FACTOR
  // Formula: certifications = number of certifications × 25 (clamped to 100)
  const certCount = certifications.length;
  const certificationsScore = clamp(certCount * 25);
  if (certCount === 0) {
    missingInputs.push('Certifications: 0/100 — No credentials recorded');
  }

  // 6. ASSESSMENTS FACTOR
  // Average of aptitudeScore and technicalScore from readinessInputs
  let assessmentScore = 0;
  const aptitude = profile?.readinessInputs?.aptitudeScore;
  const techAssessment = profile?.readinessInputs?.technicalScore;

  const validAssessments: number[] = [];
  if (typeof aptitude === 'number' && aptitude > 0) validAssessments.push(aptitude);
  if (typeof techAssessment === 'number' && techAssessment > 0) validAssessments.push(techAssessment);

  if (validAssessments.length > 0) {
    const sum = validAssessments.reduce((acc, curr) => acc + curr, 0);
    assessmentScore = clamp(sum / validAssessments.length);
  } else {
    missingInputs.push('Assessments (Aptitude & Technical test scores)');
  }

  // 7. COMMUNICATION FACTOR
  let communicationScore = 0;
  if (typeof profile?.readinessInputs?.communicationScore === 'number' && profile.readinessInputs.communicationScore > 0) {
    communicationScore = clamp(profile.readinessInputs.communicationScore);
  } else {
    missingInputs.push('Communication Score (self-assessment)');
  }

  const factorScores: FactorScores = {
    academic: round2(academic),
    technical: round2(technical),
    projects: round2(projectsScore),
    experience: round2(experienceScore),
    certifications: round2(certificationsScore),
    assessments: round2(assessmentScore),
    communication: round2(communicationScore),
  };

  // Weighted contributions
  const factorContributions: FactorScores = {
    academic: round2(factorScores.academic * READINESS_WEIGHTS.academic),
    technical: round2(factorScores.technical * READINESS_WEIGHTS.technical),
    projects: round2(factorScores.projects * READINESS_WEIGHTS.projects),
    experience: round2(factorScores.experience * READINESS_WEIGHTS.experience),
    certifications: round2(factorScores.certifications * READINESS_WEIGHTS.certifications),
    assessments: round2(factorScores.assessments * READINESS_WEIGHTS.assessments),
    communication: round2(factorScores.communication * READINESS_WEIGHTS.communication),
  };

  // Final score
  const rawTotal =
    factorContributions.academic +
    factorContributions.technical +
    factorContributions.projects +
    factorContributions.experience +
    factorContributions.certifications +
    factorContributions.assessments +
    factorContributions.communication;

  const finalScore = clamp(round2(rawTotal));
  const level = determineReadinessLevel(finalScore);

  // Identify Strengths (score >= 75)
  const strengths: string[] = [];
  if (factorScores.technical >= 75) strengths.push('Technical Skills');
  if (factorScores.academic >= 75) strengths.push('Academic Performance');
  if (factorScores.projects >= 75) strengths.push('Projects');
  if (factorScores.assessments >= 75) strengths.push('Assessments');
  if (factorScores.communication >= 75) strengths.push('Communication');
  if (factorScores.experience >= 75) strengths.push('Experience & Internships');
  if (factorScores.certifications >= 75) strengths.push('Certifications');

  // Identify Improvement Areas (score < 55)
  const improvementAreas: string[] = [];
  if (factorScores.communication < 55) improvementAreas.push('Communication');
  if (factorScores.assessments < 55) improvementAreas.push('Assessments');
  if (factorScores.experience < 55) improvementAreas.push('Experience');
  if (factorScores.certifications < 55) improvementAreas.push('Certifications');
  if (factorScores.projects < 55) improvementAreas.push('Projects');
  if (factorScores.technical < 55) improvementAreas.push('Technical Skills');
  if (factorScores.academic < 55) improvementAreas.push('Academic Performance');

  // Deterministic Recommendations
  const recommendations: string[] = [];
  if (factorScores.technical < 65) {
    recommendations.push('Strengthen technical skills aligned with your target roles.');
  }
  if (factorScores.projects < 50) {
    recommendations.push('Build at least one relevant project demonstrating practical skills.');
  }
  if (factorScores.assessments < 60) {
    recommendations.push('Practice aptitude and technical assessments.');
  }
  if (factorScores.communication < 60) {
    recommendations.push('Practice mock interviews and structured communication.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue targeted preparation and role-specific interview practice.');
  }

  const targetRole = profile?.careerGoal?.targetRole || 'Software Engineer';

  return {
    score: finalScore,
    level,
    factorScores,
    factorContributions,
    strengths,
    improvementAreas,
    recommendations,
    missingInputs,
    targetRole,
    calculatedAt: new Date().toISOString(),
  };
}

export const readinessService = {
  /**
   * Retrieves the current saved readiness result from Firestore at students/{uid}/readiness/current.
   */
  async getCurrentReadiness(uid: string): Promise<ReadinessResult | null> {
    if (!uid || typeof window === 'undefined' || !db) return null;

    try {
      const docRef = doc(db, 'students', uid, 'readiness', 'current');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ReadinessResult;
      }
    } catch (err) {
      console.error('[Firestore Get Readiness Error]:', err);
    }

    return null;
  },

  /**
   * Saves the calculated readiness result into Firestore at students/{uid}/readiness/current.
   */
  async saveCurrentReadiness(uid: string, result: ReadinessResult): Promise<void> {
    if (!uid || typeof window === 'undefined' || !db) return;

    const docRef = doc(db, 'students', uid, 'readiness', 'current');
    await setDoc(docRef, result, { merge: true });
  },

  /**
   * Fetches all live profile entities and recalculates placement readiness deterministically.
   */
  async computeAndSaveReadiness(uid: string): Promise<ReadinessResult> {
    if (!uid) throw new Error('Student UID is required.');

    const [profile, projects, certs, interns] = await Promise.all([
      studentService.getStudentProfile(uid),
      studentService.getProjects(uid),
      studentService.getCertifications(uid),
      studentService.getInternships(uid),
    ]);

    const result = calculateReadiness(profile, projects, certs, interns);

    // Persist result in Firestore
    await this.saveCurrentReadiness(uid, result);

    return result;
  },
};
