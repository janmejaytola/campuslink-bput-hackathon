import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  InterviewRecord,
  InterviewStatus,
  InterviewConflict,
  AvailableTimeSlot,
  CreateInterviewParams,
  RescheduleInterviewParams,
  CancelInterviewParams,
} from '@/types/interview';
import { shortlistService } from './shortlistService';
import { notificationService } from './notificationService';

const localInterviews: Map<string, InterviewRecord> = new Map();

export function checkTimeOverlap(
  dateA: string,
  startA: string,
  endA: string,
  dateB: string,
  startB: string,
  endB: string
): boolean {
  if (dateA !== dateB) return false;

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map((num) => parseInt(num, 10));
    return (h || 0) * 60 + (m || 0);
  };

  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export function generateAlternativeSlots(
  date: string,
  existingInterviews: InterviewRecord[],
  candidateId: string,
  interviewerId: string
): AvailableTimeSlot[] {
  const possibleSlots: { start: string; end: string; label: string }[] = [
    { start: '09:00', end: '09:45', label: '09:00 AM - 09:45 AM' },
    { start: '10:00', end: '10:45', label: '10:00 AM - 10:45 AM' },
    { start: '11:00', end: '11:45', label: '11:00 AM - 11:45 AM' },
    { start: '13:00', end: '13:45', label: '01:00 PM - 01:45 PM' },
    { start: '14:00', end: '14:45', label: '02:00 PM - 02:45 PM' },
    { start: '15:00', end: '15:45', label: '03:00 PM - 03:45 PM' },
    { start: '16:00', end: '16:45', label: '04:00 PM - 04:45 PM' },
  ];

  const available: AvailableTimeSlot[] = [];

  for (const slot of possibleSlots) {
    const hasOverlap = existingInterviews.some((rec) => {
      if (rec.status === 'CANCELLED') return false;
      const involvesParty = rec.candidateId === candidateId || rec.interviewerId === interviewerId;
      if (!involvesParty) return false;
      return checkTimeOverlap(date, slot.start, slot.end, rec.date, rec.startTime, rec.endTime);
    });

    if (!hasOverlap) {
      available.push({
        date,
        startTime: slot.start,
        endTime: slot.end,
        label: slot.label,
      });
    }
  }

  return available;
}

function getCollectionRef() {
  if (typeof window !== 'undefined' && db) {
    return collection(db, 'interviews');
  }
  return null;
}

