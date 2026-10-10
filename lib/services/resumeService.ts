import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
import { ResumeRecord } from '@/types/resume';

export enum FirestoreOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: FirestoreOperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function formatFirestoreError(
  error: unknown,
  operationType: FirestoreOperationType,
  path: string | null
): Error {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const currentUser = auth && 'currentUser' in auth ? auth.currentUser : null;

  const errInfo: FirestoreErrorInfo = {
    error: rawMessage,
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));

  if (
    rawMessage.toLowerCase().includes('missing or insufficient permissions') ||
    rawMessage.toLowerCase().includes('permission-denied')
  ) {
    return new Error(JSON.stringify(errInfo));
  }

  return new Error(`Firestore ${operationType} failed at ${path}: ${rawMessage}`);
}

export const resumeService = {
  /**
   * Uploads file binary to Firebase Storage at resumes/{uid}/{fileName}.
   * Returns storagePath and downloadURL.
   */
  async uploadFileToStorage(
    uid: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<{ storagePath: string; downloadURL: string }> {
    if (!uid) throw new Error('Student UID is required for upload.');
    if (!file) throw new Error('No file provided.');

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `resumes/${uid}/${Date.now()}_${safeName}`;

    if (typeof window !== 'undefined' && storage && storage.app) {
      try {
        const fileRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(fileRef, file, {
          contentType:
            file.type ||
            (file.name.toLowerCase().endsWith('.pdf')
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
          customMetadata: {
            uploadedBy: uid,
            originalName: file.name,
          },
        });

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              if (onProgress && snapshot.totalBytes > 0) {
                const pct = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                onProgress(pct);
              }
            },
            (error) => {
              console.error('[Firebase Storage Upload Error]:', error);
              reject(new Error(`Storage upload failed: ${error.message}`));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ storagePath, downloadURL });
              } catch (err) {
                console.error('[Firebase Storage getDownloadURL Error]:', err);
                resolve({ storagePath, downloadURL: '' });
              }
            }
          );
        });
      } catch (err: unknown) {
        console.error('[Firebase Storage Init Error]:', err);
        throw new Error(
          err instanceof Error
            ? err.message
            : 'Could not connect to Firebase Storage. Please verify storage permissions.'
        );
      }
    }

    throw new Error('Firebase Storage is not initialized.');
  },

  /**
   * Saves or updates resume metadata in Firestore: resumes/{uid}/files/{resumeId}.
   */
  async saveResumeRecord(record: ResumeRecord): Promise<void> {
    if (!record.uid || !record.id) {
      throw new Error('Valid UID and Resume ID are required.');
    }

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const path = `resumes/${record.uid}/files/${record.id}`;
    try {
      const docRef = doc(db, 'resumes', record.uid, 'files', record.id);
      await setDoc(docRef, record, { merge: true });
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.WRITE, path);
    }
  },

  /**
   * Updates partial metadata in Firestore: resumes/{uid}/files/{resumeId}.
   */
  async updateResumeRecord(
    uid: string,
    resumeId: string,
    updates: Partial<ResumeRecord>
  ): Promise<void> {
    if (!uid || !resumeId) {
      throw new Error('Valid UID and Resume ID are required to update resume record.');
    }

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const path = `resumes/${uid}/files/${resumeId}`;
    try {
      const docRef = doc(db, 'resumes', uid, 'files', resumeId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.UPDATE, path);
    }
  },

  /**
   * Retrieves all resume records for a student.
   */
  async getResumeRecords(uid: string): Promise<ResumeRecord[]> {
    if (!uid || typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      return [];
    }

    const path = `resumes/${uid}/files`;
    try {
      const colRef = collection(db, 'resumes', uid, 'files');
      const snap = await getDocs(colRef);
      const list: ResumeRecord[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data() as ResumeRecord;
        list.push({
          ...data,
          id: docSnap.id,
          uid,
        });
      });

      return list.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
    } catch (err) {
      throw formatFirestoreError(err, FirestoreOperationType.LIST, path);
    }
  },

  /**
   * Deletes a resume document from Firestore and removes the file from Firebase Storage.
   * Does NOT alter the student's profile.
   */
  async deleteResume(uid: string, resumeId: string, storagePath?: string): Promise<void> {
    if (!uid || !resumeId) {
      throw new Error('Valid UID and Resume ID are required to delete a resume.');
    }

    if (storagePath && typeof window !== 'undefined' && storage && storage.app) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('[Firebase Storage Delete Notice]:', err);
      }
    }

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const path = `resumes/${uid}/files/${resumeId}`;
    try {
      const docRef = doc(db, 'resumes', uid, 'files', resumeId);
      await deleteDoc(docRef);
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.DELETE, path);
    }
  },
};
