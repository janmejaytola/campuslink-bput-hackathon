export type StrictRole = 'STUDENT' | 'PLACEMENT_OFFICER' | 'RECRUITER';

// Compatibility alias for route slugs
export type RouteRole = 'student' | 'officer' | 'recruiter';

export interface UserRecord {
  uid: string;
  id?: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  provider?: string;
  role: StrictRole;
  createdAt: string;
  updatedAt: string;
  regNumber?: string;
  department?: string;
  institution?: string;
  company?: string;
  designation?: string;
  batch?: string;
  cgpa?: number;
  phone?: string;
  avatarUrl?: string;
}

// UserProfile alias matching UserRecord
export type UserProfile = UserRecord;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
}

export const ROLE_LABELS: Record<StrictRole, string> = {
  STUDENT: 'Student',
  PLACEMENT_OFFICER: 'Placement Officer',
  RECRUITER: 'Recruiter',
};

export const ROLE_DASHBOARD_ROUTES: Record<StrictRole, string> = {
  STUDENT: '/student',
  PLACEMENT_OFFICER: '/officer',
  RECRUITER: '/recruiter',
};

export function normalizeRole(role: string | null | undefined): StrictRole {
  if (!role) return 'STUDENT';
  const upper = role.toUpperCase();
  if (upper === 'STUDENT' || upper === 'STUDENTS') return 'STUDENT';
  if (upper === 'PLACEMENT_OFFICER' || upper === 'OFFICER' || upper === 'TPO') return 'PLACEMENT_OFFICER';
  if (upper === 'RECRUITER' || upper === 'RECRUITERS') return 'RECRUITER';
  return 'STUDENT';
}

export function roleToRouteRole(role: StrictRole): RouteRole {
  switch (role) {
    case 'STUDENT':
      return 'student';
    case 'PLACEMENT_OFFICER':
      return 'officer';
    case 'RECRUITER':
      return 'recruiter';
  }
}
