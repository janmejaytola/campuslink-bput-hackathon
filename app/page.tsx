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
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { StrictRole, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';
import { Card3D } from '@/components/common/Card3D';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';
import { PublicSettingsModal } from '@/components/settings/PublicSettingsModal';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [activePortalTab, setActivePortalTab] = useState<'STUDENT' | 'RECRUITER' | 'OFFICER'>('STUDENT');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        { label: 'Verified CGPA', value: '8.45', sub: 'Academic Registry' },
        { label: 'Eligible Drives', value: '6 Drives', sub: 'Active Cohort 2026' },
      ],
      features: [
        'Deterministic eligibility validation against campus recruitment criteria',
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

      {/* Global Header / Navigation (Strict Top Bar Contract: 3 zones separated by gap-8) */}
      <header className="sticky top-0 z-50 border-b border-[#152744] bg-[#020817]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-base tracking-wider shadow-[0_0_20px_rgba(22,207,255,0.4)] group-hover:scale-105 transition-transform">
              CL
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-[#16CFFF] transition-colors whitespace-nowrap">
              CAMPUSLINK
            </span>
          </Link>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#9CB4CC]">
            <a href="#platform" className="hover:text-[#16CFFF] transition-colors whitespace-nowrap shrink-0">
              Platform
            </a>
            <a href="#portals" className="hover:text-[#16CFFF] transition-colors whitespace-nowrap shrink-0">
              Workspaces
            </a>
            <a href="#workflow" className="hover:text-[#16CFFF] transition-colors whitespace-nowrap shrink-0">
              Workflow
            </a>
            <a href="#about" className="hover:text-[#16CFFF] transition-colors whitespace-nowrap shrink-0">
              Governance
            </a>
          </nav>

          {/* Zone 3: 1 primary action / auth actions / public settings */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 dark:border-[#152744] bg-white/80 dark:bg-[#06162D]/90 p-2 text-slate-700 dark:text-[#9CB4CC] hover:text-teal-600 dark:hover:text-[#16CFFF] hover:border-teal-500/50 transition-all cursor-pointer shadow-2xs"
              aria-label="Toggle Light/Dark Theme"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>

            {/* Quick System Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#152744] bg-white/80 dark:bg-[#06162D]/90 px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#F4FAFF] hover:border-teal-500/60 hover:text-teal-600 dark:hover:text-[#16CFFF] transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              aria-label="System Settings & Accessibility"
              title="Preferences & Accessibility (Themes, Contrast, Density)"
            >
              <Settings className="h-3.5 w-3.5 text-teal-600 dark:text-[#00F5D4]" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {isAuthenticated && currentUser ? (
              <Link
                href={ROLE_DASHBOARD_ROUTES[currentUser.role]}
                className="gradient-btn-primary rounded-xl px-4 py-2 text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-200 dark:border-[#152744] bg-white/80 dark:bg-[#06162D]/90 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-[#F4FAFF] hover:border-[#16CFFF]/60 hover:text-teal-600 dark:hover:text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="gradient-btn-primary rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-[0_0_20px_rgba(22,207,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,212,0.5)] whitespace-nowrap"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28 border-b border-[#152744]">
        {/* Cinematic university campus background with measured gradient scrim */}
        <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
          <Image
            src="/images/campuslink_hero_campus_1791562156457.jpg"
            alt="Futuristic university campus architecture at dusk"
            fill
            priority
            referrerPolicy="no-referrer"
            className="object-cover object-center opacity-25 filter contrast-125 brightness-90 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/90 via-[#020817]/80 to-[#020817]" />
        </div>

        {/* Abstract 3D Geometric Light Mesh */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(rgba(22, 207, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Clean unboxed metadata kicker */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#16CFFF]">
              <Sparkles className="h-4 w-4 text-[#00E5D4]" />
              <span>Campus Placement Intelligence</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">Intelligent Placement Operations</span>
            </div>

            {/* Main Headline with balanced wrap */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg [text-wrap:balance]">
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
          <div className="mt-14 sm:mt-18 relative max-w-5xl mx-auto perspective-1200">
            {/* Glowing Backdrop Rim */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#16CFFF]/30 via-[#00E5D4]/25 to-[#00BFA6]/30 blur-2xl opacity-75 animate-pulse-glow" />

            <Card3D maxTilt={3.5} glare={true} highlightBorder={true}>
              <div className="relative rounded-3xl border border-[#16CFFF]/35 bg-[#06162D]/95 p-4 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-500 hover:border-[#16CFFF]/70 preserve-3d overflow-hidden">
                {/* Window Bar */}
                <div className="flex items-center justify-between border-b border-[#152744] pb-3 mb-5 translate-z-10">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-[#9CB4CC] hidden sm:inline">
                      campuslink.bput.ac.in/command-center
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#00E5D4]">
                    <span className="text-slate-400">STATUS</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold">ACTIVE CYCLE 2026</span>
                  </div>
                </div>

                {/* Split 3D Preview: Generated High-Fidelity UI Image + Interactive Hologram Layer */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left: High-res dimensional render */}
                  <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#152744] shadow-inner bg-[#020817] group aspect-16/10">
                    <Image
                      src="/images/campuslink_dashboard_preview_1791562168781.jpg"
                      alt="CAMPUSLINK 3D placement dashboard preview"
                      fill
                      priority
                      referrerPolicy="no-referrer"
                      className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-[#06162D]/85 backdrop-blur-md p-2.5 rounded-xl border border-[#16CFFF]/30">
                      <span className="font-bold">Interactive Telemetry Overlay</span>
                      <span className="font-mono text-[#00E5D4] text-[11px] font-bold">1,420 Cohort Synchronized</span>
                    </div>
                  </div>

                  {/* Right: Live Interactive Card Matrix */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-3 translate-z-20">
                    {/* Hero Card inside preview */}
                    <div className="rounded-xl border border-[#152744] bg-[#020817]/90 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#16CFFF] font-bold text-[11px]">STUDENT DOSSIER</span>
                        <span className="text-slate-400 text-[10px] font-mono">Reg #2201106284</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">Priyanshu Mohanty</h4>
                      <p className="text-[11px] text-[#9CB4CC]">
                        CSE · Silicon Institute of Technology · CGPA 8.45
                      </p>
                    </div>

                    {/* Readiness Gauge Widget */}
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#06162D] to-[#0A203B] border border-[#16CFFF]/30">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CB4CC] block">
                          AI Readiness Score
                        </span>
                        <span className="text-2xl font-black font-mono text-[#00E5D4] tabular-nums">
                          84 / 100
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-semibold mt-0.5">
                          Tier-1 Direct Shortlist Eligible
                        </span>
                      </div>
                      <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-3 border-[#16CFFF] shadow-[0_0_15px_rgba(22,207,255,0.4)]">
                        <span className="font-mono text-xs font-black text-white">84%</span>
                      </div>
                    </div>

                    {/* Mini Stats 2-column */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-[#152744] bg-[#020817]/80 p-3">
                        <span className="text-[9px] font-extrabold uppercase text-[#9CB4CC] block">
                          Conflict Radar
                        </span>
                        <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">0 Clashes</p>
                        <span className="text-[10px] text-slate-400">Timetable Protected</span>
                      </div>
                      <div className="rounded-xl border border-[#152744] bg-[#020817]/80 p-3">
                        <span className="text-[9px] font-extrabold uppercase text-[#9CB4CC] block">
                          Verified Offers
                        </span>
                        <p className="text-lg font-black text-[#16CFFF] font-mono mt-0.5">1 Issued</p>
                        <span className="text-[10px] text-slate-400">₹8.5 LPA Package</span>
                      </div>
                    </div>

                    {/* Action button inside preview */}
                    <Link
                      href="/student"
                      className="gradient-btn-primary rounded-xl py-2.5 px-4 text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(22,207,255,0.3)] cursor-pointer"
                    >
                      <span>Explore Live Portal Demo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card3D>
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

          {/* Interactive Portal Display Card with Isometric Visual Showcase */}
          <Card3D maxTilt={2.5} glare={true} highlightBorder={true} className="max-w-5xl mx-auto">
            <div className="rounded-3xl border border-[#16CFFF]/30 bg-[#06162D]/90 p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-6 preserve-3d">
              {/* Header banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#152744] pb-6 translate-z-10">
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

              {/* Portal Content Grid: Visual Asset + Real Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center translate-z-10">
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#152744] shadow-md bg-[#020817] aspect-16/10">
                  <Image
                    src="/images/campuslink_portal_showcase_1791562184038.jpg"
                    alt="Three synchronized placement workspace portals"
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[11px] font-mono font-semibold text-[#00E5D4] bg-[#06162D]/90 px-2.5 py-1.5 rounded-lg border border-[#16CFFF]/25">
                    Isolated RBAC Architecture · 100% Data Protection
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activePortal.description}
                  </p>

                  {/* Live Metrics associated with portal */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activePortal.demoMetrics.map((met, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#020817] border border-[#152744] hover:border-[#16CFFF]/30 transition-colors">
                        <span className="text-[10px] font-extrabold uppercase text-[#9CB4CC] tracking-wider block">
                          {met.label}
                        </span>
                        <p className="text-xl font-black text-[#16CFFF] font-mono mt-1 tabular-nums">
                          {met.value}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{met.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* Key feature checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {activePortal.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <div className="rounded-lg bg-[#16CFFF]/15 border border-[#16CFFF]/40 p-1 text-[#16CFFF] shrink-0 mt-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="leading-snug text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card3D>
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
            <Card3D maxTilt={4} glare={true} className="h-full">
              <div className="h-full rounded-2xl border border-[#152744] bg-[#06162D]/85 p-6 space-y-3.5 hover:border-[#16CFFF]/50 hover:shadow-[0_0_25px_rgba(22,207,255,0.18)] transition-all preserve-3d">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#16CFFF]/40 text-[#16CFFF] translate-z-10">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white translate-z-10">Deterministic Eligibility Gate</h3>
                <p className="text-xs text-[#9CB4CC] leading-relaxed translate-z-10">
                  Evaluates candidate CGPA cutoffs, allowed engineering disciplines, active backlog tolerances, and graduation batches strictly on server-side rules. No hallucinated passes.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={4} glare={true} className="h-full">
              <div className="h-full rounded-2xl border border-[#152744] bg-[#06162D]/85 p-6 space-y-3.5 hover:border-[#00E5D4]/50 hover:shadow-[0_0_25px_rgba(0,229,212,0.18)] transition-all preserve-3d">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00E5D4]/40 text-[#00E5D4] translate-z-10">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white translate-z-10">Explainable Candidate Matching</h3>
                <p className="text-xs text-[#9CB4CC] leading-relaxed translate-z-10">
                  Multi-dimensional rubric scoring across required technical skills, academic performance, project experience, and soft skills with clear justification breakdowns.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={4} glare={true} className="h-full">
              <div className="h-full rounded-2xl border border-[#152744] bg-[#06162D]/85 p-6 space-y-3.5 hover:border-[#00BFA6]/50 hover:shadow-[0_0_25px_rgba(0,191,166,0.18)] transition-all preserve-3d">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00BFA6]/40 text-[#00BFA6] translate-z-10">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white translate-z-10">Conflict-Free Timetable Scheduler</h3>
                <p className="text-xs text-[#9CB4CC] leading-relaxed translate-z-10">
                  Interval tree clash detection prevents interview panel schedules from overlapping with university semester exams, laboratory sessions, or competing job drives.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={4} glare={true} className="h-full">
              <div className="h-full rounded-2xl border border-[#152744] bg-[#06162D]/85 p-6 space-y-3.5 hover:border-[#16CFFF]/50 hover:shadow-[0_0_25px_rgba(22,207,255,0.18)] transition-all preserve-3d">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#16CFFF]/40 text-[#16CFFF] translate-z-10">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white translate-z-10">AI Career Readiness Diagnostic</h3>
                <p className="text-xs text-[#9CB4CC] leading-relaxed translate-z-10">
                  Scores student resumes, portfolio projects, and technical competency against industry job descriptions using structured schema extraction.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={4} glare={true} className="h-full">
              <div className="h-full rounded-2xl border border-[#152744] bg-[#06162D]/85 p-6 space-y-3.5 hover:border-[#00E5D4]/50 hover:shadow-[0_0_25px_rgba(0,229,212,0.18)] transition-all preserve-3d">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00E5D4]/40 text-[#00E5D4] translate-z-10">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white translate-z-10">Target Skill-Gap Radar</h3>
                <p className="text-xs text-[#9CB4CC] leading-relaxed translate-z-10">
                  Identifies missing technical proficiencies for desired corporate roles and maps out actionable learning roadmaps before campus hiring drives begin.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={4} glare={true} className="h-full">
              <div className="h-full rounded-2xl border border-[#152744] bg-[#06162D]/85 p-6 space-y-3.5 hover:border-[#00BFA6]/50 hover:shadow-[0_0_25px_rgba(0,191,166,0.18)] transition-all preserve-3d">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A203B] border border-[#00BFA6]/40 text-[#00BFA6] translate-z-10">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white translate-z-10">Central Placement Governance</h3>
                <p className="text-xs text-[#9CB4CC] leading-relaxed translate-z-10">
                  Institutional oversight with branch-wise placement rates, salary distribution telemetry, verified offer letters, and regulatory audit logging.
                </p>
              </div>
            </Card3D>
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
                <span>Campus Placement Intelligence</span>
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
                Campus Placement Coordination & Intelligence Platform
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
              © 2026 CAMPUSLINK · Campus Placement Intelligence Platform
            </div>
            <div className="flex items-center gap-2 text-[#00E5D4] font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Placement Governance Compliance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Public Preferences & Accessibility Modal */}
      <PublicSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
