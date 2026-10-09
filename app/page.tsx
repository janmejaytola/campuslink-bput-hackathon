'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Target,
  BarChart3,
  Users,
  ShieldCheck,
  ChevronRight,
  Layers,
  Award,
  Scale,
  Zap,
  Lock,
  Cpu,
  Clock,
  ExternalLink,
  ChevronDown,
  Check,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const [activePortalTab, setActivePortalTab] = useState<'STUDENT' | 'RECRUITER' | 'OFFICER'>('STUDENT');

  const portalDetails = {
    STUDENT: {
      title: 'Student Career OS',
      tagline: 'Personal Career Progression & Diagnostic Hub',
      badge: 'STUDENT PORTAL',
      badgeColor: 'border-[#16CFFF]/40 bg-[#16CFFF]/15 text-[#16CFFF]',
      icon: GraduationCap,
      description:
        'A deterministic placement operating system providing rubric-based readiness scorecards, targeted skill-gap remediation, live drive eligibility checks, and clash-free interview scheduling.',
      route: '/student',
      demoMetrics: [
        { label: 'Readiness Benchmark', value: '84 / 100', sub: 'Target 80%' },
        { label: 'Verified CGPA', value: '8.45', sub: 'Controller Verified' },
        { label: 'Eligible Drives', value: '6 Drives', sub: 'Active BPUT 2026' },
      ],
      features: [
        'Deterministic eligibility validation against BPUT engineering criteria',
        'AI-assisted readiness score breakdown across technical & aptitude rubrics',
        'Direct skill-gap diagnostics with curated learning recommendations',
        'Conflict-free personal interview schedule with live venue notifications',
      ],
    },
    RECRUITER: {
      title: 'Recruiter Talent OS',
      tagline: 'High-Velocity Requisition & Candidate Board',
      badge: 'ENTERPRISE ATS',
      badgeColor: 'border-[#00E5D4]/40 bg-[#00E5D4]/15 text-[#00E5D4]',
      icon: Briefcase,
      description:
        'Streamlined recruitment workflow allowing hiring managers to parse JDs into deterministic rules, rank candidate pools via explainable matching, and book conflict-free panel slots.',
      route: '/recruiter',
      demoMetrics: [
        { label: 'Open Requisitions', value: '4 Positions', sub: 'Campus Drive 2026' },
        { label: 'Verified Candidates', value: '1,420 Cohort', sub: 'Gated by Rules' },
        { label: 'Interview Clashes', value: '0 Overlaps', sub: 'Clash-Free Engine' },
      ],
      features: [
        'AI job description parser transforming prose requirements into schemas',
        'Explainable multi-dimensional candidate match scoring with rubric audit',
        'Audit-locked shortlisting board preserving candidate snapshots and notes',
        'Conflict-free timetable slotting preventing university exam overlaps',
      ],
    },
    OFFICER: {
      title: 'Placement Officer Command Center',
      tagline: 'Central TPO Placement Governance & Analytics',
      badge: 'CENTRAL TPO',
      badgeColor: 'border-[#00BFA6]/40 bg-[#00BFA6]/15 text-[#00E5D4]',
      icon: Building2,
      description:
        'Authoritative command center for university placement leadership to oversee 1,400+ engineering students, coordinate corporate placement drives, and track branch-wise outcomes.',
      route: '/officer',
      demoMetrics: [
        { label: 'Eligible Cohort', value: '1,420 Students', sub: 'Batch 2026' },
        { label: 'Corporate Partners', value: '18 Visiting', sub: 'Tier-1 & Tier-2' },
        { label: 'Placement Outcome', value: '72.4%', sub: 'Target 90%+' },
      ],
      features: [
        'University master candidate registry with verified academic dossiers',
        'Batch eligibility engine executing zero-hallucination institutional criteria',
        'Master campus exam & lab timetable coordination eliminating overlaps',
        'Cohort telemetry with branch-wise distribution and verified offers',
      ],
    },
  };

  const activePortal = portalDetails[activePortalTab];
  const ActiveIcon = activePortal.icon;

  return (
    <div className="min-h-screen bg-[#020817] text-[#F4FAFF] flex flex-col font-sans selection:bg-[#16CFFF]/25 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Neon Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[36rem] h-[36rem] bg-[#16CFFF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[30rem] h-[30rem] bg-[#00E5D4]/8 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[36rem] h-[36rem] bg-[#00BFA6]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Global Header / Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#152744] bg-[#020817]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-lg tracking-wider shadow-[0_0_20px_rgba(22,207,255,0.4)] group-hover:scale-105 transition-transform">
              CL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-[#16CFFF] transition-colors">
                  CAMPUSLINK
                </span>
                <span className="rounded-md bg-[#16CFFF]/15 border border-[#16CFFF]/40 px-2 py-0.5 text-[9px] font-mono font-bold text-[#16CFFF] shadow-[0_0_10px_rgba(22,207,255,0.25)]">
                  OS 2026
                </span>
              </div>
              <p className="text-[11px] text-[#9CB4CC] font-medium tracking-wide">
                Your Career. Our Mission.
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#9CB4CC]">
            <a href="#platform" className="hover:text-[#16CFFF] transition-colors">
              Platform
            </a>
            <a href="#portals" className="hover:text-[#16CFFF] transition-colors">
              Student
            </a>
            <a href="#portals" className="hover:text-[#16CFFF] transition-colors">
              Recruiter
            </a>
            <a href="#portals" className="hover:text-[#16CFFF] transition-colors">
              Placement Office
            </a>
            <a href="#features" className="hover:text-[#16CFFF] transition-colors">
              About
            </a>
          </nav>

          {/* User Auth CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <Link
                href={ROLE_DASHBOARD_ROUTES[currentUser.role]}
                className="gradient-btn-primary rounded-xl px-4 py-2.5 text-xs font-black transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Dashboard ({ROLE_LABELS[currentUser.role]})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-[#152744] bg-[#06162D]/90 px-4 py-2.5 text-xs font-bold text-[#F4FAFF] hover:border-[#16CFFF]/60 hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="gradient-btn-primary rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer shadow-[0_0_20px_rgba(22,207,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,212,0.5)]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-[#152744]">
        {/* Cinematic university campus background with dark navy gradient overlay */}
        <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
          <Image
            src="https://picsum.photos/seed/bput-campus-cinematic/1920/1080"
            alt="University campus background"
            fill
            priority
            referrerPolicy="no-referrer"
            className="object-cover object-center opacity-10 filter contrast-125 brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/95 via-[#020817]/85 to-[#020817]" />
        </div>

        {/* Abstract 3D Geometric Light Mesh */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(rgba(22, 207, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#16CFFF]/40 bg-[#06162D]/90 px-4 py-1.5 text-xs font-bold text-[#16CFFF] shadow-[0_0_20px_rgba(22,207,255,0.2)] backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[#00E5D4] animate-pulse" />
              <span>AI-Powered University Placement Platform · BPUT 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg">
              Your Future. Your Skills.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16CFFF] via-[#00E5D4] to-[#00BFA6] glow-text-cyan">
                Your Career.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#9CB4CC] max-w-2xl mx-auto leading-relaxed">
              CAMPUSLINK bridges university cohorts, corporate hiring teams, and central placement governance with deterministic eligibility checks, explainable candidate matching, and clash-free interview automation.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/register"
                className="gradient-btn-primary rounded-xl px-7 py-3.5 text-sm font-black transition-all flex items-center gap-2 shadow-[0_6px_28px_rgba(22,207,255,0.4)] cursor-pointer"
              >
                <span>Launch Your Career</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#platform"
                className="rounded-xl border border-[#152744] bg-[#06162D]/90 px-6 py-3.5 text-sm font-bold text-[#F4FAFF] hover:border-[#16CFFF]/60 hover:text-white transition-all shadow-xs cursor-pointer"
              >
                Explore the Platform
              </a>
            </div>
          </div>

          {/* Sophisticated Floating 3D Dashboard Preview */}
          <div className="mt-14 sm:mt-20 relative max-w-5xl mx-auto perspective-1000">
            {/* Glowing Backdrop Rim */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#16CFFF]/30 via-[#00E5D4]/20 to-[#00BFA6]/30 blur-2xl opacity-75" />

            <div className="relative rounded-3xl border border-[#16CFFF]/30 bg-[#06162D]/90 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-[#16CFFF]/60">
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-[#152744] pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-[#9CB4CC] hidden sm:inline">
                    campuslink.bput.ac.in/student/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00E5D4] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5D4]">
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>

              {/* Floating Dashboard Inner Shell */}
              <div className="space-y-6">
                {/* Hero Card inside preview */}
                <div className="relative rounded-2xl border border-[#152744] bg-gradient-to-r from-[#020817] via-[#0A203B] to-[#06162D] p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 overflow-hidden">
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-[#16CFFF]/15 border border-[#16CFFF]/30 px-2 py-0.5 text-[10px] font-mono text-[#16CFFF]">
                        STUDENT OS
                      </span>
                      <span className="text-[#9CB4CC]">·</span>
                      <span className="text-slate-300 font-mono text-xs">Reg #2201106284</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Welcome back, Priyanshu Mohanty
                    </h3>
                    <p className="text-xs text-[#9CB4CC]">
                      Computer Science & Engineering · Silicon Institute of Technology · Batch 2026
                    </p>
                  </div>

                  {/* Readiness Ring Widget */}
                  <div className="flex items-center gap-4 bg-[#020817]/80 border border-[#16CFFF]/30 p-3.5 rounded-xl shrink-0 backdrop-blur-md">
                    <div className="relative flex items-center justify-center h-14 w-14 rounded-full border-4 border-[#16CFFF] shadow-[0_0_15px_rgba(22,207,255,0.4)]">
                      <span className="font-mono text-sm font-black text-white">92%</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Profile Complete</p>
                      <p className="text-[11px] text-[#00E5D4] font-semibold">Tier-1 Qualified</p>
                    </div>
                  </div>
                </div>

                {/* 4 Mini Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="rounded-xl border border-[#152744] bg-[#020817]/80 p-3.5 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase text-[#9CB4CC] tracking-wider block">
                      AI Readiness
                    </span>
                    <p className="text-xl font-black text-white font-mono mt-0.5">84 / 100</p>
                    <span className="text-[10px] text-[#00E5D4] font-semibold">Top 5% Cohort</span>
                  </div>

                  <div className="rounded-xl border border-[#152744] bg-[#020817]/80 p-3.5 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase text-[#9CB4CC] tracking-wider block">
                      Active Matches
                    </span>
                    <p className="text-xl font-black text-[#16CFFF] font-mono mt-0.5">3 Matched</p>
                    <span className="text-[10px] text-slate-400">90%+ Fit Ratio</span>
                  </div>

                  <div className="rounded-xl border border-[#152744] bg-[#020817]/80 p-3.5 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase text-[#9CB4CC] tracking-wider block">
                      Conflict Radar
                    </span>
                    <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">0 Clashes</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Exams Protected</span>
                  </div>

                  <div className="rounded-xl border border-[#152744] bg-[#020817]/80 p-3.5 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase text-[#9CB4CC] tracking-wider block">
                      Verified Offers
                    </span>
                    <p className="text-xl font-black text-white font-mono mt-0.5">1 Issued</p>
                    <span className="text-[10px] text-[#00E5D4] font-semibold">₹8.5 LPA Package</span>
                  </div>
                </div>

                {/* Live Recommended Job Preview Strip */}
                <div className="rounded-xl border border-[#16CFFF]/25 bg-[#020817]/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A203B] border border-[#16CFFF]/30 text-[#16CFFF] font-black text-xs shrink-0">
                      TCS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm font-bold text-white">
                          Software Development Engineer — Digital
                        </strong>
                        <span className="text-[9px] font-bold text-[#00E5D4] bg-[#00E5D4]/10 border border-[#00E5D4]/30 px-1.5 py-0.2 rounded">
                          94% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9CB4CC]">
                        Tata Consultancy Services · Bhubaneswar / Remote · ₹7.5 - ₹9.0 LPA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                      ELIGIBLE ✓
                    </span>
                    <div className="gradient-btn-primary rounded-lg px-3 py-1 text-xs font-black">
                      Apply Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Showcase: 3 Interactive Portal Previews */}
      <section id="portals" className="py-20 sm:py-28 border-b border-[#152744] bg-[#020817] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#16CFFF] glow-text-cyan">
              ENTERPRISE WORKSPACE ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Three Dedicated Environments.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16CFFF] to-[#00E5D4]">
                One Unified Intelligence Layer.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9CB4CC] leading-relaxed">
              Every participant operates within a purpose-built workspace engineered with deterministic role access, strict data isolation, and tailored recruitment tools.
            </p>
          </div>

          {/* Three Portals Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl bg-[#06162D] p-1.5 border border-[#152744]">
              {(['STUDENT', 'RECRUITER', 'OFFICER'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePortalTab(tab)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                    activePortalTab === tab
                      ? 'bg-gradient-to-r from-[#16CFFF] via-[#00E5D4] to-[#00BFA6] text-[#020817] shadow-[0_0_15px_rgba(22,207,255,0.4)]'
                      : 'text-[#9CB4CC] hover:text-white'
                  }`}
                >
                  {tab === 'STUDENT'
                    ? 'Student Career OS'
                    : tab === 'RECRUITER'
                    ? 'Recruiter Talent OS'
                    : 'Placement Officer Command'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Portal Display Card */}
          <div className="rounded-3xl border border-[#16CFFF]/30 bg-[#06162D]/85 p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#152744] pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A203B] border border-[#16CFFF]/40 text-[#16CFFF] shadow-[0_0_20px_rgba(22,207,255,0.25)]">
                  <ActiveIcon className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">{activePortal.title}</h3>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${activePortal.badgeColor}`}>
                      {activePortal.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CB4CC] font-medium">{activePortal.tagline}</p>
                </div>
              </div>

              <Link
                href={activePortal.route}
                className="gradient-btn-primary rounded-xl px-5 py-2.5 text-xs font-black transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <span>Launch {activePortal.badge}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {activePortal.description}
            </p>

            {/* Live Metrics associated with portal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activePortal.demoMetrics.map((met, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#020817] border border-[#152744]">
                  <span className="text-[10px] font-extrabold uppercase text-[#9CB4CC] tracking-wider block">
                    {met.label}
                  </span>
                  <p className="text-2xl font-black text-[#16CFFF] font-mono mt-1 tabular-nums">
                    {met.value}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{met.sub}</span>
                </div>
              ))}
            </div>

            {/* Key feature checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {activePortal.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="rounded-lg bg-[#16CFFF]/15 border border-[#16CFFF]/40 p-1 text-[#16CFFF] shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities & Rigor */}
      <section id="platform" className="py-20 sm:py-28 border-b border-[#152744] bg-[#020817] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5D4] glow-text-turquoise">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Deterministic Rules. Zero Hallucination.
            </h2>
            <p className="text-xs sm:text-sm text-[#9CB4CC] leading-relaxed">
              Placement outcomes directly impact student careers. CAMPUSLINK relies on deterministic mathematical engines and interval tree algorithms rather than speculative generative answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#152744] bg-[#06162D]/80 p-6 space-y-3.5 hover:border-[#16CFFF]/50 hover:shadow-[0_0_25px_rgba(22,207,255,0.15)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#16CFFF]/40 text-[#16CFFF]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Deterministic Eligibility Gate</h3>
              <p className="text-xs text-[#9CB4CC] leading-relaxed">
                Evaluates candidate CGPA cutoffs, allowed engineering disciplines, active backlog tolerances, and graduation batches strictly on server-side rules. No hallucinated passes.
              </p>
            </div>

            <div className="rounded-2xl border border-[#152744] bg-[#06162D]/80 p-6 space-y-3.5 hover:border-[#00E5D4]/50 hover:shadow-[0_0_25px_rgba(0,229,212,0.15)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00E5D4]/40 text-[#00E5D4]">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Explainable Candidate Matching</h3>
              <p className="text-xs text-[#9CB4CC] leading-relaxed">
                Multi-dimensional rubric scoring across required technical skills, academic performance, project experience, and soft skills with clear justification breakdowns.
              </p>
            </div>

            <div className="rounded-2xl border border-[#152744] bg-[#06162D]/80 p-6 space-y-3.5 hover:border-[#00BFA6]/50 hover:shadow-[0_0_25px_rgba(0,191,166,0.15)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00BFA6]/40 text-[#00BFA6]">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Conflict-Free Timetable Scheduler</h3>
              <p className="text-xs text-[#9CB4CC] leading-relaxed">
                Interval tree clash detection prevents interview panel schedules from overlapping with university semester exams, laboratory sessions, or competing job drives.
              </p>
            </div>

            <div className="rounded-2xl border border-[#152744] bg-[#06162D]/80 p-6 space-y-3.5 hover:border-[#16CFFF]/50 hover:shadow-[0_0_25px_rgba(22,207,255,0.15)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#16CFFF]/40 text-[#16CFFF]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">AI Career Readiness Diagnostic</h3>
              <p className="text-xs text-[#9CB4CC] leading-relaxed">
                Scores student resumes, portfolio projects, and technical competency against industry job descriptions using Gemini 3.8 Flash with structured schema extraction.
              </p>
            </div>

            <div className="rounded-2xl border border-[#152744] bg-[#06162D]/80 p-6 space-y-3.5 hover:border-[#00E5D4]/50 hover:shadow-[0_0_25px_rgba(0,229,212,0.15)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00E5D4]/40 text-[#00E5D4]">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Target Skill-Gap Radar</h3>
              <p className="text-xs text-[#9CB4CC] leading-relaxed">
                Identifies missing technical proficiencies for desired corporate roles and maps out actionable learning roadmaps before campus hiring drives begin.
              </p>
            </div>

            <div className="rounded-2xl border border-[#152744] bg-[#06162D]/80 p-6 space-y-3.5 hover:border-[#00BFA6]/50 hover:shadow-[0_0_25px_rgba(0,191,166,0.15)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00BFA6]/40 text-[#00BFA6]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Central Placement Governance</h3>
              <p className="text-xs text-[#9CB4CC] leading-relaxed">
                Institutional oversight with branch-wise placement rates, salary distribution telemetry, verified offer letters, and BPUT PS10 regulatory audit logging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Placement Workflow Section */}
      <section id="workflow" className="py-20 sm:py-24 border-b border-[#152744] bg-[#06162D]/60 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#16CFFF]">
              TRANSPARENT LIFECYCLE
            </span>
            <h2 className="text-3xl font-black text-white">
              From Job Requisition to Verified Offer
            </h2>
            <p className="text-xs sm:text-sm text-[#9CB4CC]">
              A step-by-step coordinated workflow across all three user roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#020817] border border-[#152744] relative">
              <span className="text-xs font-mono font-bold text-[#16CFFF]">STEP 01</span>
              <h4 className="text-sm font-bold text-white mt-1">Requisition & JD Parsing</h4>
              <p className="text-xs text-[#9CB4CC] mt-1 leading-relaxed">
                Recruiters upload job descriptions; AI extracts deterministic cutoffs (CGPA, branch, required skills).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#020817] border border-[#152744] relative">
              <span className="text-xs font-mono font-bold text-[#00E5D4]">STEP 02</span>
              <h4 className="text-sm font-bold text-white mt-1">Eligibility Gate & Match</h4>
              <p className="text-xs text-[#9CB4CC] mt-1 leading-relaxed">
                Candidates are automatically evaluated against rule gates; match rubric assigns explainable fit scores.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#020817] border border-[#152744] relative">
              <span className="text-xs font-mono font-bold text-[#00BFA6]">STEP 03</span>
              <h4 className="text-sm font-bold text-white mt-1">Clash-Free Scheduling</h4>
              <p className="text-xs text-[#9CB4CC] mt-1 leading-relaxed">
                Interview rounds are booked with interval tree collision prevention against exam timetables.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#020817] border border-[#152744] relative">
              <span className="text-xs font-mono font-bold text-[#16CFFF]">STEP 04</span>
              <h4 className="text-sm font-bold text-white mt-1">Offer & Audit Signoff</h4>
              <p className="text-xs text-[#9CB4CC] mt-1 leading-relaxed">
                Selected candidates receive verified offers; Central TPO registers outcome with tamper-evident records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] p-8 sm:p-14 text-[#020817] shadow-[0_12px_50px_rgba(22,207,255,0.35)]">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #020817 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#020817]/20 border border-[#020817]/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#020817]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>BPUT Hackathon 2026 PS10 Platform</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#020817] leading-tight">
                Your Goals + Our Platform = A Brighter Future
              </h2>

              <p className="text-xs sm:text-sm text-[#020817]/85 leading-relaxed max-w-xl font-medium">
                Experience deterministic eligibility gating, explainable candidate ranking, and conflict-free interview coordination across university placement drives.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#020817] text-white hover:bg-[#06162D] px-6 py-3.5 text-xs sm:text-sm font-black transition-all shadow-xl cursor-pointer"
              >
                <span>Launch Your Career</span>
                <ArrowRight className="h-4 w-4 text-[#16CFFF]" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[#020817]/40 bg-[#020817]/10 hover:bg-[#020817]/20 px-5 py-3.5 text-xs sm:text-sm font-bold text-[#020817] transition-colors"
              >
                <span>Sign In to Console</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Polished Dark Footer */}
      <footer id="about" className="mt-auto border-t border-[#152744] bg-[#020817] py-12 text-xs text-[#9CB4CC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">CAMPUSLINK</span>
                <span className="text-[10px] font-mono text-[#16CFFF] bg-[#16CFFF]/15 px-2 py-0.5 rounded">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-[#9CB4CC]">
                AI-Powered University Placement Coordination & Intelligence Platform
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-300">
              <Link href="/login" className="hover:text-[#16CFFF] transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-[#16CFFF] transition-colors">
                Register
              </Link>
              <Link href="/forgot-password" className="hover:text-[#16CFFF] transition-colors">
                Reset Credentials
              </Link>
              <a href="#platform" className="hover:text-[#16CFFF] transition-colors">
                Architecture
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[#152744] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 BPUT Placement Intelligence Cell · Biju Patnaik University of Technology, Rourkela
            </div>
            <div className="flex items-center gap-2 text-[#00E5D4] font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PS10 Regulatory Gating Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
