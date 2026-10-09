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
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
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
];

const RECRUITER_NAV: NavItem[] = [
  { label: 'Recruiting Console', href: '/recruiter', icon: LayoutDashboard },
  { label: 'Job Requisitions', href: '/recruiter/jobs', icon: Briefcase },
  { label: 'Candidate Pipeline', href: '/recruiter/candidates', icon: Users },
  { label: 'Shortlisting Board', href: '/recruiter/shortlist', icon: UserCheck, badge: 'Pipeline' },
  { label: 'Conflict-Free Scheduler', href: '/recruiter/schedule', icon: CalendarDays, badge: '0 Clashes' },
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
  isOpen: boolean; // mobile open
  onClose: () => void;
  activeRole: RouteRole;
  isCollapsed?: boolean; // desktop collapsed
  onToggleCollapse?: () => void;
}

export function AppSidebar({
  isOpen,
  onClose,
  activeRole,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const navItems =
    activeRole === 'student'
      ? STUDENT_NAV
      : activeRole === 'officer'
      ? OFFICER_NAV
      : RECRUITER_NAV;

  const roleMetadata = {
    student: {
      badge: 'CAREER OS',
      portalLabel: 'Student Workspace',
      accentColor: 'text-teal-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(20,184,166,0.25)]',
    },
    recruiter: {
      badge: 'ATS WORKSPACE',
      portalLabel: 'Recruiter Console',
      accentColor: 'text-sky-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(14,165,233,0.25)]',
    },
    officer: {
      badge: 'CENTRAL TPO',
      portalLabel: 'Institutional Command',
      accentColor: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]',
    },
  }[activeRole];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800/80 bg-[#0B0F19] text-slate-200 transition-all duration-300 ease-in-out lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20 w-72' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-16 items-center justify-between border-b border-slate-800/80 px-4 ${
            isCollapsed ? 'lg:justify-center' : 'px-5'
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 group overflow-hidden"
            title="CampusLink Enterprise Placement Platform"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-extrabold tracking-wider shadow-sm transition-transform group-hover:scale-105">
              CL
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-white text-base">
                    CAMPUSLINK
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/90 border border-teal-800/60 px-1.5 py-0.2 rounded">
                    {roleMetadata.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Placement Intelligence</p>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Context Card (Hidden when collapsed on desktop) */}
        {!isCollapsed ? (
          <div className="mx-3 mt-3 mb-1 rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${roleMetadata.accentColor}`}>
                {roleMetadata.portalLabel}
              </span>
              <span className="text-[9px] font-mono text-slate-400">RBAC Verified</span>
            </div>
            <p className="mt-1 truncate text-xs font-bold text-slate-100">
              {currentUser?.name || 'Authenticated User'}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {activeRole === 'student'
                ? `Reg: ${currentUser?.regNumber || '2201106284'}`
                : activeRole === 'officer'
                ? 'Central Placement Cell'
                : currentUser?.company || 'Corporate Recruiter'}
            </p>
          </div>
        ) : (
          <div className="mx-auto my-2 hidden lg:flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold ${roleMetadata.accentColor}`}
              title={currentUser?.name || 'User'}
            >
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'CL'}
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {activeRole === 'student'
                ? 'Career OS Pipeline'
                : activeRole === 'recruiter'
                ? 'Recruiting Pipeline'
                : 'Central Operations'}
            </div>
          )}

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
                title={item.label}
                className={`group flex items-center rounded-xl py-2 text-xs font-semibold transition-all relative ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 shadow-2xs font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-teal-400" />
                )}

                <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono tracking-tight ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
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

        {/* Footer & Controls */}
        <div className="border-t border-slate-800/80 p-3 space-y-2">
          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`w-full hidden lg:flex items-center rounded-xl py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center px-1' : 'justify-between px-3'
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {!isCollapsed && <span className="text-[11px] font-medium">Collapse Sidebar</span>}
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center rounded-xl py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900/90 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-1' : 'justify-start gap-2.5 px-3'
            }`}
            title="Sign Out Session"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
