import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRecord } from '@/types/auth';

export const profileService = {
  /**
   * Persists user profile information separately from authentication credentials.
   * Does NOT store passwords.
   */
  async createUserProfile(profile: UserRecord): Promise<void> {
    if (!profile.uid) {
      throw new Error('User UID is required to create a profile.');
    }

    const payload: UserRecord = {
      uid: profile.uid,
      id: profile.uid,
      name: profile.name.trim(),
      displayName: profile.displayName || profile.name.trim(),
      email: profile.email.trim().toLowerCase(),
      photoURL: profile.photoURL || '',
      provider: profile.provider || 'password',
      role: profile.role,
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: profile.updatedAt || new Date().toISOString(),
      regNumber: profile.regNumber?.trim() || '',
      department: profile.department?.trim() || '',
      company: profile.company?.trim() || '',
      designation: profile.designation?.trim() || '',
      institution: profile.institution?.trim() || 'Biju Patnaik University of Technology (BPUT)',
      batch: profile.batch || 'Batch of 2026',
      cgpa: profile.cgpa || 8.5,
      phone: profile.phone || '',
    };

    if (typeof window !== 'undefined' && db) {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, payload);
    }
  },

  /**
   * Retrieves the user profile from Firestore by Firebase Authentication UID.
   */
  async getUserProfile(uid: string): Promise<UserRecord | null> {
    if (!uid) return null;

    if (typeof window !== 'undefined' && db) {
      try {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as UserRecord;
          return {
            ...data,
            uid: data.uid || uid,
            id: data.id || data.uid || uid,
          };
        }
      } catch (err) {
        console.error('Error fetching user profile from Firestore:', err);
        throw err;
      }
    }

    return null;
  },

  /**
   * Alias for getUserProfile.
   */
  async getProfile(uid: string): Promise<UserRecord | null> {
    return this.getUserProfile(uid);
  },

  /**
   * Alias for createUserProfile / save.
   */
  async saveProfile(profile: UserRecord): Promise<void> {
    return this.createUserProfile(profile);
  },

  /**
   * Updates user profile fields in Firestore.
   */
  async updateUserProfile(uid: string, updates: Partial<UserRecord>): Promise<void> {
    if (!uid) return;
    const updatedAt = new Date().toISOString();

    if (typeof window !== 'undefined' && db) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt,
      });
    }
  },

  /**
   * Alias for updateUserProfile.
   */
  async updateProfile(uid: string, updates: Partial<UserRecord>): Promise<void> {
    return this.updateUserProfile(uid, updates);
  },
};
