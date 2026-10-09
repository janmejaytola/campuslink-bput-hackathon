import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { profileService } from './profileService';
import { validateRoleSelection } from './authorization';
import { StrictRole, UserRecord } from '@/types/auth';
import { studentService } from '@/lib/services/studentService';

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: StrictRole;
  regNumber?: string;
  department?: string;
  company?: string;
  institution?: string;
}

export interface AuthResult {
  user: UserRecord;
}

export function formatAuthError(error: unknown): string {
  // Always log original error to developer console for diagnosis
  console.error('[Firebase Auth Error Details]:', error);

  if (typeof error === 'string') return error;

  let code = '';
  let rawMessage = '';

  if (error && typeof error === 'object') {
    if ('code' in error && typeof (error as { code: string }).code === 'string') {
      code = (error as { code: string }).code;
    }
    if ('message' in error && typeof (error as { message: string }).message === 'string') {
      rawMessage = (error as { message: string }).message;
    }
  }

  if (code) {
    switch (code) {
      case 'auth/unauthorized-domain': {
        const domain = typeof window !== 'undefined' ? window.location.hostname : '';
        return domain
          ? `This application domain (${domain}) is not authorized for Firebase Google Sign-In. Add "${domain}" under Firebase Authentication → Settings → Authorized domains in project campuslink-4e78d.`
          : 'This application domain is not authorized for Firebase Google Sign-In. Add the current application domain under Firebase Authentication → Settings → Authorized domains.';
      }
      case 'auth/operation-not-allowed':
        return 'Google Sign-In is not enabled in Firebase Authentication.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the Google Sign-In popup. Allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In was cancelled (popup window was closed by user).';
      case 'auth/user-cancelled':
      case 'auth/access-denied':
        return 'Google Sign-In permission was not granted or was cancelled by the user. Please try again and accept permissions to continue.';
      case 'auth/cancelled-popup-request':
        return 'Google Sign-In request was cancelled because another popup was already open.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email address using a different sign-in method.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/too-many-requests':
        return 'Access temporarily restricted due to multiple failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact your administrator.';
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid.':
        return `Firebase Web API key is not valid for project campuslink-4e78d (${code}). Please check Project Settings in Firebase Console.`;
      case 'auth/configuration-not-found':
        return `Firebase Auth configuration not found (${code}). Ensure Google provider is enabled in Firebase Console.`;
      default:
        return `Authentication failed [${code}]: ${rawMessage || 'Please check your Firebase configuration and try again.'}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected authentication error occurred. Please try again.';
}

export const authService = {
  /**
   * Registers a new user with Firebase Authentication and creates their CAMPUSLINK profile in Firestore.
   */
  async register(params: RegisterParams): Promise<AuthResult> {
    const { name, email, password, role, regNumber, department, company, institution } = params;

    if (!name || name.trim().length < 2) {
      throw new Error('Please provide your full legal name.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (!role || (role !== 'STUDENT' && role !== 'PLACEMENT_OFFICER' && role !== 'RECRUITER')) {
      throw new Error('Please select a valid role (Student, Placement Officer, or Recruiter).');
    }

    try {
      if (!auth || !auth.app) {
        throw new Error('Firebase Authentication is not initialized.');
      }

      // 1. Create account with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      await updateProfile(userCredential.user, { displayName: name.trim() });

      // 2. Persist user profile in Firestore
      const now = new Date().toISOString();
      const userRecord: UserRecord = {
        uid,
        id: uid,
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        provider: 'password',
        role,
        regNumber: regNumber?.trim(),
        department: department?.trim(),
        company: company?.trim(),
        institution: institution?.trim() || 'Biju Patnaik University of Technology (BPUT)',
        createdAt: now,
        updatedAt: now,
      };

      await profileService.createUserProfile(userRecord);

      if (role === 'STUDENT') {
        try {
          await studentService.saveStudentProfile({
            uid,
            fullName: name.trim(),
            email: email.trim().toLowerCase(),
            phone: '',
            dateOfBirth: '',
            gender: '',
            bputRegistrationNumber: regNumber?.trim() || '2201106284',
            college: institution?.trim() || 'Silicon Institute of Technology',
            department: department?.trim() || 'Computer Science & Engineering',
            branch: department?.trim() || 'Computer Science and Engineering',
            semester: '7th Semester',
            graduationYear: '2026',
            cgpa: 8.45,
            backlogs: 0,
            skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
            skillProficiencies: {
              Python: 85,
              Java: 80,
              SQL: 75,
              'Data Structures': 82,
              Git: 78,
            },
            readinessInputs: {
              aptitudeScore: 82,
              technicalScore: 85,
              communicationScore: 80,
            },
            careerGoal: {
              targetRole: 'Software Engineer',
              jobType: 'Full-time',
              preferredLocation: 'Bhubaneswar, Bengaluru',
              workMode: 'Hybrid',
              expectedSalary: '8-12 LPA',
            },
            profileCompletion: 85,
            createdAt: now,
            updatedAt: now,
          });
        } catch (studentInitErr) {
          console.warn('[StudentProfile init note]:', studentInitErr);
        }
      }

      return { user: userRecord };
    } catch (err: unknown) {
      console.error('[Firebase Registration Error]:', err);
      throw new Error(formatAuthError(err));
    }
  },

  /**
   * Authenticates user via Firebase Authentication, retrieves their stored CAMPUSLINK role,
   * and strictly validates that the selected login role matches the stored role.
   */
  async login(email: string, password: string, selectedRole: StrictRole): Promise<AuthResult> {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    try {
      if (!auth || !auth.app) {
        throw new Error('Firebase Authentication is not initialized.');
      }

      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate with real Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;

      // 2. Retrieve user's stored CAMPUSLINK profile from Firestore
      const userRecord = await profileService.getUserProfile(uid);

      if (!userRecord) {
        // Sign out immediately if profile does not exist
        await signOut(auth);
        throw new Error('User profile record not found. Please contact administration or register.');
      }

      // 3. Validate that the selected login role matches the stored role
      const roleCheck = validateRoleSelection(userRecord.role, selectedRole);
      if (!roleCheck.valid) {
        // Disallow login, sign out immediately, and do NOT alter stored role
        await signOut(auth);
        throw new Error(roleCheck.message || 'Selected role does not match registered account role.');
      }

      return { user: userRecord };
    } catch (err: unknown) {
      console.error('[Firebase Login Error]:', err);
      throw new Error(formatAuthError(err));
    }
  },

  /**
   * Real Google Authentication via Firebase signInWithPopup.
   * If user already has a profile in Firestore:
   *   - Retains the stored role (does NOT overwrite).
   * If new Google user:
   *   - Creates user document in Firestore with the selected role.
   */
  async loginWithGoogle(selectedRole: StrictRole): Promise<AuthResult> {
    if (!auth || !auth.app) {
      throw new Error('Firebase Authentication is not initialized.');
    }

    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, googleProvider);
      const fbUser = credential.user;
      const uid = fbUser.uid;

      // Check whether users/{uid} exists in Firestore
      let userRecord: UserRecord;
      try {
        const existingProfile = await profileService.getUserProfile(uid);

        if (existingProfile) {
          // Existing Google user: Retain the stored role from Firestore!
          // Do NOT overwrite existing role with currently selected role.
          userRecord = existingProfile;
        } else {
          // New Google user: Create new user document with selected role
          const now = new Date().toISOString();
          const newProfile: UserRecord = {
            uid,
            id: uid,
            name: fbUser.displayName || 'BPUT Candidate',
            displayName: fbUser.displayName || 'BPUT Candidate',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            provider: 'google',
            role: selectedRole,
            institution: 'Biju Patnaik University of Technology (BPUT)',
            createdAt: now,
            updatedAt: now,
          };

          await profileService.createUserProfile(newProfile);
          userRecord = newProfile;
        }
      } catch (firestoreErr) {
        console.error('[Firebase Firestore Profile Error during Google Sign-In]:', firestoreErr);
        const now = new Date().toISOString();
        userRecord = {
          uid,
          id: uid,
          name: fbUser.displayName || 'BPUT Candidate',
          displayName: fbUser.displayName || 'BPUT Candidate',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          provider: 'google',
          role: selectedRole,
          institution: 'Biju Patnaik University of Technology (BPUT)',
          createdAt: now,
          updatedAt: now,
        };
      }

      return { user: userRecord };
    } catch (err: unknown) {
      console.error('[Firebase Google Auth Error]:', err);
      let code = '';
      if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: string }).code === 'string') {
        code = (err as { code: string }).code;
      }
      const formatted = formatAuthError(err);
      const customErr = new Error(formatted) as Error & { code?: string };
      customErr.code = code;
      throw customErr;
    }
  },

  /**
   * Sends a real Firebase password reset email.
   */
  async resetPassword(email: string): Promise<void> {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      if (!auth || !auth.app) {
        throw new Error('Firebase Authentication is not initialized.');
      }

      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    } catch (err: unknown) {
      console.error('[Firebase Password Reset Error]:', err);
      throw new Error(formatAuthError(err));
    }
  },

  /**
   * Signs the user out from Firebase Authentication.
   */
  async logout(): Promise<void> {
    if (auth && auth.app) {
      await signOut(auth);
    }
  },

  /**
   * Listens to persistent Firebase Authentication state and maps to CAMPUSLINK UserRecord.
   */
  subscribeToAuth(callback: (user: UserRecord | null) => void): () => void {
    if (typeof window === 'undefined' || !auth || !auth.app) {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        callback(null);
        return;
      }

      try {
        const profile = await profileService.getUserProfile(fbUser.uid);
        if (profile) {
          callback(profile);
        } else {
          // If no profile found in Firestore yet, provide base profile
          callback({
            uid: fbUser.uid,
            id: fbUser.uid,
            name: fbUser.displayName || 'BPUT Candidate',
            displayName: fbUser.displayName || 'BPUT Candidate',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            provider: 'google',
            role: 'STUDENT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('[Firebase Auth State Subscriber Error]:', err);
        callback(null);
      }
    });
  },
};
