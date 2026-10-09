'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';
import { getRequiredRoleForRoute } from '@/lib/auth/authorization';
import { ShieldAlert, ArrowRight, LogOut, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
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

  // 1. Loading state during auth check with dark futuristic glowing transition
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden"
      >
        {/* Subtle cyan ambient glow */}
        <div className="absolute w-96 h-96 bg-[#16CFFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm w-full">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-xl shadow-[0_0_25px_rgba(22,207,255,0.4)] animate-pulse">
            CL
          </div>

          <div className="flex items-center gap-2.5 text-slate-200 font-semibold text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-[#16CFFF]" />
            <span>Verifying secure session & authoritative permissions...</span>
          </div>

          {/* Subtle light sweep progress rail */}
          <div className="h-1.5 w-64 rounded-full bg-[#06162D] border border-[#152744] overflow-hidden relative">
            <div className="h-full w-24 bg-gradient-to-r from-transparent via-[#16CFFF] to-transparent animate-light-sweep" />
          </div>

          <p className="text-xs font-mono text-[#9CB4CC]">BPUT CAMPUSLINK Placement Security Gate</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 text-center text-white">
        <p className="text-sm text-[#9CB4CC]">Redirecting to authentication portal...</p>
      </div>
    );
  }

  // 3. Role mismatch check: The authenticated user's authoritative stored role must match
  if (requiredRole && currentUser.role !== requiredRole) {
    const requiredLabel = ROLE_LABELS[requiredRole] || requiredRole;
    const userRoleLabel = ROLE_LABELS[currentUser.role] || currentUser.role;
    const authorizedDashboard = ROLE_DASHBOARD_ROUTES[currentUser.role] || '/student';

    return (
      <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-4 sm:p-6 text-white relative">
        <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#06162D]/95 p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/70 text-rose-400 mb-4 border border-rose-700/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-black text-white">Access Restricted</h2>
          <p className="mt-2 text-xs text-[#9CB4CC] leading-relaxed">
            You don&apos;t have permission to access this page. This workspace is strictly restricted to{' '}
            <strong className="text-white font-bold">{requiredLabel}</strong> credentials.
          </p>

          <div className="my-5 rounded-xl border border-[#152744] bg-[#020817] p-3 text-xs text-[#9CB4CC]">
            Signed in as: <strong className="text-white">{currentUser.name}</strong>
            <span className="block mt-0.5 text-[#00E5D4] font-semibold font-mono">
              Authoritative Role: {userRoleLabel}
            </span>
          </div>

          <div className="space-y-3">
            <Link
              href={authorizedDashboard}
              className="gradient-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <span>Go to My {userRoleLabel} Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => logout()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#152744] bg-[#020817] py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-[#16CFFF]/40 transition-colors cursor-pointer"
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
