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
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-slate-100">
      {/* Background subtle mesh pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0D9488 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-bold tracking-wider shadow-lg shadow-teal-900/40 group-hover:bg-teal-500 transition-colors">
            CL
          </div>
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-white block">CAMPUSLINK</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400">Institutional Recovery</span>
          </div>
        </Link>
        <div className="mt-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-800/60 text-teal-300 mx-auto shadow-xs">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
          Reset Credentials
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
          Enter your registered university or corporate email to receive a secure password recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xl space-y-4 text-slate-900">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="leading-relaxed text-emerald-800">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  placeholder="name@bput.ac.in or work@company.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Recovery Instructions</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Shield className="h-3.5 w-3.5 text-teal-500" />
          <span>CAMPUSLINK Protected Recovery Flow</span>
        </div>
      </div>
    </div>
  );
}
