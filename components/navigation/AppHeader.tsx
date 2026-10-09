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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RouteRole, StrictRole, ROLE_LABELS } from '@/types/auth';

interface AppHeaderProps {
  onMenuClick: () => void;
  activeRole: RouteRole;
}

export function AppHeader({ onMenuClick, activeRole }: AppHeaderProps) {
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

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
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

  // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
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

  // Compute clean breadcrumb
  const pathParts = pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1]
    ? pathParts[1]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Overview';

  const userStrictRole: StrictRole = currentUser?.role || 'STUDENT';
  const roleLabel = ROLE_LABELS[userStrictRole] || userStrictRole;

  // Search commands based on role
  const searchableActions = [
    ...(activeRole === 'student'
      ? [
          { title: 'My Readiness Score', href: '/student/readiness', category: 'Diagnostics' },
          { title: 'Skill Gap Breakdown', href: '/student/skill-gap', category: 'Diagnostics' },
          { title: 'Career Goals', href: '/student/career-goals', category: 'Planning' },
          { title: 'Job Catalog', href: '/student/jobs', category: 'Opportunities' },
          { title: 'My Applications', href: '/student/applications', category: 'Tracking' },
          { title: 'Interview Schedule', href: '/student/schedule', category: 'Calendar' },
          { title: 'Official Offers', href: '/student/offers', category: 'Placement' },
          { title: 'Profile & Resume', href: '/student/profile', category: 'Account' },
        ]
      : activeRole === 'recruiter'
      ? [
          { title: 'Job Postings', href: '/recruiter/jobs', category: 'Jobs' },
          { title: 'Create Job Opening', href: '/recruiter/jobs/new', category: 'Jobs' },
          { title: 'Candidate Pipeline', href: '/recruiter/candidates', category: 'Candidates' },
          { title: 'Shortlisting Board', href: '/recruiter/shortlist', category: 'Hiring' },
          { title: 'Schedule Interviews', href: '/recruiter/schedule', category: 'Calendar' },
          { title: 'Offer Rollouts', href: '/recruiter/offers', category: 'Offers' },
        ]
      : [
          { title: 'Student Directory', href: '/officer/students', category: 'Database' },
          { title: 'Batch Eligibility Engine', href: '/officer/eligibility', category: 'Audit' },
          { title: 'Candidate Match Rankings', href: '/officer/matches', category: 'Intelligence' },
          { title: 'Placement Drives', href: '/officer/drives', category: 'Operations' },
          { title: 'Venue & Lab Scheduling', href: '/officer/scheduling', category: 'Coordination' },
          { title: 'Placement Analytics', href: '/officer/analytics', category: 'Reporting' },
        ]),
  ];

  const filteredCommands = searchableActions.filter((cmd) =>
    cmd.title.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 md:px-6 shadow-2xs">
        {/* Left: Mobile Toggle & Page Context */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-900">{roleLabel}</span>
            <span>/</span>
            <span className="text-teal-800 font-semibold">{currentSection}</span>
          </div>
        </div>

        {/* Center: Command Palette Trigger Button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:bg-white transition-all shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search routes, candidates, jobs...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Notification Center & User Profile */}
        <div className="flex items-center gap-3">
          {/* Mobile search trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notification Center Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                          !notif.read ? 'bg-teal-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
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
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 px-2.5 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
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
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Workspace Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center border-b border-slate-100 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400 mr-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Type a destination or feature..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-50 text-xs">
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
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">{cmd.title}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500">
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
