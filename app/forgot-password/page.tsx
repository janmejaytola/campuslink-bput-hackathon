'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2, KeyRound, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatAuthError } from '@/lib/auth/authService';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccessMessage(
        `A password reset email has been dispatched to ${email}. Please check your inbox and follow the instructions to securely reset your credentials.`
      );
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040D1A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-slate-100 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#00C9C0]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[36rem] h-[36rem] bg-[#007F83]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Background subtle mesh pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 201, 192, 0.25) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#007F83] to-[#00C9C0] text-white font-black tracking-wider shadow-lg shadow-[#00C9C0]/25 transition-transform group-hover:scale-105">
            CL
          </div>
          <div className="text-left">
            <span className="text-xl font-black tracking-tight text-white block">CAMPUSLINK</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#00F5D4]">Institutional Recovery</span>
          </div>
        </Link>
        <div className="mt-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#081B34] border border-[#172D4D] text-[#00F5D4] mx-auto shadow-[0_0_15px_rgba(0,201,192,0.2)]">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white drop-shadow-sm">
          Reset Credentials
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
          Enter your registered university or corporate email to receive a secure password recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#081B34]/85 p-6 sm:p-8 rounded-2xl border border-[#152744] shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md space-y-4 text-slate-100">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@bput.ac.in or talent@company.com"
                  className="w-full rounded-xl border border-[#152744] bg-[#06172B] py-2.5 pl-10 pr-3.5 text-xs font-medium text-white placeholder:text-slate-500 focus:border-[#00C9C0] focus:outline-none focus:ring-2 focus:ring-[#00C9C0]/25 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#007F83] via-[#00A89E] to-[#00C9C0] px-4 py-2.5 text-xs font-bold text-white hover:from-[#00A89E] hover:to-[#00F5D4] transition-all shadow-[0_4px_16px_rgba(0,127,131,0.4)] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching reset link...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Password Reset Instructions</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[#152744] flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>

            <Link
              href="/register"
              className="font-bold text-[#00F5D4] hover:underline transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
