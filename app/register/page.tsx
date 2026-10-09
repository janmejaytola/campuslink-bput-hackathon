'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full legal name (minimum 2 characters).');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!role || (role !== 'STUDENT' && role !== 'PLACEMENT_OFFICER' && role !== 'RECRUITER')) {
      setErrorMessage('Please select a valid user role.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        name: fullName,
        email,
        password,
        role,
        regNumber: role === 'STUDENT' ? regOrId : undefined,
        department: role === 'PLACEMENT_OFFICER' ? institutionOrCompany : undefined,
        company: role === 'RECRUITER' ? institutionOrCompany : undefined,
        institution: role === 'STUDENT' ? institutionOrCompany : undefined,
      });

      setSuccessMessage(`Account registered successfully as ${ROLE_LABELS[user.role]}! Redirecting...`);
      const targetDashboard = ROLE_DASHBOARD_ROUTES[user.role];

      setTimeout(() => {
        router.replace(targetDashboard);
      }, 600);
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Registration failed. Please verify your details.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col lg:flex-row text-slate-100">
      {/* Left Column: Onboarding Narrative */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 lg:p-16 relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F766E]/30 border-r border-slate-800">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-lg shadow-teal-900/40">
              CL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">CAMPUSLINK</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800/60 px-2 py-0.5 rounded">
                  JOIN
                </span>
              </div>
              <p className="text-xs text-slate-400">Institutional Placement Operating System</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-sm space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3 py-1 text-xs font-semibold text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Fast Guided Onboarding</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Register your role in the 2026 placement cycle.
          </h1>

          <div className="space-y-4 pt-2 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-teal-950 border border-teal-700/60 p-1 text-teal-400 shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-white block font-semibold">For BPUT Students</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Automated readiness scorecards, skill-gap analysis, and verified job eligibility gating.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-teal-950 border border-teal-700/60 p-1 text-teal-400 shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-white block font-semibold">For Corporate Recruiters</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Structured job posting, deterministic match ranking, shortlisting engine, and conflict-aware interview scheduling.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-teal-950 border border-teal-700/60 p-1 text-teal-400 shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-white block font-semibold">For Placement Officers (TPO)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Central drive oversight, institutional compliance analytics, and campus-wide timetable governance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-500" />
            <span>Strict RBAC Security Enforcement</span>
          </div>
          <span className="text-[11px] font-mono">BPUT PS10</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[#F8FAFC] text-slate-900 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          {/* Mobile Brand */}
          <div className="lg:hidden mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-sm">
                CL
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">CAMPUSLINK</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Create your account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your institutional role to provision your secure workspace.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <GraduationCap className={`h-4 w-4 mb-1.5 ${role === 'STUDENT' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  role === 'RECRUITER'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Briefcase className={`h-4 w-4 mb-1.5 ${role === 'RECRUITER' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('PLACEMENT_OFFICER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  role === 'PLACEMENT_OFFICER'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className={`h-4 w-4 mb-1.5 ${role === 'PLACEMENT_OFFICER' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Officer</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Priyanshu Mohanty"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'STUDENT' ? 'reg_no@bput.ac.in' : 'recruiter@company.com'}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Role Specific Fields */}
              {role === 'STUDENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      BPUT Registration Number
                    </label>
                    <input
                      type="text"
                      required
                      value={regOrId}
                      onChange={(e) => setRegOrId(e.target.value)}
                      placeholder="e.g. 2201106284"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs font-medium font-mono text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution / College Name
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionOrCompany}
                      onChange={(e) => setInstitutionOrCompany(e.target.value)}
                      placeholder="e.g. BPUT Rourkela Campus"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {role === 'RECRUITER' && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={institutionOrCompany}
                      onChange={(e) => setInstitutionOrCompany(e.target.value)}
                      placeholder="e.g. Tata Consultancy Services, Microsoft, etc."
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {role === 'PLACEMENT_OFFICER' && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Placement Cell / Dept
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={institutionOrCompany}
                      onChange={(e) => setInstitutionOrCompany(e.target.value)}
                      placeholder="e.g. Training & Placement Office (TPO Central)"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50 pt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Provisioning Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration as {ROLE_LABELS[role]}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link
              href="/login"
              className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Sign in to your portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
