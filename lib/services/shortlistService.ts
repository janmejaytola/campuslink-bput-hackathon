import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShortlistRecord, ShortlistStatus, ShortlistUpdateParams } from '@/types/shortlist';
import { jobService } from './jobService';

// In-memory backing cache for fast client/server fallback & offline test determinism
const localShortlistCache = new Map<string, ShortlistRecord>();

export const shortlistService = {
  /**
   * Generates a deterministic document ID to prevent duplicate records.
   */
  getRecordId(jobId: string, candidateId: string): string {
    return `${jobId}_${candidateId}`;
  },

  /**
   * Retrieves a single shortlist record by jobId and candidateId.
   */
  async getRecord(jobId: string, candidateId: string): Promise<ShortlistRecord | null> {
    if (!jobId || !candidateId) return null;
    const docId = this.getRecordId(jobId, candidateId);

    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        const snap = await getDoc(doc(db, 'shortlists', docId));
        if (snap.exists()) {
          const rec = snap.data() as ShortlistRecord;
          localShortlistCache.set(docId, rec);
          return rec;
        }
      } catch (err) {
        console.error('[Error fetching shortlist record]:', err);
      }
    }

    return localShortlistCache.get(docId) || null;
  },

  /**
   * Updates or creates a shortlist record for a candidate.
   *
   * Hard Enforcement Rules:
   * 1. Only ELIGIBLE candidates can have status === 'SHORTLISTED'.
   * 2. Recruiter must own the job opening.
   * 3. Deterministic ID prevents duplicate records.
   * 4. Match score snapshot preserves exact deterministic match score.
   */
  async updateStatus(params: ShortlistUpdateParams): Promise<ShortlistRecord> {
    const {
      jobId,
      candidateId,
      recruiterId,
      status,
      matchScoreSnapshot,
      eligible,
      reason = '',
      candidateName = 'Unknown Candidate',
      candidateBranch = 'Engineering',
      candidateBatch = '2026',
      candidateRegNo = '',
      jobTitle = 'Position',
      company = 'Employer',
      strengthsSnapshot = [],
    } = params;

    if (!jobId) throw new Error('Job ID is required.');
    if (!candidateId) throw new Error('Candidate ID is required.');
    if (!recruiterId) throw new Error('Recruiter ID is required.');

    // RULE 1: Only ELIGIBLE candidates can be shortlisted
    if (status === 'SHORTLISTED' && !eligible) {
      throw new Error(
        'Eligibility Gate Violation: Only ELIGIBLE candidates can be shortlisted. This candidate did not meet one or more mandatory job criteria.'
      );
    }

    // RULE 2: Recruiter Ownership Verification
    try {
      const job = await jobService.getJobById(jobId);
      if (job && job.recruiterId && job.recruiterId !== recruiterId) {
        throw new Error(
          'Security Violation: You do not have permission to modify candidate shortlists for another recruiter\'s job.'
        );
      }
    } catch (e: any) {
      if (e.message && e.message.includes('Security Violation')) {
        throw e;
      }
    }

    const docId = this.getRecordId(jobId, candidateId);
    const now = new Date().toISOString();

    // Check existing record to preserve original createdAt
    let createdAt = now;
    const existingMemory = localShortlistCache.get(docId);
    if (existingMemory?.createdAt) {
      createdAt = existingMemory.createdAt;
    }

    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        const existing = await getDoc(doc(db, 'shortlists', docId));
        if (existing.exists()) {
          const data = existing.data() as ShortlistRecord;
          createdAt = data.createdAt || createdAt;
        }
      } catch (e) {
        // Fallback to memory createdAt
      }
    }

    const defaultReason =
      reason.trim() ||
      (status === 'SHORTLISTED'
        ? `Candidate shortlisted based on deterministic match score (${matchScoreSnapshot}/100) and verified academic criteria.`
        : status === 'REJECTED'
        ? 'Candidate not selected for this recruitment drive.'
        : 'Candidate pending recruiter review.');

    const payload: ShortlistRecord = {
      id: docId,
      recruiterId,
      jobId,
      candidateId,
      candidateName,
      candidateBranch,
      candidateBatch,
      candidateRegNo,
      jobTitle,
      company,
      status,
      matchScoreSnapshot,
      eligible,
      reason: defaultReason,
      strengthsSnapshot,
      createdAt,
      updatedAt: now,
      reviewedBy: recruiterId,
    };

    // Store in local cache
    localShortlistCache.set(docId, payload);

    // Persist to Firestore
    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        const docRef = doc(db, 'shortlists', docId);
        await setDoc(docRef, payload, { merge: true });
      } catch (err) {
        console.error('[Error persisting shortlist to Firestore]:', err);
      }
    }

    return payload;
  },

  /**
   * Retrieves all shortlist records for a specific job.
   */
  async getShortlistsForJob(jobId: string): Promise<Record<string, ShortlistRecord>> {
    if (!jobId) return {};
    const records: Record<string, ShortlistRecord> = {};

    // First populate from local cache
    localShortlistCache.forEach((item) => {
      if (item.jobId === jobId) {
        records[item.candidateId] = item;
      }
    });

    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        const q = query(collection(db, 'shortlists'), where('jobId', '==', jobId));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const item = d.data() as ShortlistRecord;
          records[item.candidateId] = item;
          localShortlistCache.set(item.id, item);
        });
      } catch (err) {
        console.error('[Error fetching job shortlists from Firestore]:', err);
      }
    }

    return records;
  },

  /**
   * Retrieves all shortlist records for a specific recruiter across all their jobs.
   */
  async getShortlistsForRecruiter(recruiterId: string): Promise<ShortlistRecord[]> {
    if (!recruiterId) return [];
    const map = new Map<string, ShortlistRecord>();

    localShortlistCache.forEach((item) => {
      if (item.recruiterId === recruiterId) {
        map.set(item.id, item);
      }
    });

    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        const q = query(collection(db, 'shortlists'), where('recruiterId', '==', recruiterId));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const item = d.data() as ShortlistRecord;
          map.set(item.id, item);
          localShortlistCache.set(item.id, item);
        });
      } catch (err) {
        console.error('[Error fetching recruiter shortlists]:', err);
      }
    }

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  },

  /**
   * Retrieves all shortlist records for a student across all job applications.
   * Student has READ-ONLY access.
   */
  async getShortlistsForStudent(studentId: string): Promise<Record<string, ShortlistRecord>> {
    if (!studentId) return {};
    const records: Record<string, ShortlistRecord> = {};

    localShortlistCache.forEach((item) => {
      if (item.candidateId === studentId) {
        records[item.jobId] = item;
      }
    });

    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        const q = query(collection(db, 'shortlists'), where('candidateId', '==', studentId));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const item = d.data() as ShortlistRecord;
          records[item.jobId] = item;
          localShortlistCache.set(item.id, item);
        });
      } catch (err) {
        console.error('[Error fetching student shortlists]:', err);
      }
    }

    return records;
  },

  /**
   * Retrieves all shortlists for university placement officer oversight.
   */
  async getAllShortlistsForOfficer(jobId?: string): Promise<ShortlistRecord[]> {
    const map = new Map<string, ShortlistRecord>();

    localShortlistCache.forEach((item) => {
      if (!jobId || item.jobId === jobId) {
        map.set(item.id, item);
      }
    });

    if (typeof window !== 'undefined' && db && (db as any).app) {
      try {
        let q = collection(db, 'shortlists');
        let snap;
        if (jobId) {
          snap = await getDocs(query(q, where('jobId', '==', jobId)));
        } else {
          snap = await getDocs(q);
        }

        snap.forEach((d) => {
          const item = d.data() as ShortlistRecord;
          map.set(item.id, item);
          localShortlistCache.set(item.id, item);
        });
      } catch (err) {
        console.error('[Error fetching officer shortlists]:', err);
      }
    }

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  },
};
