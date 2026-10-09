export type NotificationType =
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_RESCHEDULED'
  | 'INTERVIEW_CANCELLED'
  | 'CANDIDATE_SHORTLISTED'
  | 'CANDIDATE_REJECTED'
  | 'GENERAL_ANNOUNCEMENT';

export interface PersistentNotification {
  id: string;
  userId: string;
  role: 'STUDENT' | 'RECRUITER' | 'PLACEMENT_OFFICER';
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: {
    interviewId?: string;
    jobId?: string;
    candidateId?: string;
    date?: string;
    time?: string;
    company?: string;
  };
  read: boolean;
  createdAt: string;
}
