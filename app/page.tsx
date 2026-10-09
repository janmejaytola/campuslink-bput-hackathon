'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Target,
  FileText,
  BarChart3,
  Users,
  ChevronRight,
  Layers,
  Cpu,
  Clock,
  Building,
  Shield,
  Check,
  Award,
  Scale,
  Zap,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<StrictRole>('STUDENT');

  const handleLaunchRole = (role: StrictRole) => {
    setActiveRoleTab(role);
    if (isAuthenticated && currentUser?.role === role) {
      router.push(ROLE_DASHBOARD_ROUTES[role]);
    } else {
      router.push(`/login`);
    }
  };

  const rolePreviews = {
    STUDENT: {
      title: 'Student Career OS',
      tagline: 'Personal Career Progression & Diagnostic Hub',
      description:
        'A deterministic placement operating system providing rubric-based readiness scorecards, targeted skill-gap remediation, live drive eligibility checks, and clash-free interview scheduling.',
      badge: 'Batch 2026',
      color: 'teal',
      accentBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
      icon: GraduationCap,
      features: [
        'AI Readiness Benchmark with 5-factor scoring rubric',
        'Target Role Skill-Gap Diagnostics & curated roadmap',
        'Deterministic Eligibility Gate with zero hallucination',
        'Live clash-free interview schedule with venue details',
      ],
      kpis: [
        { label: 'Readiness Benchmark', value: '84 / 100' },
        { label: 'Verified CGPA', value: '8.45' },
        { label: 'Shortlisted Drives', value: '3 Active' },
      ],
    },
    RECRUITER: {
      title: 'Corporate ATS Console',
      tagline: 'High-Velocity Requisition & Candidate Board',
      description:
        'Streamlined recruitment workflow allowing hiring managers to parse JDs into deterministic rules, rank candidate pools via explainable matching, and book conflict-free panel slots.',
      badge: 'Talent Acquisition',
      color: 'sky',
      accentBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
      icon: Briefcase,
      features: [
        'AI JD Parser converting job descriptions to JSON schemas',
        'Multi-factor candidate match scoring with criteria breakdown',
        'Multi-stage Shortlisting Board with audit trail snapshots',
        'Conflict-free scheduler preventing candidate timetable clashes',
      ],
      kpis: [
        { label: 'Open Requisitions', value: '6 Drives' },
        { label: 'Shortlisted Pool', value: '42 Candidates' },
        { label: 'Panel Overlaps', value: '0 Clashes' },
      ],
    },
    PLACEMENT_OFFICER: {
      title: 'Institutional Command',
      tagline: 'Central TPO Placement Governance & Analytics',
      description:
        'Authoritative command center for university placement leadership to oversee 1,400+ engineering students, coordinate corporate placement drives, and track branch-wise outcomes.',
      badge: 'Central TPO',
      color: 'emerald',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: Building,
      features: [
        'University master registry auditing academic dossiers',
        'Batch eligibility engine executing zero-hallucination rules',
        'Campus-wide master interview timetable & lab coordination',
        'Executive placement rate analytics & branch distribution',
      ],
      kpis: [
        { label: 'Cohort Registry', value: '1,420 Students' },
        { label: 'Active Drives', value: '18 Corporates' },
        { label: 'Placement Rate', value: '72.4%' },
      ],
    },
  };

  const activeData = rolePreviews[activeRoleTab];
  const ActiveIcon = activeData.icon;

  const platformCapabilities = [
    {
      title: 'Deterministic Eligibility Gating',
      desc: 'Zero-hallucination verification evaluating candidate CGPA, allowed engineering disciplines, and graduation batch rules strictly on the server.',
      icon: ShieldCheck,
    },
    {
      title: 'Explainable Match Scoring',
      desc: 'Transparent multi-dimensional rubric scoring across required technical skills, academic foundation, and domain project experience.',
      icon: Scale,
    },
    {
      title: 'Recruiter Shortlisting Pipeline',
      desc: 'Audit-locked selection and rejection board recording recruiter identity, match score snapshots, and review explanation notes.',
      icon: Users,
    },
    {
      title: 'Conflict-Aware Interview Scheduler',
      desc: 'Automated clash prevention reconciling candidate schedules and interviewer panels with instant conflict-free slot alternatives.',
      icon: CalendarDays,
    },
    {
      title: 'Personal Career OS for Students',
      desc: 'Comprehensive diagnostic workspace providing rubric scorecards, targeted skill remediation, and transparent status tracking.',
      icon: Target,
    },
    {
      title: 'Institutional Command & Governance',
      desc: 'Executive analytics, placement drive management, and student directory auditing for university placement cell leadership.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 flex flex-col font-sans selection:bg-teal-500/20">
      {/* Top Navigation Bar: Midnight Navy Theme */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-md text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-extrabold tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              CL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  CAMPUSLINK
                </span>
                <span className="rounded bg-teal-950/80 border border-teal-800/60 px-1.5 py-0.2 text-[9px] font-bold text-teal-400">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Placement Intelligence Operating System
              </p>
            </div>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#roles" className="hover:text-teal-400 transition-colors">
              Portals & Roles
            </a>
            <a href="#capabilities" className="hover:text-teal-400 transition-colors">
              System Capabilities
            </a>
            <a href="#architecture" className="hover:text-teal-400 transition-colors">
              Deterministic Architecture
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <Link
                href={ROLE_DASHBOARD_ROUTES[currentUser.role]}
                className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
              >
                Go to {ROLE_LABELS[currentUser.role]} Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section: Midnight Navy with Glowing Teal Accents */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-[#0B0F19] text-white border-b border-slate-800/80">
        {/* Subtle radial mesh background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#14B8A6 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3.5 py-1 text-xs font-bold text-teal-300 shadow-2xs backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>AI-Powered Campus Placement Intelligence Platform · BPUT 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            The enterprise operating system for university campus placements.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Unifying students, corporate recruiters, and the central placement office into three dedicated workspaces powered by deterministic eligibility gating, explainable candidate ranking, and conflict-free interview coordination.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            >
              <span>Launch Enterprise Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors shadow-2xs"
            >
              <span>Create Account</span>
            </Link>
          </div>

          {/* Operational Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xs backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Eligible Cohort
              </span>
              <p className="text-2xl font-black text-white font-mono mt-1 tabular-nums">1,420+</p>
              <p className="text-[11px] text-slate-400 mt-0.5">BPUT Engineering 2026</p>
            </div>
            <div className="rounded-2xl border border-teal-800/60 bg-teal-950/40 p-4 shadow-2xs backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                Rule Engine
              </span>
              <p className="text-2xl font-black text-teal-200 font-mono mt-1 tabular-nums">100%</p>
              <p className="text-[11px] text-teal-400 mt-0.5">Deterministic Gating</p>
            </div>
            <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-4 shadow-2xs backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Clash Engine
              </span>
              <p className="text-2xl font-black text-emerald-200 font-mono mt-1 tabular-nums">
                0 Clashes
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Timetable Conflict-Free</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xs backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Access Control
              </span>
              <p className="text-2xl font-black text-white font-mono mt-1">RBAC</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Role-Isolated Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Showcase Section */}
      <section id="roles" className="py-16 sm:py-20 border-b border-slate-200/90 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Three Dedicated Environments
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Purpose-built for every stakeholder
            </h2>
            <p className="text-xs text-slate-500">
              Rather than a one-size-fits-all portal, CAMPUSLINK provides specialized operational consoles with dedicated business logic and workflows.
            </p>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs gap-1.5">
              <button
                onClick={() => setActiveRoleTab('STUDENT')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'STUDENT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="h-4 w-4 text-teal-600" />
                <span>Student Career OS</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('RECRUITER')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'RECRUITER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="h-4 w-4 text-sky-600" />
                <span>Recruiter ATS Console</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('PLACEMENT_OFFICER')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'PLACEMENT_OFFICER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="h-4 w-4 text-emerald-600" />
                <span>Central TPO Command</span>
              </button>
            </div>
          </div>

          {/* Active Role Showcase Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-[#F8FAFD] p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Description & Feature List */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-teal-400 shadow-sm">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${activeData.accentBg}`}>
                      {activeData.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {activeData.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeData.description}
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  {activeData.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => handleLaunchRole(activeRoleTab)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Enter {activeData.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Mini Metric Preview Box */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900">Live Workspace Snapshot</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </div>

                <div className="space-y-3">
                  {activeData.kpis.map((kpi, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span className="text-xs font-medium text-slate-600">{kpi.label}</span>
                      <span className="text-sm font-black text-slate-900 font-mono tabular-nums">
                        {kpi.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                  >
                    <span>Sign in to access live dataset</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Grid */}
      <section id="capabilities" className="py-16 sm:py-20 border-b border-slate-200/90 bg-[#F8FAFD]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Engineered for university scale
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic engines with verifiable rules prevent AI hallucinations in high-stakes academic decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{cap.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture & PS10 Compliance Section */}
      <section id="architecture" className="py-16 sm:py-20 border-b border-slate-200/90 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-[#0B0F19] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950 border border-teal-800/80 px-2 py-0.5 rounded">
                BPUT HACKATHON 2026 · PROBLEM STATEMENT 10
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Zero-hallucination institutional placement governance.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                CAMPUSLINK implements a strict multi-layer separation between generative assistance (Gemini 3.8 Flash for JD parsing and qualitative explanation) and deterministic rules (CGPA cutoffs, engineering branch mapping, backlog thresholds, and interval-tree conflict detection).
              </p>
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                >
                  Sign In to Live Portal
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Create Student or Recruiter Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">CAMPUSLINK</span>
            <span>· BPUT Engineering Placement Intelligence Operating System</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <Link href="/login" className="hover:text-teal-700">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-teal-700">
              Register
            </Link>
            <Link href="/forgot-password" className="hover:text-teal-700">
              Reset Password
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
