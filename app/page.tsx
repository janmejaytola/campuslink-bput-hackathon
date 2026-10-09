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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedRolePreview, setSelectedRolePreview] = useState<StrictRole>('STUDENT');

  const handleLaunchRole = (role: StrictRole) => {
    setSelectedRolePreview(role);
    if (isAuthenticated && currentUser?.role === role) {
      router.push(ROLE_DASHBOARD_ROUTES[role]);
    } else {
      router.push(`/login`);
    }
  };

  const platformCapabilities = [
    {
      title: 'Deterministic Eligibility Gating',
      desc: 'Zero-hallucination verification evaluating candidate CGPA, allowed engineering disciplines, and graduation batch rules.',
      icon: ShieldCheck,
    },
    {
      title: 'Explainable Match Scoring',
      desc: 'Weighted multi-dimensional rubric scoring across required technical skills, academic foundation, and experience snapshots.',
      icon: Scale,
    },
    {
      title: 'Recruiter Shortlisting Engine',
      desc: 'Structured selection and rejection pipeline recording recruiter ID, match score snapshots, and audit explanation notes.',
      icon: Users,
    },
    {
      title: 'Conflict-Aware Interview Scheduler',
      desc: 'Automated clash prevention reconciling candidate schedules and interviewer panels with instant conflict-free alternatives.',
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-sm">
              CL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">CAMPUSLINK</span>
                <span className="rounded bg-teal-50 border border-teal-200 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Campus Placement Operating System
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#roles" className="hover:text-teal-800 transition-colors">
              Platform Roles
            </a>
            <a href="#capabilities" className="hover:text-teal-800 transition-colors">
              System Capabilities
            </a>
            <a href="#governance" className="hover:text-teal-800 transition-colors">
              Security & RBAC
            </a>
          </nav>

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
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-900 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Campus Placement Intelligence for Modern Universities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            The complete operating system for university campus placements.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Unifying students, corporate hiring teams, and placement offices into three distinct, specialized workspaces powered by deterministic eligibility, explainable ranking, and conflict-free interview coordination.
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Create Workspace Profile</span>
            </Link>
          </div>

          {/* Operational Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Cohort</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">1,420+</p>
              <p className="text-[11px] text-slate-500 mt-0.5">BPUT Engineering 2026</p>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Rule Engine</span>
              <p className="text-2xl font-black text-teal-950 font-mono mt-1">100%</p>
              <p className="text-[11px] text-teal-800 mt-0.5">Deterministic Gating</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Conflict Engine</span>
              <p className="text-2xl font-black text-emerald-950 font-mono mt-1">0 Clashes</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">Automated Overlap Avoidance</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Architecture</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">RBAC</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Multi-Role Firestore Rules</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Portals Section */}
      <section id="roles" className="py-16 sm:py-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Three Tailored Environments</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Purpose-built for every stakeholder</h2>
            <p className="text-xs text-slate-500">
              Rather than generic dashboard views, CAMPUSLINK provides specialized operational character for students, corporate recruiters, and placement officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Experience */}
            <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Career OS</h3>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">For BPUT Students</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A personal career operating system focused on profile depth, readiness scorecards, skill diagnostic matrices, verified job discovery, and interview schedules.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Deterministic readiness scorecards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Skill-gap remediation roadmaps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Read-only clash-free interview schedule</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleLaunchRole('STUDENT')}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Enter Student Portal</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Recruiter Experience */}
            <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Modern ATS Workspace</h3>
                  <p className="text-xs text-sky-700 font-semibold mt-0.5">For Corporate Recruiters</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A dense, high-velocity recruiting workspace featuring structured JD parsing, candidate match rankings, selection/rejection shortlisting, and panel scheduling.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Structured requisition & JD parsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Step 11 candidate shortlisting engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Step 12 conflict-aware slot booking</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleLaunchRole('RECRUITER')}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Enter Recruiter Console</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Officer Experience */}
            <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Institutional Command</h3>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">For Placement Officers</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An authoritative command center providing cohort KPI hierarchies, company drive management, student registry audit, and campus lab allocations.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Executive institutional placement KPIs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Campus master timetable monitoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Complete test suite & compliance audit</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleLaunchRole('PLACEMENT_OFFICER')}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Enter Officer Command</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section id="capabilities" className="py-16 sm:py-20 border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Platform Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Engineered for production scale</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-2xs"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CAMPUSLINK</span>
            <span>· BPUT Placement Intelligence Operating System</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <Link href="/login" className="hover:text-teal-700">Sign In</Link>
            <Link href="/register" className="hover:text-teal-700">Register</Link>
            <span>PS10 Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
