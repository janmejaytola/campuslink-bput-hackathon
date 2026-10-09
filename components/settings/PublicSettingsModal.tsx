'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Monitor,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  X,
  Check,
  CheckCircle2,
  Settings,
  Sparkles,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useTheme, ThemeMode, LayoutDensity } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { settingsService } from '@/lib/services/settingsService';

interface PublicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublicSettingsModal({ isOpen, onClose }: PublicSettingsModalProps) {
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

  const { currentUser, isAuthenticated } = useAuth();
  const [syncedNotice, setSyncedNotice] = React.useState(false);

  if (!isOpen) return null;

  const handleThemeChange = async (mode: ThemeMode) => {
    setTheme(mode);
    if (currentUser?.uid) {
      await settingsService.updateAppearance(currentUser.uid, { theme: mode });
      showNotice();
    }
  };

  const handleDensityChange = async (d: LayoutDensity) => {
    setDensity(d);
    if (currentUser?.uid) {
      await settingsService.updateAppearance(currentUser.uid, { density: d });
      showNotice();
    }
  };

  const handleMotionToggle = async (enabled: boolean) => {
    setReducedMotion(enabled);
    if (currentUser?.uid) {
      await settingsService.updateAppearance(currentUser.uid, { reducedMotion: enabled });
      showNotice();
    }
  };

  const handleContrastToggle = async (enabled: boolean) => {
    setHighContrast(enabled);
    if (currentUser?.uid) {
      await settingsService.updateAppearance(currentUser.uid, { highContrast: enabled });
      showNotice();
    }
  };

  const showNotice = () => {
    setSyncedNotice(true);
    setTimeout(() => setSyncedNotice(false), 2500);
  };

  const dashboardSettingsRoute = currentUser?.role === 'STUDENT'
    ? '/student/settings'
    : currentUser?.role === 'RECRUITER'
    ? '/recruiter/settings'
    : '/officer/settings';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#1E375C] bg-white dark:bg-[#081B34] p-6 shadow-2xl transition-all relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#152744]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-[#00C9C0]/15 text-teal-700 dark:text-[#00F5D4] border border-teal-200 dark:border-[#00C9C0]/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                System Preferences & Accessibility
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual themes, accessibility modes, and display density
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#102442] transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {syncedNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Preferences saved and synchronized to your account.</span>
          </div>
        )}

        <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Appearance / Theme */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-[#00F5D4] dark:bg-[#00C9C0]/20 dark:text-[#00F5D4] shadow-xs'
                    : 'border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B] text-slate-700 dark:text-slate-300 hover:border-teal-300'
                }`}
              >
                <Sun className="h-5 w-5 text-amber-500" />
                <span>Light</span>
                {theme === 'light' && <Check className="h-3 w-3 text-teal-600 dark:text-[#00F5D4]" />}
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-[#00F5D4] dark:bg-[#00C9C0]/20 dark:text-[#00F5D4] shadow-xs'
                    : 'border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B] text-slate-700 dark:text-slate-300 hover:border-teal-300'
                }`}
              >
                <Moon className="h-5 w-5 text-indigo-400" />
                <span>Dark</span>
                {theme === 'dark' && <Check className="h-3 w-3 text-teal-600 dark:text-[#00F5D4]" />}
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-[#00F5D4] dark:bg-[#00C9C0]/20 dark:text-[#00F5D4] shadow-xs'
                    : 'border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B] text-slate-700 dark:text-slate-300 hover:border-teal-300'
                }`}
              >
                <Monitor className="h-5 w-5 text-sky-400" />
                <span>System</span>
                {theme === 'system' && <Check className="h-3 w-3 text-teal-600 dark:text-[#00F5D4]" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              Active mode: <strong className="capitalize text-slate-700 dark:text-slate-200">{resolvedTheme}</strong>.
            </p>
          </div>

          {/* Layout Density */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Layout Density
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDensityChange('comfortable')}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  density === 'comfortable'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-[#00F5D4] dark:bg-[#00C9C0]/20 dark:text-[#00F5D4]'
                    : 'border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B] text-slate-700 dark:text-slate-300 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  <span>Comfortable</span>
                </div>
                {density === 'comfortable' && <Check className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleDensityChange('compact')}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  density === 'compact'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-[#00F5D4] dark:bg-[#00C9C0]/20 dark:text-[#00F5D4]'
                    : 'border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B] text-slate-700 dark:text-slate-300 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Minimize2 className="h-4 w-4" />
                  <span>Compact</span>
                </div>
                {density === 'compact' && <Check className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Accessibility Controls */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Accessibility
            </label>
            <div className="space-y-2.5">
              {/* High Contrast */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B]">
                <div className="flex items-center gap-2.5">
                  <Eye className="h-4 w-4 text-teal-600 dark:text-[#00F5D4]" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      High Contrast Mode
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enhances borders, cards, and text contrast
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleContrastToggle(!highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    highContrast ? 'bg-teal-600 dark:bg-[#00C9C0]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#06172B]">
                <div className="flex items-center gap-2.5">
                  <Sliders className="h-4 w-4 text-teal-600 dark:text-[#00F5D4]" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Reduced Motion
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Minimizes animations and transitions
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleMotionToggle(!reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    reducedMotion ? 'bg-teal-600 dark:bg-[#00C9C0]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={reducedMotion}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Full Settings link if authenticated */}
          {isAuthenticated && currentUser && (
            <div className="pt-2">
              <Link
                href={dashboardSettingsRoute}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-teal-200 dark:border-[#00C9C0]/30 bg-teal-50/70 dark:bg-[#00C9C0]/10 text-xs font-bold text-teal-800 dark:text-[#00F5D4] hover:bg-teal-100 dark:hover:bg-[#00C9C0]/20 transition-colors"
              >
                <span>Open Full Account & Notification Settings</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#152744] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            CAMPUSLINK v2.4 · BPUT Placement Core
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-teal-600 dark:bg-[#00C9C0] px-4 py-2 text-xs font-bold text-white dark:text-[#020817] hover:bg-teal-500 dark:hover:bg-[#00F5D4] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
