import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentProfile } from '@/types/student';
import {
  SkillGapAnalysis,
  SkillGapItem,
  SkillStatus,
  SkillPriority,
  RoleRequirement,
  SYNTHETIC_ROLE_BENCHMARKS,
  normalizeRoleId,
} from '@/types/skillGap';
import { studentService } from './studentService';

export function calculateSkillGap(
  profile: StudentProfile | null,
  roleRequirement: RoleRequirement
): SkillGapAnalysis {
  const targetRole = profile?.careerGoal?.targetRole || roleRequirement.title;
  const targetRoleId = roleRequirement.roleId;

  const declaredSkills = new Set(
    (profile?.skills || []).map((s) => s.toLowerCase().trim())
  );
  const declaredProficiencies: Record<string, number> = {};
  if (profile?.skillProficiencies) {
    Object.entries(profile.skillProficiencies).forEach(([k, v]) => {
      declaredProficiencies[k.toLowerCase().trim()] = v;
    });
  }

  const items: SkillGapItem[] = [];

  // Helper to resolve student skill level
  const resolveStudentLevel = (skillName: string): { level: number; assessed: boolean } => {
    const key = skillName.toLowerCase().trim();
    if (key in declaredProficiencies) {
      return { level: declaredProficiencies[key], assessed: true };
    }
    // If student has the skill name listed in their profile but no numeric calibration yet
    if (declaredSkills.has(key)) {
      return { level: 0, assessed: false };
    }
    // Skill is not declared at all
    return { level: 0, assessed: true };
  };

  // 1. Process Required Skills
  const requiredEntries = Object.entries(roleRequirement.requiredSkills || {});
  let strongRequiredCount = 0;

  requiredEntries.forEach(([skill, reqLevel]) => {
    const { level: current, assessed } = resolveStudentLevel(skill);
    const gap = Math.max(reqLevel - current, 0);

    let status: SkillStatus;
    let priority: SkillPriority;

    if (current >= reqLevel && current > 0) {
      status = 'STRONG';
      priority = 'Low';
      strongRequiredCount += 1;
    } else if (current > 0 && current < reqLevel) {
      status = 'DEVELOPING';
      priority = gap >= 25 ? 'High' : 'Medium';
    } else {
      status = 'MISSING';
      priority = reqLevel >= 75 ? 'Critical' : 'High';
    }

    const recommendation =
      status === 'STRONG'
        ? `Maintain ${skill} and prepare role-specific interview questions.`
        : `Practice and demonstrate ${skill} through a project or assessment.`;

    items.push({
      skill,
      source: 'required',
      currentLevel: current,
      requiredLevel: reqLevel,
      gap,
      status,
      priority,
      recommendation,
      assessed,
    });
  });

  // 2. Process Preferred Skills (with lower implied importance: min(prefLevel, 70))
  if (roleRequirement.preferredSkills) {
    const requiredSkillsSet = new Set(
      Object.keys(roleRequirement.requiredSkills || {}).map((s) => s.toLowerCase().trim())
    );

    Object.entries(roleRequirement.preferredSkills).forEach(([skill, prefLevel]) => {
      if (requiredSkillsSet.has(skill.toLowerCase().trim())) return; // Avoid duplicate

      const adjustedRequired = Math.min(prefLevel, 70);
      const { level: current, assessed } = resolveStudentLevel(skill);
      const gap = Math.max(adjustedRequired - current, 0);

      let status: SkillStatus;
      let priority: SkillPriority;

      if (current >= adjustedRequired && current > 0) {
        status = 'STRONG';
        priority = 'Low';
      } else if (current > 0 && current < adjustedRequired) {
        status = 'DEVELOPING';
        priority = gap >= 25 ? 'High' : 'Medium';
      } else {
        status = 'MISSING';
        priority = adjustedRequired >= 75 ? 'Critical' : 'High';
      }

      const recommendation =
        status === 'STRONG'
          ? `Maintain ${skill} and prepare role-specific interview questions.`
          : `Practice and demonstrate ${skill} through a project or assessment.`;

      items.push({
        skill,
        source: 'preferred',
        currentLevel: current,
        requiredLevel: adjustedRequired,
        gap,
        status,
        priority,
        recommendation,
        assessed,
      });
    });
  }

  // 3. Deterministic Sorting:
  // Critical -> High -> Medium -> Low; within same priority, largest gap first.
  const priorityWeight: Record<SkillPriority, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  items.sort((a, b) => {
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (weightDiff !== 0) return weightDiff;
    return b.gap - a.gap;
  });

  // 4. Calculate Coverage
  const totalRequired = requiredEntries.length;
  const coverage =
    totalRequired > 0 ? Math.round((strongRequiredCount / totalRequired) * 100) : 0;

  // 5. Counters
  const strongCount = items.filter((i) => i.status === 'STRONG').length;
  const criticalCount = items.filter((i) => i.priority === 'Critical').length;
  const developingCount = items.filter((i) => i.status === 'DEVELOPING').length;
  const missingCount = items.filter((i) => i.status === 'MISSING').length;

  // 6. Top Opportunities (Critical / High gaps)
  const biggestOpportunities = items.filter((i) => i.priority === 'Critical' || i.priority === 'High').slice(0, 3);

  return {
    targetRole,
    targetRoleId,
    analyzedAt: new Date().toISOString(),
    coverage,
    strongCount,
    criticalCount,
    developingCount,
    missingCount,
    totalRequired,
    gaps: items,
    biggestOpportunities,
  };
}

