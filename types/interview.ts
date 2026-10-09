export type InterviewStatus = 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

export type InterviewMode = 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';

export interface InterviewRecord {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail?: string;

  // Candidate Snapshot
  candidateName: string;
  candidateBranch: string;
  candidateBatch: string;
  candidateRegNo: string;
  jobTitle: string;
  company: string;

  // Scheduling details
  date: string;
  startTime: string;
  endTime: string;
  mode: InterviewMode;
  locationOrLink: string;
  roundName: string;
  notes?: string;

  // Status & Lifecycle
  status: InterviewStatus;
  rescheduleReason?: string;
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  scheduledBy: string;
}

export interface InterviewConflict {
  hasConflict: boolean;
  conflictType: 'CANDIDATE_OVERLAP' | 'INTERVIEWER_OVERLAP' | 'MUTUAL_OVERLAP' | 'NONE';
  conflictingInterview?: InterviewRecord;
  message: string;
}

export interface AvailableTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface CreateInterviewParams {
  jobId: string;
  candidateId: string;
  recruiterId: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail?: string;
  candidateName?: string;
  candidateBranch?: string;
  candidateBatch?: string;
  candidateRegNo?: string;
  jobTitle?: string;
  company?: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: InterviewMode;
  locationOrLink: string;
  roundName?: string;
  notes?: string;
}

export interface RescheduleInterviewParams {
  interviewId: string;
  date: string;
  startTime: string;
  endTime: string;
  mode?: InterviewMode;
  locationOrLink?: string;
  reason: string;
  rescheduledBy: string;
}

export interface CancelInterviewParams {
  interviewId: string;
  reason: string;
  cancelledBy: string;
}
