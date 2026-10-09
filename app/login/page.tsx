'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Building2,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const { login, loginWithGoogle, currentUser, isAuthenticated } = useAuth();

  const [selectedRole, setSelectedRole] = useState<StrictRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentDomain =
    typeof window !== 'undefined'
      ? window.location.hostname
      : 'ais-dev-4p5djfnofihhkfodyz4rbb-444151331719.asia-southeast1.run.app';

  // If already authenticated with matching role, redirect
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const dest = redirectPath || ROLE_DASHBOARD_ROUTES[currentUser.role] || '/student';
      router.replace(dest);
    }
  }, [isAuthenticated, currentUser, router, redirectPath]);

  const handleRoleSelect = (role: StrictRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setErrorCode(null);
  };

  const copyDomain = () => {
    const domain = typeof window !== 'undefined' ? window.location.hostname : currentDomain;
    if (!domain) return;
    navigator.clipboard.writeText(domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorCode(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password, selectedRole);
      setSuccessMessage(`Authenticated successfully as ${ROLE_LABELS[user.role]}! Redirecting...`);
      const targetDashboard = redirectPath || ROLE_DASHBOARD_ROUTES[user.role] || '/student';
      setTimeout(() => {
        router.replace(targetDashboard);
      }, 500);
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please check your email and password.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setErrorCode(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const user = await loginWithGoogle(selectedRole);
      setSuccessMessage(`Authenticated successfully as ${ROLE_LABELS[user.role]}! Redirecting...`);
      const targetDashboard = redirectPath || ROLE_DASHBOARD_ROUTES[user.role] || '/student';
      setTimeout(() => {
        router.replace(targetDashboard);
      }, 400);
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      setErrorCode(code);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Google authentication could not be completed. Please try again.');
      }
    }
  };

  const isUnauthorizedDomain =
    errorCode === 'auth/unauthorized-domain' ||
    (errorMessage && errorMessage.includes('not authorized for Firebase Google Sign-In'));

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col lg:flex-row text-slate-100">
      {/* Left Column: Premium Brand Authority Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F766E]/30 border-r border-slate-800">
        {/* Subtle geometric grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#0D9488 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-lg shadow-teal-900/40 group-hover:bg-teal-500 transition-colors">
              CL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">CAMPUSLINK</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800/60 px-2 py-0.5 rounded">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400">BPUT Placement Intelligence & Coordination</p>
            </div>
          </Link>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3 py-1 text-xs font-semibold text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Deterministic Campus Recruitment Infrastructure</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Connecting university cohorts with corporate hiring at scale.
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            A unified, multi-role operating system engineered for students, corporate recruiters, and the training & placement office. Built with deterministic eligibility gating, explainable candidate matching, and conflict-free interview scheduling.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1">
              <span className="text-2xl font-black text-white font-mono">1,420+</span>
              <p className="text-[11px] text-slate-400 font-medium">BPUT Cohort 2026</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-teal-400 font-mono">100%</span>
              <p className="text-[11px] text-slate-400 font-medium">Deterministic Gating</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-white font-mono">0 Clashes</span>
              <p className="text-[11px] text-slate-400 font-medium">Schedule Conflict Engine</p>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-500" />
            <span>Role-Based Access Control (RBAC) Verified</span>
          </div>
          <span className="text-[11px] font-mono">CAMPUSLINK PS10</span>
        </div>
      </div>

      {/* Right Column: Premium Authentication Console */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[#F8FAFC] text-slate-900">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Top Brand (visible on small screens) */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-sm">
                CL
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">CAMPUSLINK</span>
            </Link>
            <p className="mt-1 text-xs text-slate-500">BPUT Placement Coordination Platform</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Sign in to your portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to access your dedicated workspace and verified records.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Select Workspace Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'STUDENT'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <GraduationCap className={`h-4 w-4 mb-1.5 ${selectedRole === 'STUDENT' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('RECRUITER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'RECRUITER'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Briefcase className={`h-4 w-4 mb-1.5 ${selectedRole === 'RECRUITER' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('PLACEMENT_OFFICER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'PLACEMENT_OFFICER'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className={`h-4 w-4 mb-1.5 ${selectedRole === 'PLACEMENT_OFFICER' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Officer</span>
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Role target: <strong className="text-slate-900">{ROLE_LABELS[selectedRole]}</strong> · Protected by RBAC
            </p>
          </div>

          {/* Card Body */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            {/* Domain Authorization Helper */}
            {isUnauthorizedDomain ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-amber-950">Domain Authorization Required</h4>
                    <p className="text-amber-800 leading-relaxed">
                      Firebase requires adding this hostname to authorized domains in project{' '}
                      <strong className="font-semibold text-amber-950">campuslink-4e78d</strong>.
                    </p>

                    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg p-2 font-mono text-[11px] text-slate-800">
                      <span className="flex-1 truncate">{currentDomain}</span>
                      <button
                        type="button"
                        onClick={copyDomain}
                        className="shrink-0 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-amber-900/90 space-y-1 pt-1">
                      <p className="font-semibold">Quick setup in Firebase Console:</p>
                      <a
                        href="https://console.firebase.google.com/project/campuslink-4e78d/authentication/settings"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 underline"
                      >
                        <span>Open Authorized Domains Settings</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : errorCode === 'auth/user-cancelled' || errorCode === 'auth/popup-closed-by-user' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1">Google Sign-In popup closed. Please retry when ready.</div>
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            ) : null}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@bput.ac.in or work@company.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    disabled={isLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in as {ROLE_LABELS[selectedRole]}...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {ROLE_LABELS[selectedRole]} Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an authenticated account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
