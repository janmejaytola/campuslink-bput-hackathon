'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';
import { getRequiredRoleForRoute } from '@/lib/auth/authorization';
import { ShieldAlert, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: StrictRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  const requiredRole = allowedRole || getRequiredRoleForRoute(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // 1. Loading state during auth check to prevent any content flickering
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-lg mb-4 shadow-sm animate-pulse">
          CL
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          <span>Verifying secure session & permissions...</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">BPUT CAMPUSLINK Placement Security Gate</p>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-600">Redirecting to login portal...</p>
      </div>
    );
  }

  // 3. Role mismatch check: The authenticated user's stored role must match
  if (requiredRole && currentUser.role !== requiredRole) {
    const requiredLabel = ROLE_LABELS[requiredRole] || requiredRole;
    const userRoleLabel = ROLE_LABELS[currentUser.role] || currentUser.role;
    const authorizedDashboard = ROLE_DASHBOARD_ROUTES[currentUser.role] || '/student';

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-100">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            You don&apos;t have permission to access this page. This workspace is restricted to{' '}
            <strong className="text-slate-900 font-semibold">{requiredLabel}</strong> access.
          </p>

          <div className="my-5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
            Signed in as: <strong className="text-slate-800">{currentUser.name}</strong>
            <span className="block mt-0.5 text-teal-700 font-medium">
              Registered Role: {userRoleLabel}
            </span>
          </div>

          <div className="space-y-2">
            <Link
              href={authorizedDashboard}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <span>Go to My {userRoleLabel} Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => logout()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized: render children securely
  return <>{children}</>;
}
