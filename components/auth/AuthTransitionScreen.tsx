'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { UserRecord, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth';

interface AuthTransitionScreenProps {
  user: UserRecord;
  destination?: string;
  onFinished?: () => void;
}

export function AuthTransitionScreen({
  user,
  destination,
  onFinished,
}: AuthTransitionScreenProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(12);
  const [statusMessage, setStatusMessage] = useState('Verifying secure session credentials...');

  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const portalName =
    user.role === 'STUDENT'
      ? 'Student Career OS'
      : user.role === 'RECRUITER'
      ? 'Talent Acquisition OS'
      : 'Placement Office Command Center';

  // Authoritative target route strictly based on verified user.role
  const authoritativeTarget =
    destination ||
    (!user.onboardingCompleted ? '/onboarding' : ROLE_DASHBOARD_ROUTES[user.role] || '/student');

  useEffect(() => {
    // Stepped progressive loading transition with smooth updates
    const t1 = setTimeout(() => {
      setProgress(40);
      setStatusMessage(`Authorizing authoritative credentials for ${roleLabel}...`);
    }, 350);

    const t2 = setTimeout(() => {
      setProgress(78);
      setStatusMessage(`Preparing ${portalName}...`);
    }, 800);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusMessage(`Entering ${portalName}...`);
    }, 1250);

    const t4 = setTimeout(() => {
      if (onFinished) {
        onFinished();
      } else {
        router.replace(authoritativeTarget);
      }
    }, 1550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [authoritativeTarget, onFinished, portalName, roleLabel, router]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#020817] p-6 text-slate-900 dark:text-white overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] bg-teal-500/10 dark:bg-[#16CFFF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[28rem] h-[28rem] bg-sky-500/10 dark:bg-[#00E5D4]/12 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle background dot grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(13, 148, 136, 0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Centered Glass Transition Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-teal-500/30 dark:border-[#16CFFF]/30 bg-white/95 dark:bg-[#06162D]/95 p-8 sm:p-10 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(22,207,255,0.12)] backdrop-blur-2xl text-center overflow-hidden">
        {/* Subtle Horizontal Cyan Light Sweep */}
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden pointer-events-none">
          <div className="h-full w-48 bg-gradient-to-r from-transparent via-teal-500 dark:via-[#16CFFF] to-transparent animate-light-sweep" />
        </div>

        {/* Diagonal Light Sweep Effect across card surface */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-teal-500/10 dark:via-[#16CFFF]/15 to-transparent -rotate-45 animate-light-sweep" />
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Glowing Animated Logo */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#16CFFF] via-[#00E5D4] to-[#00BFA6] rounded-2xl blur-lg opacity-60 animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00BFA6] via-[#00E5D4] to-[#16CFFF] text-[#020817] font-black text-2xl shadow-[0_0_30px_rgba(22,207,255,0.5)]">
              CL
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 dark:border-[#16CFFF]/40 bg-teal-50 dark:bg-[#020817]/70 px-3 py-1 text-[11px] font-mono font-bold text-teal-700 dark:text-[#16CFFF] shadow-xs dark:shadow-[0_0_12px_rgba(22,207,255,0.2)]">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-[#00E5D4]" />
              <span>AUTHENTICATION VERIFIED</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white pt-1">
              CAMPUSLINK Intelligence OS
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#9CB4CC]">
              Welcome back, <strong className="text-slate-900 dark:text-white font-semibold">{user.displayName || user.name || user.email}</strong>
            </p>
          </div>

          {/* Authoritative Role Confirmation Pill */}
          <div className="w-full rounded-2xl border border-slate-200 dark:border-[#152744] bg-slate-50 dark:bg-[#020817]/85 p-3.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-[#9CB4CC] flex items-center gap-1.5 font-medium">
                <Lock className="h-3 w-3 text-teal-600 dark:text-[#16CFFF]" /> Authoritative Role
              </span>
              <span className="font-mono font-bold text-teal-700 dark:text-[#00E5D4] bg-teal-50 dark:bg-[#00E5D4]/10 border border-teal-200 dark:border-[#00E5D4]/30 px-2 py-0.5 rounded">
                {roleLabel.toUpperCase()}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between border-t border-slate-200 dark:border-[#152744] pt-2">
              <span className="text-slate-500 dark:text-[#9CB4CC]">Target Portal</span>
              <span className="text-slate-900 dark:text-white font-bold">{portalName}</span>
            </div>
          </div>

          {/* Smooth Linear Progress Bar & Message */}
          <div className="w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-[#16CFFF] animate-spin" />
                {statusMessage}
              </span>
              <span className="font-mono text-xs font-bold text-teal-700 dark:text-[#16CFFF]">{progress}%</span>
            </div>

            {/* Glowing progress rail */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#020817] border border-slate-200 dark:border-[#152744] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#16CFFF] via-[#00E5D4] to-[#00BFA6] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(22,207,255,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-500 dark:text-[#9CB4CC]">
            Biju Patnaik University of Technology · Secure Placement Mesh
          </p>
        </div>
      </div>
    </div>
  );
}