export const interviewService = {
  getInterviewId(jobId: string, candidateId: string, date: string, startTime: string): string {
    const sanitizedTime = startTime.replace(':', '');
    return `int_${jobId}_${candidateId}_${date}_${sanitizedTime}`;
  },

  async detectConflicts(
    candidateId: string,
    interviewerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeInterviewId?: string
  ): Promise<InterviewConflict> {
    const all = await this.getAllActiveInterviews();

    const candidateClash = all.find((rec) => {
      if (rec.id === excludeInterviewId) return false;
      if (rec.status === 'CANCELLED') return false;
      if (rec.candidateId !== candidateId) return false;
      return checkTimeOverlap(date, startTime, endTime, rec.date, rec.startTime, rec.endTime);
    });

    const interviewerClash = all.find((rec) => {
      if (rec.id === excludeInterviewId) return false;
      if (rec.status === 'CANCELLED') return false;
      if (rec.interviewerId !== interviewerId) return false;
      return checkTimeOverlap(date, startTime, endTime, rec.date, rec.startTime, rec.endTime);
    });

    if (candidateClash && interviewerClash) {
      return {
        hasConflict: true,
        conflictType: 'MUTUAL_OVERLAP',
        conflictingInterview: candidateClash,
        message: `Both Candidate (${candidateClash.candidateName}) and Interviewer have conflicting interviews during ${startTime} - ${endTime} on ${date}.`,
      };
    }

    if (candidateClash) {
      return {
        hasConflict: true,
        conflictType: 'CANDIDATE_OVERLAP',
        conflictingInterview: candidateClash,
        message: `Candidate ${candidateClash.candidateName} already has an interview scheduled with ${candidateClash.company} (${candidateClash.roundName}) from ${candidateClash.startTime} to ${candidateClash.endTime}.`,
      };
    }

    if (interviewerClash) {
      return {
        hasConflict: true,
        conflictType: 'INTERVIEWER_OVERLAP',
        conflictingInterview: interviewerClash,
        message: `Interviewer (${interviewerClash.interviewerName}) already has an interview session booked from ${interviewerClash.startTime} to ${interviewerClash.endTime}.`,
      };
    }

    return {
      hasConflict: false,
      conflictType: 'NONE',
      message: 'Slot is completely clash-free.',
    };
  },

  async scheduleInterview(params: CreateInterviewParams): Promise<{
    success: boolean;
    interview?: InterviewRecord;
    conflict?: InterviewConflict;
    alternativeSlots?: AvailableTimeSlot[];
    error?: string;
  }> {
    const shortlist = await shortlistService.getRecord(params.jobId, params.candidateId);
    if (!shortlist || shortlist.status !== 'SHORTLISTED') {
      return {
        success: false,
        error: `Shortlist Gate Violation: Candidate ${params.candidateName || params.candidateId} is not in SHORTLISTED status for job ${params.jobId}. Only SHORTLISTED candidates can be scheduled.`,
      };
    }

    const conflict = await this.detectConflicts(
      params.candidateId,
      params.interviewerId,
      params.date,
      params.startTime,
      params.endTime
    );

    if (conflict.hasConflict) {
      const allActive = await this.getAllActiveInterviews();
      const alternativeSlots = generateAlternativeSlots(
        params.date,
        allActive,
        params.candidateId,
        params.interviewerId
      );

      return {
        success: false,
        conflict,
        alternativeSlots,
        error: conflict.message,
      };
    }

    const id = this.getInterviewId(params.jobId, params.candidateId, params.date, params.startTime);
    const now = new Date().toISOString();

    const record: InterviewRecord = {
      id,
      jobId: params.jobId,
      candidateId: params.candidateId,
      recruiterId: params.recruiterId,
      interviewerId: params.interviewerId,
      interviewerName: params.interviewerName,
      interviewerEmail: params.interviewerEmail,
      candidateName: params.candidateName || shortlist.candidateName || 'Candidate',
      candidateBranch: params.candidateBranch || shortlist.candidateBranch || 'Engineering',
      candidateBatch: params.candidateBatch || shortlist.candidateBatch || '2026',
      candidateRegNo: params.candidateRegNo || shortlist.candidateRegNo || '',
      jobTitle: params.jobTitle || shortlist.jobTitle || 'Role',
      company: params.company || shortlist.company || 'Company',
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      mode: params.mode,
      locationOrLink: params.locationOrLink,
      roundName: params.roundName || 'Technical Interview Round',
      notes: params.notes || '',
      status: 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
      scheduledBy: params.recruiterId,
    };

    localInterviews.set(id, record);

    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'interviews', id);
        await setDoc(docRef, record);
      } catch (err) {
        console.warn('[interviewService.scheduleInterview] Firestore fallback to memory:', err);
      }
    }

    try {
      await notificationService.createNotification({
        userId: params.candidateId,
        role: 'STUDENT',
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview Scheduled: ${record.company}`,
        message: `Your ${record.roundName} with ${record.company} is confirmed for ${record.date} from ${record.startTime} to ${record.endTime} (${record.mode}).`,
        link: '/student/schedule',
        metadata: {
          interviewId: record.id,
          jobId: record.jobId,
          candidateId: record.candidateId,
          date: record.date,
          time: `${record.startTime} - ${record.endTime}`,
          company: record.company,
        },
      });
    } catch (notifErr) {
      console.warn('[notificationService error]:', notifErr);
    }

    return {
      success: true,
      interview: record,
    };
  },

  async rescheduleInterview(params: RescheduleInterviewParams): Promise<{
    success: boolean;
    interview?: InterviewRecord;
    conflict?: InterviewConflict;
    alternativeSlots?: AvailableTimeSlot[];
    error?: string;
  }> {
    const existing = await this.getInterview(params.interviewId);
    if (!existing) {
      return { success: false, error: 'Interview not found.' };
    }

    const conflict = await this.detectConflicts(
      existing.candidateId,
      existing.interviewerId,
      params.date,
      params.startTime,
      params.endTime,
      existing.id
    );

    if (conflict.hasConflict) {
      const allActive = await this.getAllActiveInterviews();
      const alternativeSlots = generateAlternativeSlots(
        params.date,
        allActive,
        existing.candidateId,
        existing.interviewerId
      );

      return {
        success: false,
        conflict,
        alternativeSlots,
        error: conflict.message,
      };
    }

    const now = new Date().toISOString();
    const updated: InterviewRecord = {
      ...existing,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      mode: params.mode || existing.mode,
      locationOrLink: params.locationOrLink || existing.locationOrLink,
      status: 'RESCHEDULED',
      rescheduleReason: params.reason,
      updatedAt: now,
    };

    localInterviews.set(updated.id, updated);

    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'interviews', updated.id);
        await updateDoc(docRef, {
          date: updated.date,
          startTime: updated.startTime,
          endTime: updated.endTime,
          mode: updated.mode,
          locationOrLink: updated.locationOrLink,
          status: 'RESCHEDULED',
          rescheduleReason: params.reason,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('[interviewService.rescheduleInterview] Firestore fallback:', err);
      }
    }

    await notificationService.createNotification({
      userId: updated.candidateId,
      role: 'STUDENT',
      type: 'INTERVIEW_RESCHEDULED',
      title: `Interview Rescheduled: ${updated.company}`,
      message: `Your interview with ${updated.company} has been moved to ${updated.date} (${updated.startTime} - ${updated.endTime}). Reason: ${params.reason}`,
      link: '/student/schedule',
      metadata: {
        interviewId: updated.id,
        jobId: updated.jobId,
        candidateId: updated.candidateId,
        date: updated.date,
        time: `${updated.startTime} - ${updated.endTime}`,
        company: updated.company,
      },
    });

    return {
      success: true,
      interview: updated,
    };
  },

  async cancelInterview(params: CancelInterviewParams): Promise<{
    success: boolean;
    interview?: InterviewRecord;
    error?: string;
  }> {
    const existing = await this.getInterview(params.interviewId);
    if (!existing) {
      return { success: false, error: 'Interview record not found.' };
    }

    const now = new Date().toISOString();
    const updated: InterviewRecord = {
      ...existing,
      status: 'CANCELLED',
      cancellationReason: params.reason,
      updatedAt: now,
    };

    localInterviews.set(updated.id, updated);

    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'interviews', updated.id);
        await updateDoc(docRef, {
          status: 'CANCELLED',
          cancellationReason: params.reason,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('[interviewService.cancelInterview] Firestore fallback:', err);
      }
    }

    await notificationService.createNotification({
      userId: updated.candidateId,
      role: 'STUDENT',
      type: 'INTERVIEW_CANCELLED',
      title: `Interview Cancelled: ${updated.company}`,
      message: `Your interview for ${updated.jobTitle} with ${updated.company} was cancelled. Reason: ${params.reason}`,
      link: '/student/schedule',
      metadata: {
        interviewId: updated.id,
        jobId: updated.jobId,
        candidateId: updated.candidateId,
        company: updated.company,
      },
    });

    return {
      success: true,
      interview: updated,
    };
  },

  async getInterview(interviewId: string): Promise<InterviewRecord | null> {
    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'interviews', interviewId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const rec = snap.data() as InterviewRecord;
          localInterviews.set(rec.id, rec);
          return rec;
        }
      } catch (err) {
        console.warn('[interviewService.getInterview] Firestore fallback:', err);
      }
    }
    return localInterviews.get(interviewId) || null;
  },

  async getAllActiveInterviews(): Promise<InterviewRecord[]> {
    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const snap = await getDocs(colRef);
        const results: InterviewRecord[] = [];
        snap.forEach((d) => {
          const rec = d.data() as InterviewRecord;
          results.push(rec);
          localInterviews.set(rec.id, rec);
        });
        if (results.length > 0) return results;
      } catch (err) {
        console.warn('[interviewService.getAllActiveInterviews] Firestore fallback to memory:', err);
      }
    }
    return Array.from(localInterviews.values());
  },

  async getInterviewsForStudent(candidateId: string): Promise<InterviewRecord[]> {
    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const q = query(colRef, where('candidateId', '==', candidateId));
        const snap = await getDocs(q);
        const results: InterviewRecord[] = [];
        snap.forEach((d) => {
          const rec = d.data() as InterviewRecord;
          results.push(rec);
          localInterviews.set(rec.id, rec);
        });
        if (results.length > 0) {
          return results.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
        }
      } catch (err) {
        console.warn('[interviewService.getInterviewsForStudent] Firestore fallback:', err);
      }
    }

    const memoryList = Array.from(localInterviews.values()).filter((r) => r.candidateId === candidateId);
    return memoryList.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  },

  async getInterviewsForRecruiter(recruiterId: string, jobId?: string): Promise<InterviewRecord[]> {
    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        let q = query(colRef, where('recruiterId', '==', recruiterId));
        if (jobId) {
          q = query(colRef, where('recruiterId', '==', recruiterId), where('jobId', '==', jobId));
        }
        const snap = await getDocs(q);
        const results: InterviewRecord[] = [];
        snap.forEach((d) => {
          const rec = d.data() as InterviewRecord;
          results.push(rec);
          localInterviews.set(rec.id, rec);
        });
        if (results.length > 0) {
          return results.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
        }
      } catch (err) {
        console.warn('[interviewService.getInterviewsForRecruiter] Firestore fallback:', err);
      }
    }

    const memoryList = Array.from(localInterviews.values()).filter((r) => {
      if (r.recruiterId !== recruiterId) return false;
      if (jobId && r.jobId !== jobId) return false;
      return true;
    });
    return memoryList.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  },

  async getAllInterviewsForOfficer(): Promise<InterviewRecord[]> {
    return this.getAllActiveInterviews();
  },

  async createInterview(params: {
    jobId: string;
    jobTitle?: string;
    company?: string;
    candidateId: string;
    candidateName: string;
    candidateEmail?: string;
    recruiterId: string;
    roundType?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    venue?: string;
    interviewerName?: string;
    meetingLink?: string;
    status?: InterviewStatus;
  }): Promise<{ success: boolean; interview?: InterviewRecord; error?: string }> {
    const date = params.scheduledDate || new Date().toISOString().split('T')[0];
    const startTime = params.scheduledTime || '10:00';
    const id = this.getInterviewId(params.jobId, params.candidateId, date, startTime);
    const now = new Date().toISOString();

    const record: InterviewRecord = {
      id,
      jobId: params.jobId,
      candidateId: params.candidateId,
      recruiterId: params.recruiterId,
      interviewerId: `intv_${params.recruiterId}`,
      interviewerName: params.interviewerName || 'Panel Evaluator',
      candidateName: params.candidateName,
      candidateBranch: 'Computer Science and Engineering',
      candidateBatch: '2026',
      candidateRegNo: '2201106284',
      jobTitle: params.jobTitle || 'Placement Role',
      company: params.company || 'Corporate Hiring Partner',
      date,
      startTime,
      endTime: '11:00 AM',
      scheduledDate: date,
      scheduledTime: startTime,
      venue: params.venue || 'Placement Block Room 302',
      meetingLink: params.meetingLink,
      mode: 'HYBRID',
      locationOrLink: params.venue || params.meetingLink || 'Placement Cell / Google Meet',
      roundName: params.roundType ? `${params.roundType} Round` : 'Technical Interview Round',
      roundType: params.roundType || 'TECHNICAL',
      notes: params.venue ? `Venue: ${params.venue}` : '',
      status: params.status || 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
      scheduledBy: params.recruiterId,
    };

    localInterviews.set(id, record);

    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'interviews', id);
        await setDoc(docRef, record);
      } catch (err) {
        console.warn('[interviewService.createInterview] Firestore fallback to memory:', err);
      }
    }

    return {
      success: true,
      interview: record,
    };
  },

  async updateInterviewStatus(interviewId: string, status: InterviewStatus): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getInterview(interviewId);
    if (!existing) {
      return { success: false, error: 'Interview not found.' };
    }
    const updated = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };
    localInterviews.set(interviewId, updated);
    const colRef = getCollectionRef();
    if (colRef && db) {
      try {
        const docRef = doc(db, 'interviews', interviewId);
        await updateDoc(docRef, { status, updatedAt: updated.updatedAt });
      } catch (err) {
        console.warn('[interviewService.updateInterviewStatus] Firestore fallback:', err);
      }
    }
    return { success: true };
  },

  clearMemoryStore(): void {
    localInterviews.clear();
  },
};
