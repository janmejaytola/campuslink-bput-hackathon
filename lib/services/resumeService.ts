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
import { db, storage } from '@/lib/firebase';
import { ResumeRecord } from '@/types/resume';

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

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `resumes/${uid}/${Date.now()}_${safeName}`;

    if (typeof window !== 'undefined' && storage && storage.app) {
      try {
        const fileRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(fileRef, file, {
          contentType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
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
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
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
                // Fallback storage path if download URL generation fails
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

    throw new Error('Firebase Storage is not available.');
  },

  /**
   * Saves or updates resume metadata in Firestore: resumes/{uid}/files/{resumeId}.
   */
  async saveResumeRecord(record: ResumeRecord): Promise<void> {
    if (!record.uid || !record.id) {
      throw new Error('Valid UID and Resume ID are required.');
    }

    if (typeof window !== 'undefined' && db) {
      const docRef = doc(db, 'resumes', record.uid, 'files', record.id);
      await setDoc(docRef, record, { merge: true });
    }
  },

  /**
   * Updates partial metadata in Firestore.
   */
  async updateResumeRecord(
    uid: string,
    resumeId: string,
    updates: Partial<ResumeRecord>
  ): Promise<void> {
    if (!uid || !resumeId) return;

    if (typeof window !== 'undefined' && db) {
      const docRef = doc(db, 'resumes', uid, 'files', resumeId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  /**
   * Retrieves all resume records for a student.
   */
  async getResumeRecords(uid: string): Promise<ResumeRecord[]> {
    if (!uid || typeof window === 'undefined' || !db) return [];

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
      console.error('[Firestore Get Resumes Error]:', err);
      return [];
    }
  },

  /**
   * Deletes a resume document from Firestore and removes the file from Firebase Storage.
   * Does NOT alter the student's profile.
   */
  async deleteResume(uid: string, resumeId: string, storagePath?: string): Promise<void> {
    if (!uid || !resumeId) return;

    // 1. Delete from Firebase Storage if storagePath exists
    if (storagePath && typeof window !== 'undefined' && storage && storage.app) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('[Firebase Storage Delete Notice]:', err);
      }
    }

    // 2. Delete metadata doc from Firestore
    if (typeof window !== 'undefined' && db) {
      const docRef = doc(db, 'resumes', uid, 'files', resumeId);
      await deleteDoc(docRef);
    }
  },
};
