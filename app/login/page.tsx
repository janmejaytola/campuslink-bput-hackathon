'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  Building2,
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
  Sparkles,
  Shield,
  Layers,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES, UserRecord } from '@/types/auth';
import { AuthTransitionScreen } from '@/components/auth/AuthTransitionScreen';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const { login, loginWithGoogle, currentUser, isAuthenticated } = useAuth();

  const [selectedRole, setSelectedRole] = useState<StrictRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [transitioningUser, setTransitioningUser] = useState<UserRecord | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string>(
    'ais-dev-dsoc65jc3o56vcetyot3bx-778812239942.asia-southeast1.run.app'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const dest = redirectPath || ROLE_DASHBOARD_ROUTES[currentUser.role] || '/student';
      router.replace(dest);
    }
  }, [isAuthenticated, currentUser, redirectPath, router]);

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

  const handleQuickFill = (role: StrictRole) => {
    handleRoleSelect(role);
    if (role === 'STUDENT') {
      setEmail('priyanshu.m@bput.ac.in');
      setPassword('Student@123');
    } else if (role === 'RECRUITER') {
      setEmail('talent@tcs.com');
      setPassword('Recruiter@123');
    } else {
      setEmail('tpo.officer@bput.ac.in');
      setPassword('Officer@123');
    }
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
      setSuccessMessage(`Welcome back, ${user.displayName || user.email}! Launching workspace...`);
      // Trigger the premium post-login transition with authoritative user record
      setTransitioningUser(user);
    } catch (err: unknown) {
      setIsLoading(false);
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      setErrorCode(code);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please verify your credentials.');
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
      setSuccessMessage(`Authenticated successfully as ${ROLE_LABELS[user.role]}! Launching workspace...`);
      // Trigger the premium post-login transition with authoritative user record
      setTransitioningUser(user);
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

  if (transitioningUser) {
    return (
      <AuthTransitionScreen
        user={transitioningUser}
        destination={redirectPath || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col lg:flex-row text-[#F4FAFF] selection:bg-[#16CFFF]/25 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[36rem] h-[36rem] bg-[#16CFFF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[36rem] h-[36rem] bg-[#00E5D4]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* LEFT PANEL: Distinctive 3D Branding & Workspaces Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 relative bg-gradient-to-br from-[#020817] via-[#06162D] to-[#0A203B] border-r border-[#152744] overflow-hidden">
        {/* Cinematic university campus background with dark navy gradient overlay */}
        <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
          <Image
            src="/images/campuslink_hero_campus_1791562156457.jpg"
            alt="Campus visual background"
            fill
            priority
            referrerPolicy="no-referrer"
            className="object-cover object-center opacity-20 filter contrast-125 brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/95 via-[#06162D]/90 to-[#020817]" />
        </div>

        {/* 3D Floating Geometric Particles & Mesh */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(rgba(22, 207, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Floating 3D Geometric Depth Spheres */}
        <div className="absolute top-20 right-10 w-44 h-44 rounded-full border border-[#16CFFF]/20 bg-gradient-to-br from-[#16CFFF]/10 to-transparent blur-xs pointer-events-none" />
        <div className="absolute bottom-24 -left-12 w-64 h-64 rounded-full border border-[#00E5D4]/15 bg-gradient-to-tr from-[#00E5D4]/5 to-transparent blur-xs pointer-events-none" />

        {/* Top Brand Mark */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-xl tracking-wider shadow-[0_0_20px_rgba(22,207,255,0.4)] transition-transform group-hover:scale-105">
              CL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#16CFFF] transition-colors">
                  CAMPUSLINK
                </span>
                <span className="text-[10px] font-mono text-[#16CFFF] bg-[#16CFFF]/15 border border-[#16CFFF]/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(22,207,255,0.2)]">
                  ENTERPRISE OS
                </span>
              </div>
              <p className="text-xs text-[#9CB4CC]">Your Career. Our Mission.</p>
            </div>
          </Link>
        </div>

        {/* Center Narrative: One Platform. Three Powerful Workspaces. */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#16CFFF]/40 bg-[#06162D]/90 px-3.5 py-1 text-xs font-semibold text-[#16CFFF] shadow-[0_0_15px_rgba(22,207,255,0.2)]">
            <Sparkles className="h-3.5 w-3.5 text-[#00E5D4] animate-pulse" />
            <span>Unified Placement Intelligence Layer</span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            One Platform.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16CFFF] via-[#00E5D4] to-[#00BFA6] glow-text-cyan">
              Three Powerful Workspaces.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#9CB4CC] leading-relaxed">
            Engineered with deterministic eligibility gating, explainable candidate matching, and automated conflict-free interview coordination.
          </p>

          {/* Three Portals Showcase */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#06162D]/80 border border-[#152744] hover:border-[#16CFFF]/40 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A203B] border border-[#16CFFF]/30 text-[#16CFFF] shrink-0 mt-0.5">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-white block">Student Career OS</strong>
                <p className="text-[11px] text-[#9CB4CC] mt-0.5 leading-relaxed">
                  Rubric readiness scorecards, target role skill-gap diagnostics, and verified campus drive applications.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#06162D]/80 border border-[#152744] hover:border-[#00E5D4]/40 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00E5D4]/30 text-[#00E5D4] shrink-0 mt-0.5">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-white block">Recruiter Talent OS</strong>
                <p className="text-[11px] text-[#9CB4CC] mt-0.5 leading-relaxed">
                  AI job description parsing, explainable candidate ranking, shortlisting boards, and clash-free interview slotting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#06162D]/80 border border-[#152744] hover:border-[#00BFA6]/40 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00BFA6]/30 text-[#00E5D4] shrink-0 mt-0.5">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-white block">Placement Officer Command Center</strong>
                <p className="text-[11px] text-[#9CB4CC] mt-0.5 leading-relaxed">
                  Central TPO oversight, master exam & lab timetable coordination, and verified cohort outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Tag */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#9CB4CC] border-t border-[#152744] pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#00E5D4]" />
            <span>Strict RBAC Security Enforcement</span>
          </div>
          <span className="font-mono text-[11px] text-[#16CFFF]">BPUT PS10</span>
        </div>
      </div>

      {/* RIGHT PANEL: Elegant Dark Glass Authentication Card */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[#020817] text-[#F4FAFF] overflow-y-auto relative z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-lg tracking-wider shadow-[0_0_20px_rgba(22,207,255,0.4)]">
                CL
              </div>
              <span className="text-2xl font-black tracking-tight text-white">CAMPUSLINK</span>
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-[#16CFFF] shadow-[0_0_8px_rgba(22,207,255,0.8)]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#16CFFF]">
                SECURE AUTHENTICATION GATEWAY
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Welcome back.
            </h2>
            <p className="text-xs text-[#9CB4CC] mt-1">
              Sign in to access your verified placement workspace.
            </p>
          </div>

          {/* Role Selector Tabs (Pre-fills portal preference; actual authorization uses server-side user.role) */}
          <div className="mb-6">
            <label className="block text-[11px] font-extrabold text-[#9CB4CC] uppercase tracking-wider mb-2">
              Select Workspace Portal
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'STUDENT'
                    ? 'border-[#16CFFF] bg-[#16CFFF]/15 text-[#16CFFF] ring-2 ring-[#16CFFF]/40 shadow-[0_0_16px_rgba(22,207,255,0.25)]'
                    : 'border-[#152744] bg-[#06162D]/60 text-[#9CB4CC] hover:text-white hover:border-[#1E375C]'
                }`}
              >
                <GraduationCap className={`h-4 w-4 mb-1.5 ${selectedRole === 'STUDENT' ? 'text-[#16CFFF]' : 'text-[#9CB4CC]'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('RECRUITER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'RECRUITER'
                    ? 'border-[#00E5D4] bg-[#00E5D4]/15 text-[#00E5D4] ring-2 ring-[#00E5D4]/40 shadow-[0_0_16px_rgba(0,229,212,0.25)]'
                    : 'border-[#152744] bg-[#06162D]/60 text-[#9CB4CC] hover:text-white hover:border-[#1E375C]'
                }`}
              >
                <Briefcase className={`h-4 w-4 mb-1.5 ${selectedRole === 'RECRUITER' ? 'text-[#00E5D4]' : 'text-[#9CB4CC]'}`} />
                <span>Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('PLACEMENT_OFFICER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'PLACEMENT_OFFICER'
                    ? 'border-[#00BFA6] bg-[#00BFA6]/15 text-[#00E5D4] ring-2 ring-[#00BFA6]/40 shadow-[0_0_16px_rgba(0,191,166,0.25)]'
                    : 'border-[#152744] bg-[#06162D]/60 text-[#9CB4CC] hover:text-white hover:border-[#1E375C]'
                }`}
              >
                <Building2 className={`h-4 w-4 mb-1.5 ${selectedRole === 'PLACEMENT_OFFICER' ? 'text-[#00E5D4]' : 'text-[#9CB4CC]'}`} />
                <span>TPO Officer</span>
              </button>
            </div>
          </div>

          {/* Authentication Card in Dark Glass (#06162D / #0A203B) */}
          <div className="bg-[#06162D]/90 p-6 sm:p-7 rounded-3xl border border-[#16CFFF]/25 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-4">
            {/* Domain Authorization Helper */}
            {isUnauthorizedDomain ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/50 p-4 text-xs text-amber-200 shadow-md">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-amber-300">Domain Authorization Required</h4>
                    <p className="text-amber-200/90 leading-relaxed text-xs">
                      Firebase requires adding this hostname to authorized domains in project{' '}
                      <strong className="font-semibold text-white">campuslink-4e78d</strong>.
                    </p>

                    <div className="flex items-center gap-2 bg-[#020817] border border-amber-500/30 rounded-lg p-2 font-mono text-[11px] text-amber-100">
                      <span className="flex-1 truncate">{currentDomain}</span>
                      <button
                        type="button"
                        onClick={copyDomain}
                        className="shrink-0 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-amber-300 space-y-1 pt-1">
                      <a
                        href="https://console.firebase.google.com/project/campuslink-4e78d/authentication/settings"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#16CFFF] hover:underline"
                      >
                        <span>Open Authorized Domains in Firebase Console</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : errorCode === 'auth/user-cancelled' || errorCode === 'auth/popup-closed-by-user' ? (
              <div className="rounded-xl border border-[#152744] bg-[#020817] p-3 text-xs text-[#9CB4CC] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#9CB4CC] shrink-0 mt-0.5" />
                <div className="flex-1">Google Sign-In popup closed. Please retry when ready.</div>
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            ) : null}

            {successMessage && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CB4CC] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CB4CC]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@bput.ac.in or work@company.com"
                    className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none focus:ring-2 focus:ring-[#16CFFF]/25 transition-all"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#9CB4CC]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#16CFFF] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CB4CC]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#152744] bg-[#020817] py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#16CFFF] focus:outline-none focus:ring-2 focus:ring-[#16CFFF]/25 transition-all"
                    disabled={isLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CB4CC] hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#152744] bg-[#020817] text-[#16CFFF] focus:ring-[#16CFFF] focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-xs text-[#9CB4CC] select-none cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Bright Cyan-to-Teal Gradient Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="gradient-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-black transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#020817]" />
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

            {/* Quick Demo Pre-Fill Helper */}
            <div className="pt-2 border-t border-[#152744]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9CB4CC] mb-2">
                Quick Evaluation Pre-Fills
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('STUDENT')}
                  className="rounded-lg border border-[#152744] bg-[#020817] hover:border-[#16CFFF]/50 hover:bg-[#0A203B] py-1.5 px-2 text-slate-300 font-medium transition-colors text-center cursor-pointer"
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('RECRUITER')}
                  className="rounded-lg border border-[#152744] bg-[#020817] hover:border-[#00E5D4]/50 hover:bg-[#0A203B] py-1.5 px-2 text-slate-300 font-medium transition-colors text-center cursor-pointer"
                >
                  Recruiter Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('PLACEMENT_OFFICER')}
                  className="rounded-lg border border-[#152744] bg-[#020817] hover:border-[#00BFA6]/50 hover:bg-[#0A203B] py-1.5 px-2 text-slate-300 font-medium transition-colors text-center cursor-pointer"
                >
                  Officer Demo
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#152744]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-[#06162D] px-3 text-[#9CB4CC] font-semibold">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#152744] bg-[#020817] px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-[#16CFFF]/50 hover:bg-[#0A203B] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#16CFFF]" />
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
          <div className="mt-6 text-center text-xs text-[#9CB4CC]">
            Don&apos;t have an authenticated account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-[#16CFFF] hover:underline transition-colors"
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
        <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#16CFFF]" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
