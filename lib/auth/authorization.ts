import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

export const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

export function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some((route) => route !== '/' && pathname.startsWith(route));
}

export function getRequiredRoleForRoute(pathname: string): StrictRole | null {
  if (pathname.startsWith('/student')) {
    return 'STUDENT';
  }
  if (pathname.startsWith('/officer')) {
    return 'PLACEMENT_OFFICER';
  }
  if (pathname.startsWith('/recruiter')) {
    return 'RECRUITER';
  }
  return null;
}

export function canAccessRoute(userRole: StrictRole | null | undefined, pathname: string): boolean {
  if (isPublicRoute(pathname)) {
    return true;
  }
  if (!userRole) {
    return false;
  }
  const requiredRole = getRequiredRoleForRoute(pathname);
  if (!requiredRole) {
    return true; // Unprotected non-role route
  }
  return userRole === requiredRole;
}

export function validateRoleSelection(
  storedRole: StrictRole,
  selectedRole: StrictRole
): { valid: boolean; message?: string } {
  if (storedRole === selectedRole) {
    return { valid: true };
  }

  const storedLabel = ROLE_LABELS[storedRole] || storedRole;
  return {
    valid: false,
    message: `Your account is registered as ${storedLabel}. Please select ${storedLabel} to continue.`,
  };
}

export function getDashboardForRole(role: StrictRole): string {
  return ROLE_DASHBOARD_ROUTES[role] || '/student';
}
