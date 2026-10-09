import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authService } from '@/lib/auth/authService';
import { StrictRole } from '@/types/auth';

export interface UserNotificationSettings {
  applicationUpdates: boolean;
  interviewReminders: boolean;
  offerAlerts: boolean;
  driveAnnouncements: boolean;
  platformNotices: boolean;
  emailDigest: boolean;
  inAppSounds: boolean;
}

export interface UserPrivacySettings {
  profileVisibility: 'all_verified' | 'invited_only' | 'private';
  allowAiResumeIndexing: boolean;
  showCohortRank: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  density: 'comfortable' | 'compact';
  reducedMotion: boolean;
  highContrast: boolean;
  notifications: UserNotificationSettings;
  privacy: UserPrivacySettings;
  updatedAt?: string;
}

export const DEFAULT_STUDENT_NOTIFICATIONS: UserNotificationSettings = {
  applicationUpdates: true,
  interviewReminders: true,
  offerAlerts: true,
  driveAnnouncements: true,
  platformNotices: true,
  emailDigest: true,
  inAppSounds: false,
};

export const DEFAULT_RECRUITER_NOTIFICATIONS: UserNotificationSettings = {
  applicationUpdates: true,
  interviewReminders: true,
  offerAlerts: true,
  driveAnnouncements: false,
  platformNotices: true,
  emailDigest: true,
  inAppSounds: true,
};

export const DEFAULT_OFFICER_NOTIFICATIONS: UserNotificationSettings = {
  applicationUpdates: true,
  interviewReminders: true,
  offerAlerts: true,
  driveAnnouncements: true,
  platformNotices: true,
  emailDigest: true,
  inAppSounds: false,
};

export const DEFAULT_PRIVACY: UserPrivacySettings = {
  profileVisibility: 'all_verified',
  allowAiResumeIndexing: true,
  showCohortRank: true,
};

export const settingsService = {
  /**
   * Retrieves user settings from Firestore user document or returns defaults.
   */
  async getUserSettings(uid: string, role?: StrictRole): Promise<UserPreferences> {
    const defaultNotifs =
      role === 'RECRUITER'
        ? DEFAULT_RECRUITER_NOTIFICATIONS
        : role === 'PLACEMENT_OFFICER'
        ? DEFAULT_OFFICER_NOTIFICATIONS
        : DEFAULT_STUDENT_NOTIFICATIONS;

    const defaults: UserPreferences = {
      theme: 'dark',
      density: 'comfortable',
      reducedMotion: false,
      highContrast: false,
      notifications: defaultNotifs,
      privacy: DEFAULT_PRIVACY,
    };

    if (!uid) return defaults;

    // First check local storage cache if available
    try {
      const localCached = localStorage.getItem(`campuslink_settings_${uid}`);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        defaults.notifications = { ...defaults.notifications, ...parsed.notifications };
        defaults.privacy = { ...defaults.privacy, ...parsed.privacy };
      }
    } catch (e) {
      // ignore
    }

    // Try fetching from Firestore
    if (typeof window !== 'undefined' && db && db.type) {
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.settings) {
            return {
              ...defaults,
              ...data.settings,
              notifications: {
                ...defaults.notifications,
                ...(data.settings.notifications || {}),
              },
              privacy: {
                ...defaults.privacy,
                ...(data.settings.privacy || {}),
              },
            };
          }
        }
      } catch (err) {
        console.warn('[settingsService] Firestore fetch error, using local/default:', err);
      }
    }

    return defaults;
  },

  /**
   * Saves user settings to Firestore under users/{uid}.settings and caches locally.
   */
  async saveUserSettings(
    uid: string,
    settings: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const updatedAt = new Date().toISOString();
    const updatedSettings = {
      ...settings,
      updatedAt,
    };

    // Cache to localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`campuslink_settings_${uid}`, JSON.stringify(updatedSettings));
      }
    } catch (e) {
      console.warn('[settingsService] Local storage cache failed:', e);
    }

    // Update in Firestore
    if (typeof window !== 'undefined' && db && db.type && uid) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          settings: updatedSettings,
          updatedAt,
        });
      } catch (err) {
        console.warn('[settingsService] Firestore update failed, trying setDoc merge:', err);
        try {
          const userRef = doc(db, 'users', uid);
          await setDoc(userRef, { settings: updatedSettings, updatedAt }, { merge: true });
        } catch (innerErr) {
          console.error('[settingsService] Failed to persist settings to Firestore:', innerErr);
        }
      }
    }

    return updatedSettings as UserPreferences;
  },

  /**
   * Triggers real Firebase Authentication password reset email.
   */
  async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      await authService.resetPassword(email.trim().toLowerCase());
      return {
        success: true,
        message: `A secure password reset email has been dispatched by Firebase Authentication to ${email}. Please check your inbox or spam folder.`,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to dispatch password reset email.');
    }
  },
};
