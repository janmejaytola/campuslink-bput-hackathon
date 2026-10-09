import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { RecruiterJob, JobStatus } from '@/types/job';

export const jobService = {
  /**
   * Retrieves all jobs created by the specific recruiter.
   */
  async getRecruiterJobs(recruiterId: string): Promise<RecruiterJob[]> {
    if (!recruiterId || !db) return [];

    try {
      const q = query(collection(db, 'jobs'), where('recruiterId', '==', recruiterId));
      const snap = await getDocs(q);
      const jobs: RecruiterJob[] = [];
      snap.forEach((d) => {
        jobs.push({ id: d.id, ...d.data() } as RecruiterJob);
      });

      // Sort client-side by createdAt descending
      jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return jobs;
    } catch (err) {
      console.error('[Firestore Get Recruiter Jobs Error]:', err);
      throw err;
    }
  },

  /**
   * Alias for getRecruiterJobs
   */
  async getJobsByRecruiter(recruiterId: string): Promise<RecruiterJob[]> {
    return this.getRecruiterJobs(recruiterId);
  },

  /**
   * Retrieves all OPEN jobs for student eligibility checking.
   */
  async getOpenJobs(): Promise<RecruiterJob[]> {
    if (!db) return [];

    try {
      const q = query(collection(db, 'jobs'), where('status', '==', 'OPEN'));
      const snap = await getDocs(q);
      const jobs: RecruiterJob[] = [];
      snap.forEach((d) => {
        jobs.push({ id: d.id, ...d.data() } as RecruiterJob);
      });

      // Sort client-side by createdAt descending
      jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return jobs;
    } catch (err) {
      console.error('[Firestore Get Open Jobs Error]:', err);
      return [];
    }
  },

  /**
   * Retrieves all jobs across all recruiters for placement officer overview.
   */
  async getAllJobs(): Promise<RecruiterJob[]> {
    if (!db) return [];

    try {
      const snap = await getDocs(collection(db, 'jobs'));
      const jobs: RecruiterJob[] = [];
      snap.forEach((d) => {
        jobs.push({ id: d.id, ...d.data() } as RecruiterJob);
      });

      jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return jobs;
    } catch (err) {
      console.error('[Firestore Get All Jobs Error]:', err);
      return [];
    }
  },

  /**
   * Retrieves a single job by ID.
   */
  async getJobById(jobId: string): Promise<RecruiterJob | null> {
    if (!jobId || !db) return null;

    try {
      const docRef = doc(db, 'jobs', jobId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as RecruiterJob;
      }
    } catch (err) {
      console.error('[Firestore Get Job By ID Error]:', err);
    }
    return null;
  },

  /**
   * Creates a new job posting in jobs/{jobId}.
   */
  async createJob(
    recruiterId: string,
    data: Omit<RecruiterJob, 'id' | 'recruiterId' | 'createdAt' | 'updatedAt'>
  ): Promise<RecruiterJob> {
    if (!recruiterId) throw new Error('Recruiter ID is required.');
    if (!db) throw new Error('Firestore is not initialized.');

    const newDocRef = doc(collection(db, 'jobs'));
    const now = new Date().toISOString();

    const newJob: RecruiterJob = {
      ...data,
      id: newDocRef.id,
      recruiterId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(newDocRef, newJob);
    return newJob;
  },

  /**
   * Updates an existing job posting.
   */
  async updateJob(
    jobId: string,
    recruiterId: string,
    updates: Partial<Omit<RecruiterJob, 'id' | 'recruiterId' | 'createdAt'>>
  ): Promise<void> {
    if (!jobId || !recruiterId || !db) return;

    const docRef = doc(db, 'jobs', jobId);
    const existing = await getDoc(docRef);
    if (!existing.exists()) throw new Error('Job not found.');
    if (existing.data().recruiterId !== recruiterId) {
      throw new Error('Unauthorized to modify this job.');
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Updates job status (DRAFT | OPEN | CLOSED).
   */
  async updateJobStatus(jobId: string, recruiterId: string, status: JobStatus): Promise<void> {
    return this.updateJob(jobId, recruiterId, { status });
  },

  /**
   * Clones an existing job into a fresh DRAFT document.
   */
  async duplicateJob(jobId: string, recruiterId: string): Promise<RecruiterJob> {
    const existing = await this.getJobById(jobId);
    if (!existing) throw new Error('Original job not found.');
    if (existing.recruiterId !== recruiterId) throw new Error('Unauthorized.');

    const newDocRef = doc(collection(db, 'jobs'));
    const now = new Date().toISOString();

    const clonedJob: RecruiterJob = {
      ...existing,
      id: newDocRef.id,
      recruiterId,
      title: `${existing.title} (Copy)`,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(newDocRef, clonedJob);
    return clonedJob;
  },

  /**
   * Deletes a job posting and its associated JD file if present.
   */
  async deleteJob(jobId: string, recruiterId: string, storagePath?: string): Promise<void> {
    if (!jobId || !recruiterId || !db) return;

    const docRef = doc(db, 'jobs', jobId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().recruiterId !== recruiterId) {
      throw new Error('Unauthorized to delete this job.');
    }

    await deleteDoc(docRef);

    // Delete JD file from storage if present
    if (storagePath && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('[Storage delete warning]:', err);
      }
    }
  },

  /**
   * Uploads JD file to Firebase Storage under jobs/{recruiterUid}/{jobId}/jd/{fileName}.
   */
  async uploadJdFile(
    recruiterId: string,
    jobId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<{ downloadURL: string; storagePath: string }> {
    if (!storage) throw new Error('Firebase Storage is not initialized.');

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `jobs/${recruiterId}/${jobId}/jd/${cleanName}`;
    const fileRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type || 'application/pdf',
      customMetadata: {
        recruiterId,
        jobId,
        originalName: file.name,
      },
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('[Storage Upload Error]:', error);
          reject(new Error('Failed to upload JD file to cloud storage.'));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadURL, storagePath });
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });
  },
};