export const skillGapService = {
  /**
   * Retrieves role requirement from Firestore or synthetic benchmark fallback.
   */
  async getRoleRequirement(targetRole: string): Promise<RoleRequirement> {
    const roleId = normalizeRoleId(targetRole);

    if (typeof window !== 'undefined' && db) {
      try {
        const docRef = doc(db, 'roleRequirements', roleId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as RoleRequirement;
        }
      } catch (err) {
        console.warn('[Role Requirement Firestore Notice - using synthetic benchmark]:', err);
      }
    }

    return SYNTHETIC_ROLE_BENCHMARKS[roleId] || SYNTHETIC_ROLE_BENCHMARKS['software-engineer'];
  },

  /**
   * Retrieves cached skill gap analysis from students/{uid}/skillGap/current.
   */
  async getCurrentAnalysis(uid: string): Promise<SkillGapAnalysis | null> {
    if (!uid || typeof window === 'undefined' || !db) return null;

    try {
      const docRef = doc(db, 'students', uid, 'skillGap', 'current');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SkillGapAnalysis;
      }
    } catch (err) {
      console.error('[Firestore Get Skill Gap Error]:', err);
    }

    return null;
  },

  /**
   * Saves skill gap analysis into students/{uid}/skillGap/current.
   */
  async saveAnalysis(uid: string, analysis: SkillGapAnalysis): Promise<void> {
    if (!uid || typeof window === 'undefined' || !db) return;

    const docRef = doc(db, 'students', uid, 'skillGap', 'current');
    await setDoc(docRef, analysis, { merge: true });
  },

  /**
   * Recalculates skill gap deterministically and persists analysis.
   */
  async computeAndSaveSkillGap(uid: string): Promise<SkillGapAnalysis> {
    if (!uid) throw new Error('Student UID is required.');

    const profile = await studentService.getStudentProfile(uid);
    const targetRole = profile?.careerGoal?.targetRole || 'Software Engineer';
    const roleReq = await this.getRoleRequirement(targetRole);

    const analysis = calculateSkillGap(profile, roleReq);
    await this.saveAnalysis(uid, analysis);

    return analysis;
  },

  /**
   * Updates student skill proficiency score (0-100) in students/{uid}.
   */
  async updateSkillProficiency(
    uid: string,
    skill: string,
    level: number
  ): Promise<void> {
    if (!uid || !skill) return;
    const clampedLevel = Math.max(0, Math.min(100, Math.round(level)));

    if (typeof window !== 'undefined' && db) {
      const docRef = doc(db, 'students', uid);
      const snap = await getDoc(docRef);
      const existing = (snap.data()?.skillProficiencies as Record<string, number>) || {};

      await updateDoc(docRef, {
        [`skillProficiencies.${skill}`]: clampedLevel,
        updatedAt: new Date().toISOString(),
      });
    }
  },
};
