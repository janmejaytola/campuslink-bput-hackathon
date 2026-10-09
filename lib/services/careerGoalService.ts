import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CareerGoal } from '@/types/careerGoal';

export const careerGoalService = {
  /**
   * Retrieves career goal for the given student UID from students/{uid}.
   */
  async getCareerGoal(uid: string): Promise<CareerGoal | null> {
    if (!uid || typeof window === 'undefined' || !db) return null;

    try {
      const docRef = doc(db, 'students', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.careerGoal && data.careerGoal.targetRole) {
          const raw = data.careerGoal;
          return {
            targetRole: raw.targetRole || '',
            alternativeRoles: Array.isArray(raw.alternativeRoles) ? raw.alternativeRoles : [],
            jobTypes: Array.isArray(raw.jobTypes) ? raw.jobTypes : (raw.jobType ? [raw.jobType] : ['Full-time']),
            workModes: Array.isArray(raw.workModes) ? raw.workModes : (raw.workMode ? [raw.workMode] : ['Hybrid']),
            preferredLocations: Array.isArray(raw.preferredLocations)
              ? raw.preferredLocations
              : (raw.preferredLocation ? raw.preferredLocation.split(',').map((s: string) => s.trim()) : ['Bhubaneswar']),
            salaryPreference: raw.salaryPreference || {
              minimum: 6,
              maximum: 10,
              openToMarketRange: false,
            },
            interests: Array.isArray(raw.interests) ? raw.interests : [],
            industries: Array.isArray(raw.industries) ? raw.industries : [],
            customRole: raw.customRole || '',
            customInterests: Array.isArray(raw.customInterests) ? raw.customInterests : [],
            updatedAt: raw.updatedAt || new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.error('[Firestore Get Career Goal Error]:', err);
    }

    return null;
  },

  /**
   * Saves or updates the career goal in students/{uid} and stores history record.
   */
  async saveCareerGoal(uid: string, goal: CareerGoal): Promise<void> {
    if (!uid) throw new Error('Student UID is required.');

    const now = new Date().toISOString();
    const cleanGoal: CareerGoal = {
      ...goal,
      targetRole: goal.targetRole.trim(),
      alternativeRoles: (goal.alternativeRoles || []).filter((r) => r && r !== goal.targetRole),
      jobTypes: goal.jobTypes || ['Full-time'],
      workModes: goal.workModes || ['Hybrid'],
      preferredLocations: goal.preferredLocations || [],
      salaryPreference: {
        minimum: Number(goal.salaryPreference?.minimum) || 0,
        maximum: Number(goal.salaryPreference?.maximum) || 0,
        openToMarketRange: Boolean(goal.salaryPreference?.openToMarketRange),
      },
      interests: goal.interests || [],
      industries: goal.industries || [],
      customRole: goal.customRole?.trim() || '',
      updatedAt: now,
      // Keep legacy single-string properties updated for existing profile consumers
      jobType: goal.jobTypes?.[0] || 'Full-time',
      preferredLocation: (goal.preferredLocations || []).join(', ') || 'Anywhere in India',
      workMode: goal.workModes?.[0] || 'Hybrid',
      expectedSalary: goal.salaryPreference?.openToMarketRange
        ? 'Open to market range'
        : `${goal.salaryPreference?.minimum || 0}-${goal.salaryPreference?.maximum || 0} LPA`,
    };

    if (typeof window !== 'undefined' && db) {
      // 1. Update students/{uid}.careerGoal
      const docRef = doc(db, 'students', uid);
      await updateDoc(docRef, {
        careerGoal: cleanGoal,
        updatedAt: now,
      });

      // 2. Append history record in students/{uid}/careerGoalHistory/{goalId}
      try {
        const historyId = `goal_${Date.now()}`;
        const historyRef = doc(db, 'students', uid, 'careerGoalHistory', historyId);
        await setDoc(historyRef, {
          targetRole: cleanGoal.targetRole,
          alternativeRoles: cleanGoal.alternativeRoles,
          updatedAt: now,
        });
      } catch (histErr) {
        console.warn('[Career Goal History Notice]:', histErr);
      }
    }
  },
};
