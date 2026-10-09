'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Shield,
  Check,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES, UserRecord } from '@/types/auth';
import { AuthTransitionScreen } from '@/components/auth/AuthTransitionScreen';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<StrictRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regOrId, setRegOrId] = useState('');
  const [institutionOrCompany, setInstitutionOrCompany] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [transitioningUser, setTransitioningUser] = useState<UserRecord | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full legal name (minimum 2 characters).');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid institutional or corporate email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role,
        regNumber: role === 'STUDENT' ? regOrId.trim() : undefined,
        institution: role !== 'RECRUITER' ? (institutionOrCompany.trim() || 'Biju Patnaik University of Technology (BPUT)') : undefined,
        company: role === 'RECRUITER' ? (institutionOrCompany.trim() || 'Hiring Enterprise') : undefined,
        department: role === 'PLACEMENT_OFFICER' ? (institutionOrCompany.trim() || 'Central Placement Cell') : undefined,
      });

      setSuccessMessage(
        `Workspace successfully provisioned for ${user.displayName || fullName}! Directing to console...`
      );

      // Trigger premium post-registration transition
      setTransitioningUser(user);
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to register account. Please check your credentials.');
      }
    }
  };

  if (transitioningUser) {
    return (
      <AuthTransitionScreen
        user={transitioningUser}
        destination="/onboarding"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#040D1A] flex flex-col lg:flex-row text-slate-100 selection:bg-[#00C9C0]/25 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[32rem] h-[32rem] bg-[#00C9C0]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[36rem] h-[36rem] bg-[#007F83]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Left Column: Authority & Institutional Overview */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 relative bg-gradient-to-br from-[#06172B] via-[#091D38] to-[#0B1B32] border-r border-[#152744]">
        {/* Subtle dot mesh */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 201, 192, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Brand Mark */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-black tracking-wider shadow-lg shadow-[#00C9C0]/25 transition-transform group-hover:scale-105">
              CL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">CAMPUSLINK</span>
                <span className="text-[10px] font-mono text-[#00F5D4] bg-[#007F83]/30 border border-[#00C9C0]/50 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,201,192,0.2)]">
                  ONBOARDING
                </span>
              </div>
              <p className="text-xs text-slate-400">Institutional Placement Operating System</p>
            </div>
          </Link>
        </div>

        {/* Center Narrative */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C9C0]/30 bg-[#007F83]/20 px-3.5 py-1 text-xs font-semibold text-[#00F5D4] shadow-[0_0_12px_rgba(0,201,192,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
            <span>Structured Campus Placement Onboarding</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            Register your role in the 2026 placement cycle.
          </h1>

          <div className="space-y-4 pt-2 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#081B34]/60 border border-[#172D4D]">
              <div className="rounded-lg bg-[#007F83]/30 border border-[#00C9C0]/50 p-1 text-[#00F5D4] shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-white block font-semibold">For BPUT Students</strong>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Deterministic eligibility gating, AI readiness diagnostics, and structured application tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#081B34]/60 border border-[#172D4D]">
              <div className="rounded-lg bg-[#007F83]/30 border border-[#00C9C0]/50 p-1 text-[#00F5D4] shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-white block font-semibold">For Corporate Recruiters</strong>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  JD parsing, explainable candidate scoring, shortlisting boards, and clash-free interview scheduling.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#081B34]/60 border border-[#172D4D]">
              <div className="rounded-lg bg-[#007F83]/30 border border-[#00C9C0]/50 p-1 text-[#00F5D4] shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-white block font-semibold">For Placement Officers (TPO)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Central drive approvals, student registry validation, and university-level timetable governance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-[#152744] pt-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#00C9C0]" />
            <span>Strict RBAC Security Enforcement</span>
          </div>
          <span className="font-mono text-[11px] text-[#00F5D4]">BPUT PS10</span>
        </div>
      </div>

      {/* Right Column: Register Form in Dark 3D Glass */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[#040D1A] text-slate-100 overflow-y-auto relative z-10">
        <div className="w-full max-w-lg mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-bold tracking-wider shadow-md shadow-[#00C9C0]/25">
                CL
              </div>
              <span className="text-2xl font-black tracking-tight text-white">CAMPUSLINK</span>
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.8)]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F5D4]">WORKSPACE PROVISIONING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Create your account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your institutional role to provision your secure workspace.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'border-[#00C9C0] bg-[#007F83]/30 text-[#00F5D4] ring-2 ring-[#00C9C0]/40 shadow-[0_0_16px_rgba(0,201,192,0.25)]'
                    : 'border-[#152744] bg-[#081B34]/60 text-slate-400 hover:text-white hover:border-[#1E375C]'
                }`}
              >
                <GraduationCap className={`h-5 w-5 mb-1.5 ${role === 'STUDENT' ? 'text-[#00F5D4]' : 'text-slate-400'}`} />
                <span className="block text-xs font-bold text-white">Student</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Candidate OS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'RECRUITER'
                    ? 'border-sky-400 bg-sky-950/60 text-sky-300 ring-2 ring-sky-500/40 shadow-[0_0_16px_rgba(14,165,233,0.25)]'
                    : 'border-[#152744] bg-[#081B34]/60 text-slate-400 hover:text-white hover:border-[#1E375C]'
                }`}
              >
                <Briefcase className={`h-5 w-5 mb-1.5 ${role === 'RECRUITER' ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="block text-xs font-bold text-white">Recruiter</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Corporate ATS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('PLACEMENT_OFFICER')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'PLACEMENT_OFFICER'
                    ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 ring-2 ring-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : 'border-[#152744] bg-[#081B34]/60 text-slate-400 hover:text-white hover:border-[#1E375C]'
                }`}
              >
                <ShieldCheck className={`h-5 w-5 mb-1.5 ${role === 'PLACEMENT_OFFICER' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="block text-xs font-bold text-white">TPO Officer</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Governance</span>
              </button>
            </div>
          </div>

          {/* Form Card in Dark Glass */}
          <div className="bg-[#081B34]/85 p-6 sm:p-8 rounded-2xl border border-[#152744] shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md space-y-4">
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priyanshu Mohanty"
                    className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === 'STUDENT'
                        ? 'student@bput.ac.in'
                        : role === 'RECRUITER'
                        ? 'recruiter@company.com'
                        : 'tpo@university.ac.in'
                    }
                    className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role-Specific Field */}
              {role === 'STUDENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      BPUT Registration No.
                    </label>
                    <input
                      type="text"
                      value={regOrId}
                      onChange={(e) => setRegOrId(e.target.value)}
                      placeholder="e.g. 2201090123"
                      className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 px-3.5 text-xs font-mono font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      value={institutionOrCompany}
                      onChange={(e) => setInstitutionOrCompany(e.target.value)}
                      placeholder="e.g. Silicon Institute"
                      className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 px-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {role === 'RECRUITER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hiring Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={institutionOrCompany}
                      onChange={(e) => setInstitutionOrCompany(e.target.value)}
                      placeholder="e.g. Tata Consultancy Services, Deloitte, Amazon"
                      className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {role === 'PLACEMENT_OFFICER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    TPO Office / Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={institutionOrCompany}
                      onChange={(e) => setInstitutionOrCompany(e.target.value)}
                      placeholder="e.g. Central Placement Cell, BPUT Rourkela"
                      className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password (min. 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-9 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#007F83] via-[#00A89E] to-[#00C9C0] px-4 py-2.5 text-xs font-bold text-white hover:from-[#00A89E] hover:to-[#00F5D4] transition-all shadow-[0_4px_16px_rgba(0,127,131,0.4)] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Provisioning {ROLE_LABELS[role]} Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an active account?{' '}
            <Link
              href="/login"
              className="font-bold text-[#00F5D4] hover:underline transition-colors"
            >
              Sign in to workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
