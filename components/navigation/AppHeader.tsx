'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Briefcase,
  GraduationCap,
  Layers,
  Lock,
  ExternalLink,
  Command,
  X,
  Building,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RouteRole, StrictRole, ROLE_LABELS } from '@/types/auth';

interface AppHeaderProps {
  onMenuClick: () => void;
  activeRole: RouteRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppHeader({
  onMenuClick,
  activeRole,
  isCollapsed,
  onToggleCollapse,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  const pathParts = pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1]
    ? pathParts[1]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Dashboard';

  const userStrictRole: StrictRole = currentUser?.role || 'STUDENT';
  const roleLabel = ROLE_LABELS[userStrictRole] || userStrictRole;

  const searchableActions = [
    ...(activeRole === 'student'
      ? [
          { title: 'AI Readiness Benchmark', href: '/student/readiness', category: 'Diagnostics' },
          { title: 'Target Role Skill Gap', href: '/student/skill-gap', category: 'Diagnostics' },
          { title: 'Career Objectives & Goals', href: '/student/career-goals', category: 'Planning' },
          { title: 'Drive Eligibility Gate', href: '/student/eligibility', category: 'Compliance' },
          { title: 'Candidate Fit Matches', href: '/student/job-matches', category: 'Matching' },
          { title: 'Campus Drives Discovery', href: '/student/jobs', category: 'Opportunities' },
          { title: 'My Placement Applications', href: '/student/applications', category: 'Tracking' },
          { title: 'Interview Calendar & Venues', href: '/student/schedule', category: 'Calendar' },
          { title: 'Formal Placement Offers', href: '/student/offers', category: 'Placement' },
          { title: 'Profile Dossier & Transcripts', href: '/student/profile', category: 'Account' },
          { title: 'Resume Documents & Extraction', href: '/student/resume', category: 'Documents' },
        ]
      : activeRole === 'recruiter'
      ? [
          { title: 'Job Requisitions & ATS', href: '/recruiter/jobs', category: 'Jobs' },
          { title: 'Create Job Requisition', href: '/recruiter/jobs/new', category: 'Jobs' },
          { title: 'Verified Candidate Pool', href: '/recruiter/candidates', category: 'Candidates' },
          { title: 'Shortlisting Board', href: '/recruiter/shortlist', category: 'Hiring' },
          { title: 'Conflict-Free Scheduler', href: '/recruiter/schedule', category: 'Calendar' },
          { title: 'Offer Letter Rollouts', href: '/recruiter/offers', category: 'Offers' },
        ]
      : [
          { title: 'Student Master Registry', href: '/officer/students', category: 'Database' },
          { title: 'Batch Eligibility Engine', href: '/officer/eligibility', category: 'Audit' },
          { title: 'Candidate Match Ranking', href: '/officer/matches', category: 'Intelligence' },
          { title: 'Visiting Campus Drives', href: '/officer/drives', category: 'Operations' },
          { title: 'Venue & Lab Scheduling', href: '/officer/scheduling', category: 'Coordination' },
          { title: 'Institutional Telemetry & CSV', href: '/officer/analytics', category: 'Reporting' },
          { title: 'Student Grievance Helpdesk', href: '/officer/support', category: 'Support' },
        ]),
  ];

  const filteredCommands = searchableActions.filter((cmd) =>
    cmd.title.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#152744] bg-[#06172B]/90 backdrop-blur-md px-4 md:px-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] text-white">
        {/* Left: Mobile Toggle / Desktop Collapse & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-slate-300 hover:bg-[#102442] hover:text-[#00C9C0] lg:hidden cursor-pointer"
            aria-label="Open sidebar drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex rounded-xl p-2 text-slate-400 hover:bg-[#102442] hover:text-[#00C9C0] transition-colors cursor-pointer"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Breadcrumb Context */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-white hidden sm:inline">{roleLabel}</span>
            <span aria-hidden="true" className="text-slate-500 hidden sm:inline">/</span>
            <span className="font-bold text-[#00F5D4] drop-shadow-[0_0_6px_rgba(0,245,212,0.3)]">{currentSection}</span>
          </div>
        </div>

        {/* Center: Global Search Bar with ⌘K shortcut */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-[#172D4D] bg-[#081B34] hover:bg-[#0B2242] px-3.5 py-2 text-xs text-slate-300 hover:border-[#00C9C0]/50 hover:shadow-[0_0_12px_rgba(0,201,192,0.15)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-3.5 w-3.5 text-[#00C9C0]" />
              <span className="text-slate-400">Search drives, candidates, tools & routes...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 rounded-md border border-[#1E375C] bg-[#06172B] px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Dark mode toggle, Notifications, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="md:hidden rounded-xl p-2 text-slate-400 hover:bg-[#102442] hover:text-[#00C9C0] cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-xl p-2 text-slate-400 hover:bg-[#102442] hover:text-[#00C9C0] transition-colors cursor-pointer"
            aria-label="Toggle visual mode"
            title="Theme indicator"
          >
            {isDarkMode ? (
              <Moon className="h-4 w-4 text-[#00C9C0]" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-xl p-2 text-slate-400 hover:bg-[#102442] hover:text-[#00C9C0] transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C9C0] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C9C0]" />
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#172D4D] bg-[#081B34] shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#152744] p-4 bg-[#06172B]">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-[#00F5D4] bg-[#00C9C0]/15 px-2 py-0.5 rounded-full tabular-nums border border-[#00C9C0]/30">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-bold text-[#00C9C0] hover:text-[#00F5D4] cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#152744]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications at this moment
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 transition-colors cursor-pointer hover:bg-[#0B2242] ${
                          !notif.read ? 'bg-[#00C9C0]/10 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums font-mono">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-xl border border-[#172D4D] bg-[#081B34] py-1.5 px-2.5 hover:bg-[#0B2242] hover:border-[#00C9C0]/40 transition-colors shadow-sm cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-black text-xs shadow-md shadow-[#00C9C0]/20">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'CL'}
              </div>
              <div className="text-left hidden md:block max-w-[130px]">
                <p className="text-xs font-bold text-white leading-none truncate">
                  {currentUser?.name || 'Candidate User'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1 truncate">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#172D4D] bg-[#081B34] p-2 shadow-2xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-[#152744]">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00C9C0]/15 text-[#00F5D4] border border-[#00C9C0]/40">
                    {roleLabel}
                  </span>
                </div>

                <Link
                  href={
                    activeRole === 'student'
                      ? '/student/profile'
                      : activeRole === 'recruiter'
                      ? '/recruiter'
                      : '/officer'
                  }
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-[#102442] hover:text-white"
                >
                  <User className="h-4 w-4 text-[#00C9C0]" />
                  <span>Profile Dossier</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#030B17]/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#172D4D] bg-[#081B34] shadow-[0_12px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center border-b border-[#152744] px-4 py-3 bg-[#06172B]">
              <Search className="h-4 w-4 text-[#00C9C0] mr-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Jump to route, feature, or diagnostics..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full text-xs font-medium text-white placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-[#152744]/60 text-xs">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No matching routes found</div>
              ) : (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.href}
                    onClick={() => {
                      setIsCommandOpen(false);
                      router.push(cmd.href);
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-[#102442] transition-colors cursor-pointer text-slate-200"
                  >
                    <span className="font-bold text-white">{cmd.title}</span>
                    <span className="text-[10px] font-mono text-[#00F5D4] bg-[#00C9C0]/15 px-2 py-0.5 rounded border border-[#00C9C0]/30">
                      {cmd.category}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
