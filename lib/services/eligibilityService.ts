import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentProfile, CertificationItem, InternshipItem } from '@/types/student';
import { RecruiterJob } from '@/types/job';
import { EligibilityEvaluation } from '@/types/eligibility';
import { evaluateEligibility } from './eligibilityEngine';

export const eligibilityService = {
  /**
   * Evaluates student eligibility for a job directly from Firestore records,
   * caches the evaluation document under `students/{studentId}/eligibility/{jobId}`,
   * and returns the deterministic result.
   */
  async checkEligibility(params: {
    studentId: string;
    jobId: string;
    callerUid?: string;
    callerRole?: string;
  }): Promise<EligibilityEvaluation> {
    const { studentId, jobId, callerUid, callerRole } = params;

    if (!studentId || !jobId) {
      throw new Error('Both studentId and jobId are required to evaluate eligibility.');
    }

    if (!db) {
      throw new Error('Firestore database instance is not initialized.');
    }

    // 1. Fetch Student Profile
    const studentDocRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentDocRef);

    if (!studentSnap.exists()) {
      throw new Error(`Student with ID ${studentId} was not found in Firestore.`);
    }

    const student = { uid: studentSnap.id, ...studentSnap.data() } as StudentProfile;

    // 2. Fetch Student Certifications Subcollection
    const certsColRef = collection(db, 'students', studentId, 'certifications');
    const certsSnap = await getDocs(certsColRef);
    const certifications: CertificationItem[] = [];
    certsSnap.forEach((c) => {
      certifications.push({ id: c.id, ...c.data() } as CertificationItem);
    });

    // 3. Fetch Student Internships Subcollection
    const internsColRef = collection(db, 'students', studentId, 'internships');
    const internsSnap = await getDocs(internsColRef);
    const internships: InternshipItem[] = [];
    internsSnap.forEach((i) => {
      internships.push({ id: i.id, ...i.data() } as InternshipItem);
    });

    // 4. Fetch Recruiter Job Posting
    const jobDocRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobDocRef);

    if (!jobSnap.exists()) {
      throw new Error(`Job posting with ID ${jobId} was not found in Firestore.`);
    }

    const job = { id: jobSnap.id, ...jobSnap.data() } as RecruiterJob;

    // 5. Run Pure Deterministic Engine
    const evaluation = evaluateEligibility({
      student,
      job,
      certifications,
      internships,
      evaluatedBy: callerUid ? `${callerRole || 'USER'}:${callerUid}` : 'CLIENT_EVALUATION',
    });

    // 6. Cache result in Firestore under students/{studentId}/eligibility/{jobId}
    try {
      const evalDocRef = doc(db, 'students', studentId, 'eligibility', jobId);
      await setDoc(evalDocRef, evaluation, { merge: true });
    } catch (saveErr) {
      console.warn('[EligibilityService] Failed to cache evaluation in Firestore:', saveErr);
      // Non-fatal, return computed evaluation
    }

    return evaluation;
  },

  /**
   * Retrieves previously cached eligibility evaluation from Firestore.
   */
  async getCachedEvaluation(
    studentId: string,
    jobId: string
  ): Promise<EligibilityEvaluation | null> {
    if (!studentId || !jobId || !db) return null;

    try {
      const evalDocRef = doc(db, 'students', studentId, 'eligibility', jobId);
      const snap = await getDoc(evalDocRef);
      if (snap.exists()) {
        return snap.data() as EligibilityEvaluation;
      }
    } catch (err) {
      console.error('[EligibilityService] Error fetching cached evaluation:', err);
    }
    return null;
  },

  /**
   * Retrieves all cached evaluations for a student.
   */
  async getAllStudentEvaluations(studentId: string): Promise<EligibilityEvaluation[]> {
    if (!studentId || !db) return [];

    try {
      const colRef = collection(db, 'students', studentId, 'eligibility');
      const snap = await getDocs(colRef);
      const evals: EligibilityEvaluation[] = [];
      snap.forEach((d) => {
        evals.push(d.data() as EligibilityEvaluation);
      });
      return evals;
    } catch (err) {
      console.error('[EligibilityService] Error fetching all evaluations:', err);
      return [];
    }
  },

  /**
   * Pure evaluation helper for direct objects (e.g. testing or local demo).
   */
  evaluateDirect(params: {
    student: Partial<StudentProfile>;
    job: Partial<RecruiterJob>;
    certifications?: CertificationItem[];
    internships?: InternshipItem[];
    evaluatedBy?: string;
  }): EligibilityEvaluation {
    return evaluateEligibility(params);
  },
};
