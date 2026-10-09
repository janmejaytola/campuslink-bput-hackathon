'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  User,
  Shield,
  Bell,
  Eye,
  Key,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  Lock,
  ExternalLink,
  Mail,
  Smartphone,
  Info,
  HelpCircle,
  Building,
  GraduationCap,
  Clock,
  Radio,
  FileText,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme, ThemeMode, LayoutDensity } from '@/context/ThemeContext';
import { settingsService, UserNotificationSettings, UserPrivacySettings } from '@/lib/services/settingsService';
import { StrictRole, ROLE_LABELS } from '@/types/auth';

type SettingsTab = 'appearance' | 'account' | 'notifications' | 'privacy' | 'accessibility' | 'about';

interface SettingsViewProps {
  role: 'student' | 'recruiter' | 'officer';
}

export function SettingsView({ role }: SettingsViewProps) {
  const { currentUser, logout, updateProfile } = useAuth();
  const {
    theme,
    resolvedTheme,
    density,
    reducedMotion,
    highContrast,
    setTheme,
    setDensity,
    setReducedMotion,
    setHighContrast,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // Notifications state
  const [notifs, setNotifs] = useState<UserNotificationSettings>({
    applicationUpdates: true,
    interviewReminders: true,
    offerAlerts: true,
    driveAnnouncements: true,
    platformNotices: true,
    emailDigest: true,
    inAppSounds: false,
  });

  // Privacy state
  const [privacy, setPrivacy] = useState<UserPrivacySettings>({
    profileVisibility: 'all_verified',
    allowAiResumeIndexing: true,
    showCohortRank: true,
  });

  // Saving states & feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordResetStatus, setPasswordResetStatus] = useState<{
    loading: boolean;
    success?: string;
    error?: string;
  }>({ loading: false });

  // Load existing preferences on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      if (!currentUser?.uid) return;
      try {
        const loaded = await settingsService.getUserSettings(currentUser.uid, currentUser.role);
        if (isMounted) {
          setNotifs(loaded.notifications);
          setPrivacy(loaded.privacy);
        }
      } catch (e) {
        console.warn('Could not load settings', e);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid, currentUser?.role]);

  // Handle Save Notifications & Privacy
  const handleSavePreferences = async () => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await settingsService.saveUserSettings(currentUser.uid, {
        notifications: notifs,
        privacy,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (e) {
      console.error('Failed to save preferences', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Real Firebase Password Reset
  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setPasswordResetStatus({ loading: true });
    try {
      const res = await settingsService.sendPasswordReset(currentUser.email);
      setPasswordResetStatus({
        loading: false,
        success: res.message,
      });
    } catch (error: unknown) {
      const err = error as Error;
      setPasswordResetStatus({
        loading: false,
        error: err.message || 'Failed to dispatch reset email. Please try again later.',
      });
    }
  };

  const userStrictRole: StrictRole = currentUser?.role || 'STUDENT';
  const roleLabel = ROLE_LABELS[userStrictRole] || userStrictRole;

  const profileHref =
    role === 'student'
      ? '/student/profile'
      : role === 'recruiter'
      ? '/recruiter'
      : '/officer';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-[#152744] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00F5D4] bg-[#00C9C0]/15 border border-[#00C9C0]/40 px-2.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(0,201,192,0.15)] flex items-center gap-1.5">
              <Settings className="h-3 w-3" />
              Settings & Configuration
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-[#081B34] border border-[#172D4D] px-2 py-0.5 rounded-md">
              {roleLabel} Console
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure appearance, theme modes, role notifications, profile security, and accessibility across the CAMPUSLINK OS.
          </p>
        </div>

        {/* Quick status pills */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-[#172D4D] bg-[#081B34]/80 px-3 py-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Mode: <span className="text-[#00F5D4] font-bold uppercase">{theme}</span></span>
          </div>
        </div>
      </div>

      {/* Main Settings Layout: Side Navigation Tabs + Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs (Sidebar style on desktop) */}
        <div className="lg:col-span-1 space-y-1.5">
          <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-2 shadow-xl backdrop-blur-md space-y-1">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] text-white shadow-[0_4px_16px_rgba(0,201,192,0.3)]'
                  : 'text-slate-300 hover:bg-[#102442] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="h-4 w-4 shrink-0" />
                <span>Appearance & Theme</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/25">
                {resolvedTheme.toUpperCase()}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] text-white shadow-[0_4px_16px_rgba(0,201,192,0.3)]'
                  : 'text-slate-300 hover:bg-[#102442] hover:text-white'
              }`}
            >
              <User className="h-4 w-4 shrink-0" />
              <span>Account & Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] text-white shadow-[0_4px_16px_rgba(0,201,192,0.3)]'
                  : 'text-slate-300 hover:bg-[#102442] hover:text-white'
              }`}
            >
              <Bell className="h-4 w-4 shrink-0" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] text-white shadow-[0_4px_16px_rgba(0,201,192,0.3)]'
                  : 'text-slate-300 hover:bg-[#102442] hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Privacy & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('accessibility')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'accessibility'
                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] text-white shadow-[0_4px_16px_rgba(0,201,192,0.3)]'
                  : 'text-slate-300 hover:bg-[#102442] hover:text-white'
              }`}
            >
              <Sliders className="h-4 w-4 shrink-0" />
              <span>Accessibility</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-[#007F83] to-[#00C9C0] text-white shadow-[0_4px_16px_rgba(0,201,192,0.3)]'
                  : 'text-slate-300 hover:bg-[#102442] hover:text-white'
              }`}
            >
              <Info className="h-4 w-4 shrink-0" />
              <span>About CAMPUSLINK</span>
            </button>
          </div>

          {/* Quick Session Dossier Card */}
          <div className="rounded-2xl border border-[#172D4D] bg-[#06172B]/90 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-black text-sm shadow-md shadow-[#00C9C0]/20">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'CL'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Authorized User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#152744] flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Clearance:</span>
              <span className="text-[#00F5D4] font-extrabold uppercase font-mono">{roleLabel}</span>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* ======================================================== */}
          {/* SECTION 1: APPEARANCE (HIGHEST PRIORITY) */}
          {/* ======================================================== */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selector Block */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sun className="h-5 w-5 text-[#00C9C0]" />
                      Theme Appearance Mode
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose between the iconic dark cyberpunk aesthetic, professional clean light mode, or synchronize automatically with your device settings.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00C9C0]/15 text-[#00F5D4] border border-[#00C9C0]/30 font-bold">
                    ACTIVE: {theme.toUpperCase()}
                  </span>
                </div>

                {/* 3-Option Segmented Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Dark Mode */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`relative rounded-xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      theme === 'dark'
                        ? 'border-[#00C9C0] bg-[#0A203B] shadow-[0_0_24px_rgba(0,201,192,0.25)] ring-2 ring-[#00C9C0]/50'
                        : 'border-[#172D4D] bg-[#06172B] hover:border-[#1E375C] hover:bg-[#081B34]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#040D1A] border border-[#172D4D] text-[#00F5D4]">
                        <Moon className="h-5 w-5" />
                      </div>
                      {theme === 'dark' && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C9C0] text-[#020817]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        Dark Mode
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4]" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Midnight navy, neon cyan glows & luminous teal accents.
                      </p>
                    </div>
                  </button>

                  {/* Light Mode */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`relative rounded-xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      theme === 'light'
                        ? 'border-[#00C9C0] bg-[#0A203B] shadow-[0_0_24px_rgba(0,201,192,0.25)] ring-2 ring-[#00C9C0]/50'
                        : 'border-[#172D4D] bg-[#06172B] hover:border-[#1E375C] hover:bg-[#081B34]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-300 text-amber-500 shadow-sm">
                        <Sun className="h-5 w-5" />
                      </div>
                      {theme === 'light' && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C9C0] text-[#020817]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        Light Mode
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Clean crisp white surfaces, high-contrast dark text & vivid teal.
                      </p>
                    </div>
                  </button>

                  {/* System Default */}
                  <button
                    onClick={() => setTheme('system')}
                    className={`relative rounded-xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      theme === 'system'
                        ? 'border-[#00C9C0] bg-[#0A203B] shadow-[0_0_24px_rgba(0,201,192,0.25)] ring-2 ring-[#00C9C0]/50'
                        : 'border-[#172D4D] bg-[#06172B] hover:border-[#1E375C] hover:bg-[#081B34]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#06172B] border border-[#172D4D] text-sky-400">
                        <Monitor className="h-5 w-5" />
                      </div>
                      {theme === 'system' && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C9C0] text-[#020817]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        System Default
                        <span className="text-[10px] font-mono text-slate-400 font-normal">({resolvedTheme})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Matches your operating system color scheme preference.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Live Theme Preview Sandbox */}
                <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
                      Live Palette Verification
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Resolved: <strong className="text-white">{resolvedTheme}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-[#172D4D] bg-[#020817] p-3 text-white space-y-1">
                      <span className="text-[10px] font-mono text-[#00F5D4] block">Midnight Navy (#020817)</span>
                      <p className="text-[11px] font-medium text-slate-300">Cyber dark canvas with neon cyan glows</p>
                    </div>
                    <div className="rounded-lg border border-[#00C9C0]/30 bg-gradient-to-r from-[#007F83]/30 to-[#00C9C0]/20 p-3 space-y-1">
                      <span className="text-[10px] font-mono text-[#00F5D4] block">Cyan Highlight (#00C9C0)</span>
                      <p className="text-[11px] font-bold text-white">Vibrant accents remain high-contrast</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Density & Visual Polish */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Maximize2 className="h-5 w-5 text-[#00C9C0]" />
                    Layout Density & Sizing
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Control data spacing and vertical padding across dashboards, tables, and candidate dossiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Comfortable */}
                  <button
                    onClick={() => setDensity('comfortable')}
                    className={`rounded-xl border p-4 text-left transition-all cursor-pointer flex items-center justify-between ${
                      density === 'comfortable'
                        ? 'border-[#00C9C0] bg-[#0A203B] shadow-[0_0_16px_rgba(0,201,192,0.2)]'
                        : 'border-[#172D4D] bg-[#06172B] hover:bg-[#081B34]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#040D1A] text-[#00C9C0]">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Comfortable</p>
                        <p className="text-[11px] text-slate-400">Spacious padding and breathing room</p>
                      </div>
                    </div>
                    {density === 'comfortable' && <Check className="h-4 w-4 text-[#00F5D4]" />}
                  </button>

                  {/* Compact */}
                  <button
                    onClick={() => setDensity('compact')}
                    className={`rounded-xl border p-4 text-left transition-all cursor-pointer flex items-center justify-between ${
                      density === 'compact'
                        ? 'border-[#00C9C0] bg-[#0A203B] shadow-[0_0_16px_rgba(0,201,192,0.2)]'
                        : 'border-[#172D4D] bg-[#06172B] hover:bg-[#081B34]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#040D1A] text-[#00C9C0]">
                        <Minimize2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Compact</p>
                        <p className="text-[11px] text-slate-400">High information density for power users</p>
                      </div>
                    </div>
                    {density === 'compact' && <Check className="h-4 w-4 text-[#00F5D4]" />}
                  </button>
                </div>
              </div>

              {/* Reduced Motion & Visual Comfort */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#00C9C0]" />
                      Reduced Motion Accessibility
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Suppresses 3D pointer tilts, floating card animations, and background particle sweeps. Recommended for users with motion sensitivity or vestibulary disorders.
                    </p>
                  </div>
                  <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      reducedMotion ? 'bg-[#00C9C0]' : 'bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={reducedMotion}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        reducedMotion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-[#152744] pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#00C9C0]" />
                      High Contrast Outlines
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Intensifies border illumination and adds sharper focus indicators for high-visibility environments.
                    </p>
                  </div>
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      highContrast ? 'bg-[#00C9C0]' : 'bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={highContrast}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        highContrast ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: ACCOUNT & PROFILE */}
          {/* ======================================================== */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Authenticated User Dossier */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#152744]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-black text-xl shadow-lg shadow-[#00C9C0]/25">
                      {currentUser?.name?.slice(0, 2).toUpperCase() || 'CL'}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{currentUser?.name || 'Authorized Member'}</h2>
                      <p className="text-xs text-slate-400">{currentUser?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#00C9C0]/15 text-[#00F5D4] border border-[#00C9C0]/40">
                          {roleLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          UID: {currentUser?.uid?.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={profileHref}
                    className="gradient-btn-primary rounded-xl py-2 px-4 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Profile Dossier</span>
                  </Link>
                </div>

                {/* Profile Key Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Institution / University
                    </span>
                    <p className="text-white font-medium">
                      {currentUser?.institution || 'Biju Patnaik University of Technology (BPUT)'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {role === 'student' ? 'Registration / Roll Number' : 'Designation / Title'}
                    </span>
                    <p className="text-white font-medium">
                      {currentUser?.regNumber || currentUser?.designation || 'Not specified'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {role === 'recruiter' ? 'Corporate Company' : 'Academic Department'}
                    </span>
                    <p className="text-white font-medium">
                      {currentUser?.department || currentUser?.company || 'Computer Science & Engineering'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Authentication Provider
                    </span>
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-[#00F5D4]" />
                      <span className="text-white font-medium">
                        {currentUser?.provider === 'google' ? 'Google OAuth 2.0 (SSO)' : 'Firebase Email/Password Auth'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password & Security Management */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#00C9C0]" />
                    Password & Credential Security
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Trigger a secure password reset link directly via Firebase Authentication. A cryptographic one-time token will be sent to your registered email address.
                  </p>
                </div>

                {passwordResetStatus.success && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 flex items-start gap-3 text-xs text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Password Reset Email Dispatched</p>
                      <p className="text-[11px] text-emerald-300/80 mt-0.5">{passwordResetStatus.success}</p>
                    </div>
                  </div>
                )}

                {passwordResetStatus.error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 flex items-start gap-3 text-xs text-rose-200">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error Sending Reset Email</p>
                      <p className="text-[11px] text-rose-300/80 mt-0.5">{passwordResetStatus.error}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handlePasswordReset}
                    disabled={passwordResetStatus.loading}
                    className="w-full sm:w-auto btn-cyber-outline rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {passwordResetStatus.loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-[#00C9C0]" />
                    ) : (
                      <Mail className="h-4 w-4 text-[#00C9C0]" />
                    )}
                    <span>Send Password Reset Email to {currentUser?.email}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: NOTIFICATIONS */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#152744]">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-[#00C9C0]" />
                      Role-Aware Notification Routing
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select which events trigger in-app banner alerts and consolidated email notification digests.
                    </p>
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="gradient-btn-primary rounded-xl py-2 px-4 text-xs font-black flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : saveSuccess ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>{saveSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Your notification preferences were securely updated in your profile.</span>
                  </div>
                )}

                {/* Role Specific Toggles */}
                <div className="space-y-4 divide-y divide-[#152744]">
                  {/* Item 1 */}
                  <div className="pt-3 first:pt-0 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white">
                        {role === 'student'
                          ? 'Placement Applications & Stage Progress'
                          : role === 'recruiter'
                          ? 'New Candidate Submissions & Pool Matches'
                          : 'Drive Registrations & Candidate Shortlists'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {role === 'student'
                          ? 'Receive alerts when recruiters review your application, change stage, or mark shortlisted.'
                          : role === 'recruiter'
                          ? 'Receive alerts whenever a qualified student applies to an open requisition.'
                          : 'Receive alerts when visiting companies update candidate selection rosters.'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs((prev) => ({
                          ...prev,
                          applicationUpdates: !prev.applicationUpdates,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notifs.applicationUpdates ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          notifs.applicationUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white">
                        {role === 'student'
                          ? 'Interview Rounds & Venue Coordination'
                          : role === 'recruiter'
                          ? 'Interview Slot Confirmations & Clash Alerts'
                          : 'Campus Lab & Venue Schedule Clashes'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Immediate reminders for technical rounds, interview booking confirmations, and lab allocations.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs((prev) => ({
                          ...prev,
                          interviewReminders: !prev.interviewReminders,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notifs.interviewReminders ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          notifs.interviewReminders ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Item 3 */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white">
                        {role === 'student'
                          ? 'Formal Offer Letters & CTC Verification'
                          : role === 'recruiter'
                          ? 'Candidate Offer Letter Acceptances'
                          : 'Institutional Offer Audit Records'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        High-priority alerts for formal offer releases, document signing deadlines, and acceptance decisions.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs((prev) => ({
                          ...prev,
                          offerAlerts: !prev.offerAlerts,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notifs.offerAlerts ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          notifs.offerAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Item 4 */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white">
                        Campus Drive Notices & University Announcements
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Notices regarding new company registrations, BPUT hackathon dates, and placement cell guidelines.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs((prev) => ({
                          ...prev,
                          driveAnnouncements: !prev.driveAnnouncements,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notifs.driveAnnouncements ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          notifs.driveAnnouncements ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Channel: Email Digest */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#00F5D4]" />
                        Consolidated Email Digest
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Dispatch a daily summary of high-priority events to {currentUser?.email}. In-app alerts remain active at all times.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs((prev) => ({
                          ...prev,
                          emailDigest: !prev.emailDigest,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notifs.emailDigest ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          notifs.emailDigest ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-3 text-[11px] text-slate-400 flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#00C9C0] shrink-0" />
                  <span>
                    Critical security notices, role verification status, and password reset tokens bypass preference toggles and are delivered instantly.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: PRIVACY & SECURITY */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#00C9C0]" />
                    Privacy & Access Control
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure profile discoverability, role-based boundaries, and AI resume indexing permissions.
                  </p>
                </div>

                <div className="space-y-4 divide-y divide-[#152744]">
                  {/* Discovery */}
                  <div className="pt-3 first:pt-0 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white">
                        {role === 'student'
                          ? 'Dossier Visibility to Verified Recruiters'
                          : role === 'recruiter'
                          ? 'Corporate Profile Visibility in Student Portal'
                          : 'Public Placement Statistics Publication'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {role === 'student'
                          ? 'Allow verified corporate recruiters to discover your academic profile and candidate readiness score.'
                          : role === 'recruiter'
                          ? 'Allow eligible students to view company highlights, past drive statistics, and job roles.'
                          : 'Make aggregate placement statistics available on institutional portal public dashboards.'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPrivacy((prev) => ({
                          ...prev,
                          profileVisibility: prev.profileVisibility === 'all_verified' ? 'invited_only' : 'all_verified',
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        privacy.profileVisibility === 'all_verified' ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          privacy.profileVisibility === 'all_verified' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* AI Resume Indexing */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
                        AI Placement Matching & Skill Radar Indexing
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Allow the AI career intelligence engine to parse technical skill proficiencies for conflict-aware job matching.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPrivacy((prev) => ({
                          ...prev,
                          allowAiResumeIndexing: !prev.allowAiResumeIndexing,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        privacy.allowAiResumeIndexing ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          privacy.allowAiResumeIndexing ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Benchmark ranking */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-white">
                        Cohort Readiness Percentile Display
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Show anonymous comparative percentile standing among BPUT engineering batchmates.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPrivacy((prev) => ({
                          ...prev,
                          showCohortRank: !prev.showCohortRank,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        privacy.showCohortRank ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          privacy.showCohortRank ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#152744] flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="gradient-btn-primary rounded-xl py-2 px-4 text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>Save Privacy Settings</span>
                  </button>
                </div>
              </div>

              {/* Security Health Overview */}
              <div className="rounded-2xl border border-[#172D4D] bg-[#06172B] p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Firebase RBAC & Audit Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-[#172D4D] bg-[#081B34] p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 block">Database</span>
                    <p className="font-mono text-emerald-400 font-bold">Cloud Firestore (default)</p>
                  </div>
                  <div className="rounded-xl border border-[#172D4D] bg-[#081B34] p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 block">Session Security</span>
                    <p className="font-mono text-[#00F5D4] font-bold">JWT Token Authenticated</p>
                  </div>
                  <div className="rounded-xl border border-[#172D4D] bg-[#081B34] p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 block">Security Rules</span>
                    <p className="font-mono text-sky-400 font-bold">Strict Role Enforcement</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 5: ACCESSIBILITY */}
          {/* ======================================================== */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-[#00C9C0]" />
                    Accessibility & Motor Controls
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize sensory input and keyboard navigation according to WCAG 2.1 AA standards.
                  </p>
                </div>

                <div className="space-y-4 divide-y divide-[#152744]">
                  <div className="pt-3 first:pt-0 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Motion Reduction Mode</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Eliminates 3D card tilt and smooths transitions. Current state:{' '}
                        <strong className="text-[#00F5D4] font-mono">
                          {reducedMotion ? 'ACTIVE' : 'OFF'}
                        </strong>
                      </p>
                    </div>
                    <button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        reducedMotion ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          reducedMotion ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">High Contrast Focus Indicators</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Enhances outline width and luminous contrast for all interactable elements.
                      </p>
                    </div>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        highContrast ? 'bg-[#00C9C0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          highContrast ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts Reference */}
                <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#00C9C0]" />
                    Keyboard Navigation Shortcuts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#081B34] border border-[#172D4D]">
                      <span className="text-slate-300">Open Command Search</span>
                      <kbd className="px-2 py-0.5 rounded bg-[#06172B] border border-[#1E375C] font-mono text-[10px] text-[#00F5D4]">
                        ⌘K / Ctrl+K
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#081B34] border border-[#172D4D]">
                      <span className="text-slate-300">Close Popovers / Modals</span>
                      <kbd className="px-2 py-0.5 rounded bg-[#06172B] border border-[#1E375C] font-mono text-[10px] text-slate-300">
                        Esc
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#081B34] border border-[#172D4D]">
                      <span className="text-slate-300">Navigate Interactive Nodes</span>
                      <kbd className="px-2 py-0.5 rounded bg-[#06172B] border border-[#1E375C] font-mono text-[10px] text-slate-300">
                        Tab / Shift+Tab
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#081B34] border border-[#172D4D]">
                      <span className="text-slate-300">Activate 3D Cards & Buttons</span>
                      <kbd className="px-2 py-0.5 rounded bg-[#06172B] border border-[#1E375C] font-mono text-[10px] text-slate-300">
                        Enter / Space
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 6: ABOUT CAMPUSLINK */}
          {/* ======================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#172D4D] bg-[#081B34]/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-4 pb-5 border-b border-[#152744]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-black text-xl shadow-lg shadow-[#00C9C0]/30">
                    CL
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">CAMPUSLINK Placement Intelligence OS</h2>
                    <p className="text-xs text-slate-400">
                      BPUT Hackathon 2026 Problem Statement 10 (PS10) Reference Solution
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Release Version
                    </span>
                    <p className="text-white font-mono font-bold text-sm">v2.4.0-release.2026</p>
                    <p className="text-[11px] text-slate-400">Production Build</p>
                  </div>

                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      AI Reasoning Engine
                    </span>
                    <p className="text-[#00F5D4] font-mono font-bold text-sm">gemini-3.8-flash</p>
                    <p className="text-[11px] text-slate-400">Server-Side Placement Analytics</p>
                  </div>

                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Institutional Governance
                    </span>
                    <p className="text-white font-medium">Biju Patnaik University of Technology (BPUT)</p>
                    <p className="text-[11px] text-slate-400">Central Placement Cell, Rourkela, Odisha</p>
                  </div>

                  <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Architecture
                    </span>
                    <p className="text-white font-medium">Next.js 15 App Router + Firebase + Tailwind</p>
                    <p className="text-[11px] text-slate-400">Strict RBAC & Conflict-Free Scheduling</p>
                  </div>
                </div>

                {/* Support & Grievance desk shortcut */}
                <div className="rounded-xl border border-[#172D4D] bg-[#06172B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-[#00C9C0]" />
                      Need Support or Have a Grievance?
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Students and recruiters can file placement grievances directly through the central coordination desk.
                    </p>
                  </div>
                  <Link
                    href={role === 'officer' ? '/officer/support' : '/officer/support'}
                    className="btn-cyber-outline rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Grievance Desk</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
