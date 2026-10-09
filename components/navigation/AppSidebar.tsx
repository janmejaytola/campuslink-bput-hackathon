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
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  HelpCircle,
  Compass,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RouteRole, StrictRole } from '@/types/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Profile Dossier', href: '/student/profile', icon: User },
  { label: 'Resume & Documents', href: '/student/resume', icon: FolderLock },
  { label: 'AI Readiness Score', href: '/student/readiness', icon: Sparkles, badge: 'AI' },
  { label: 'Skill Gap Radar', href: '/student/skill-gap', icon: Target },
  { label: 'Career Goals', href: '/student/career-goals', icon: Award },
  { label: 'Eligibility Gate', href: '/student/eligibility', icon: ShieldCheck },
  { label: 'Job Matches', href: '/student/job-matches', icon: Scale, badge: 'Fit' },
  { label: 'Campus Drives', href: '/student/jobs', icon: Briefcase, badge: 'Live' },
  { label: 'My Applications', href: '/student/applications', icon: FileCheck2 },
  { label: 'Interview Schedule', href: '/student/schedule', icon: CalendarDays },
  { label: 'Offer Letters', href: '/student/offers', icon: CheckCircle2 },
  { label: 'Settings & System', href: '/student/settings', icon: Settings },
];

const RECRUITER_NAV: NavItem[] = [
  { label: 'Recruiter Console', href: '/recruiter', icon: LayoutDashboard },
  { label: 'Job Postings', href: '/recruiter/jobs', icon: Briefcase },
  { label: 'Candidate Pool', href: '/recruiter/candidates', icon: Users },
  { label: 'Shortlist Pipeline', href: '/recruiter/shortlist', icon: UserCheck, badge: 'Board' },
  { label: 'Interview Slots', href: '/recruiter/schedule', icon: CalendarDays, badge: '0 Clashes' },
  { label: 'Issued Offers', href: '/recruiter/offers', icon: CheckCircle2 },
  { label: 'Settings & System', href: '/recruiter/settings', icon: Settings },
];

