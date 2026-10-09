'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Sparkles,
  Target,
  Briefcase,
  FileCheck2,
  Calendar,
  Award,
  FolderLock,
  Users,
  Building2,
  CalendarDays,
  LifeBuoy,
  BarChart3,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  X,
  LogOut,
  Bell,
  ShieldCheck,
  Scale,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RouteRole, ROLE_LABELS, StrictRole } from '@/types/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Career OS Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Profile Dossier', href: '/student/profile', icon: User },
  { label: 'Resume Documents', href: '/student/resume', icon: FolderLock },
  { label: 'AI Readiness Benchmark', href: '/student/readiness', icon: Sparkles },
  { label: 'Skill Gap Diagnostic', href: '/student/skill-gap', icon: Target },
  { label: 'Career Objectives', href: '/student/career-goals', icon: Award },
  { label: 'Job Eligibility Gate', href: '/student/eligibility', icon: ShieldCheck },
  { label: 'Candidate Fit Matches', href: '/student/job-matches', icon: Scale, badge: 'Fit' },
  { label: 'Opportunity Discovery', href: '/student/jobs', icon: Briefcase, badge: 'Live' },
  { label: 'Application Journey', href: '/student/applications', icon: FileCheck2 },
  { label: 'Interview Calendar', href: '/student/schedule', icon: CalendarDays },
  { label: 'Offers & Joining', href: '/student/offers', icon: CheckCircle2 },
  { label: 'Notification Center', href: '/student/notifications', icon: Bell },
];

const RECRUITER_NAV: NavItem[] = [
  { label: 'Recruiting Console', href: '/recruiter', icon: LayoutDashboard },
  { label: 'Job Requisitions', href: '/recruiter/jobs', icon: Briefcase },
  { label: 'Candidate Pipeline', href: '/recruiter/candidates', icon: Users },
  { label: 'Shortlisting Board', href: '/recruiter/shortlist', icon: UserCheck, badge: 'Step 11' },
  { label: 'Conflict-Free Scheduler', href: '/recruiter/schedule', icon: CalendarDays, badge: 'Step 12' },
  { label: 'Offer Rollouts', href: '/recruiter/offers', icon: CheckCircle2 },
];

const OFFICER_NAV: NavItem[] = [
  { label: 'Institutional Command', href: '/officer', icon: LayoutDashboard },
  { label: 'Student Master Registry', href: '/officer/students', icon: Users },
  { label: 'Batch Eligibility Engine', href: '/officer/eligibility', icon: ShieldCheck, badge: 'Gate' },
  { label: 'Candidate Match Ranking', href: '/officer/matches', icon: Scale, badge: 'Scoring' },
  { label: 'Placement Drives', href: '/officer/drives', icon: Building2, badge: 'Drives' },
  { label: 'Campus Venue Timetable', href: '/officer/scheduling', icon: CalendarDays, badge: 'Clash-Free' },
  { label: 'University Analytics', href: '/officer/analytics', icon: BarChart3 },
  { label: 'Helpdesk & Support', href: '/officer/support', icon: LifeBuoy },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: RouteRole;
}

export function AppSidebar({ isOpen, onClose, activeRole }: AppSidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const navItems =
    activeRole === 'student'
      ? STUDENT_NAV
      : activeRole === 'officer'
      ? OFFICER_NAV
      : RECRUITER_NAV;

  // Custom visual theme styling per portal
  const roleMetadata = {
    student: {
      badge: 'CAREER OS',
      subtext: 'BPUT Engineering · Batch of 2026',
      portalLabel: 'Student Workspace',
      accentColor: 'border-teal-500/30 text-teal-300',
    },
    recruiter: {
      badge: 'ATS WORKSPACE',
      subtext: currentUser?.company || 'Corporate Hiring Partner',
      portalLabel: 'Recruiter Console',
      accentColor: 'border-sky-500/30 text-sky-300',
    },
    officer: {
      badge: 'CENTRAL TPO',
      subtext: 'University Governance & Placement Cell',
      portalLabel: 'Institutional Command',
      accentColor: 'border-emerald-500/30 text-emerald-300',
    },
  }[activeRole];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#0F172A] text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-sm transition-colors group-hover:bg-teal-500">
              CL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">CAMPUSLINK</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800/50 px-1.5 py-0.5 rounded">
                  {roleMetadata.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Placement Intelligence</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Context Card */}
        <div className="mx-4 mt-4 mb-2 rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${roleMetadata.accentColor}`}>
              {roleMetadata.portalLabel}
            </span>
            <span className="text-[10px] font-mono text-slate-500">RBAC Verified</span>
          </div>
          <p className="mt-1 truncate text-xs font-bold text-slate-100">
            {currentUser?.name || 'Authenticated User'}
          </p>
          <p className="truncate text-[11px] text-slate-400">
            {activeRole === 'student'
              ? `Reg: ${currentUser?.regNumber || '2201106284'}`
              : activeRole === 'officer'
              ? 'TPO Central Authority'
              : currentUser?.company || 'Corporate Recruiter'}
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {activeRole === 'student'
              ? 'Personal Career OS'
              : activeRole === 'recruiter'
              ? 'Recruiting Pipeline'
              : 'Institutional Operations'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== `/${activeRole}` && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border-l-2 border-teal-500 shadow-2xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer & Sign Out */}
        <div className="border-t border-slate-800/80 p-4 space-y-2">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900/90 transition-colors border border-transparent hover:border-slate-800 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