const OFFICER_NAV: NavItem[] = [
  { label: 'TPO Command', href: '/officer', icon: LayoutDashboard },
  { label: 'Student Directory', href: '/officer/students', icon: Users },
  { label: 'Eligibility Engine', href: '/officer/eligibility', icon: ShieldCheck, badge: 'Gate' },
  { label: 'Match Audits', href: '/officer/matches', icon: Scale, badge: 'Score' },
  { label: 'Visiting Drives', href: '/officer/drives', icon: Building2, badge: 'Active' },
  { label: 'Venue Coordination', href: '/officer/scheduling', icon: CalendarDays, badge: 'Clash-Free' },
  { label: 'Cohort Telemetry', href: '/officer/analytics', icon: BarChart3 },
  { label: 'Grievance Desk', href: '/officer/support', icon: LifeBuoy },
  { label: 'Settings & System', href: '/officer/settings', icon: Settings },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: RouteRole;
  isCollapsed?: boolean;
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

  const roleMeta = {
    student: {
      badge: 'STUDENT OS',
      subtext: 'BPUT Engineering 2026',
      accentColor: 'text-[#00C9C0]',
    },
    recruiter: {
      badge: 'RECRUITER ATS',
      subtext: currentUser?.company || 'Corporate Hiring Partner',
      accentColor: 'text-[#38BDF8]',
    },
    officer: {
      badge: 'CENTRAL TPO',
      subtext: 'Placement Cell Governance',
      accentColor: 'text-[#10B981]',
    },
  }[activeRole];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#06172B]/80 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Deep midnight navy gradient */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#152744] bg-gradient-to-b from-[#06172B] via-[#091D38] to-[#0B1B32] text-slate-300 transition-all duration-300 ease-in-out lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20 w-72' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-16 items-center justify-between border-b border-[#152744]/90 px-4 ${
            isCollapsed ? 'lg:justify-center' : 'px-5'
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 group overflow-hidden"
            title="CampusLink Placement Intelligence"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-extrabold tracking-wider shadow-lg shadow-[#00C9C0]/20 transition-transform group-hover:scale-105">
              CL
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-white text-base">
                    CAMPUSLINK
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#00C9C0] bg-[#00C9C0]/10 border border-[#00C9C0]/30 px-1.5 py-0.2 rounded">
                    {roleMeta.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Placement Intelligence</p>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#152744] hover:text-white lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        {!isCollapsed ? (
          <div className="mx-3 mt-3 mb-1 rounded-2xl border border-[#172D4D] bg-[#081B34]/80 p-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${roleMeta.accentColor}`}>
                {roleMeta.badge}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="mt-1 truncate text-xs font-bold text-white">
              {currentUser?.name || 'Candidate User'}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {activeRole === 'student'
                ? `Reg #${currentUser?.regNumber || '2201106284'}`
                : activeRole === 'officer'
                ? 'Central Placement Cell'
                : currentUser?.company || 'Corporate Recruiter'}
            </p>
          </div>
        ) : (
          <div className="mx-auto my-2 hidden lg:flex flex-col items-center">
            <div
              className="h-9 w-9 rounded-xl bg-[#091D38] border border-[#172D4D] flex items-center justify-center text-[11px] font-bold text-[#00C9C0]"
              title={currentUser?.name || 'User'}
            >
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'CL'}
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
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
                className={`group flex items-center rounded-xl py-2 text-xs font-medium transition-all relative ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } ${
                  isActive
                    ? 'bg-[#00C9C0]/15 text-[#00C9C0] font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-[#102442] hover:text-white'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#00C9C0]" />
                )}

                <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#00C9C0]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold font-mono tracking-tight ${
                      isActive
                        ? 'bg-[#00C9C0]/20 text-[#00C9C0] border border-[#00C9C0]/30'
                        : 'bg-[#152744] text-slate-300 border border-[#1E375C]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* AI Career Assistant Card (when expanded) */}
          {!isCollapsed && activeRole === 'student' && (
            <div className="pt-3 px-1">
              <div className="rounded-2xl border border-[#00C9C0]/30 bg-gradient-to-br from-[#062438] to-[#0A3348] p-3.5 space-y-2.5 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C9C0]/20 text-[#00C9C0] border border-[#00C9C0]/40">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">AI Career Assistant</h4>
                    <p className="text-[10px] text-[#A5F3FC]">Powered by Gemini 3.8 Flash</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Get personalized readiness diagnostics, resume skill extractions, and interview guidance.
                </p>

                <Link
                  href="/student/readiness"
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#007F83] hover:bg-[#00A89E] px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  <span>Launch Advisor</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Promotional Panel & Controls */}
        <div className="border-t border-[#152744] p-3 space-y-2">
          {!isCollapsed && (
            <div className="rounded-xl bg-[#091D38]/80 border border-[#172D4D] p-2.5 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-white block">Batch 2026 Cycle</span>
                <span className="text-[10px] text-slate-400">BPUT PS10 Compliant</span>
              </div>
              <ShieldCheck className="h-4 w-4 text-[#00C9C0]" />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`w-full hidden lg:flex items-center rounded-xl py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#102442] transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center px-1' : 'justify-between px-3'
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {!isCollapsed && <span className="text-[11px] font-medium">Collapse Navigation</span>}
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Bottom Settings Shortcut */}
          <Link
            href={`/${activeRole}/settings`}
            className={`w-full flex items-center rounded-xl py-2 text-xs font-semibold transition-colors cursor-pointer ${
              pathname === `/${activeRole}/settings`
                ? 'bg-[#102442] text-[#00F5D4] border border-[#00C9C0]/40'
                : 'text-slate-400 hover:text-[#00C9C0] hover:bg-[#102442]'
            } ${isCollapsed ? 'justify-center px-1' : 'justify-start gap-2.5 px-3'}`}
            title="System Settings & Appearance"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Settings & System</span>}
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center rounded-xl py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-[#1A162B] transition-colors cursor-pointer ${
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
