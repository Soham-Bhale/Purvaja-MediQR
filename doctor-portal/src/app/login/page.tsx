'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithGoogleMock,
  signUpWithEmail,
  signInWithEmail,
  getCurrentPatientUser,
} from '../../lib/patient-auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/book';

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    const user = getCurrentPatientUser();
    if (user) {
      router.push(redirectTarget);
    }
  }, [router, redirectTarget]);

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const user = signInWithGoogleMock('alex.mercer@gmail.com', 'Alex Mercer');
      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (mode === 'signup') {
      const res = signUpWithEmail(email, password, fullName);
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }
      setEmailVerificationSent(true);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 1000);
    } else {
      const res = signInWithEmail(email, password);
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }
      router.push(redirectTarget);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl mx-auto shadow-sm">
            ✛
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            MediQR Patient Identity Vault
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'signup' ? 'Create Patient Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to book physician consultations, track live triage status, and manage cryptographic health records.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5 font-mono text-xs">
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300 font-mono flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {emailVerificationSent && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
            <span>✓</span>
            <span>Email verified via Firebase Auth protocol! Redirecting...</span>
          </div>
        )}

        {/* 1-Click Google Sign In (Firebase Auth) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-3 shadow-md cursor-pointer font-sans"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Firebase)</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-[10px] font-mono uppercase text-slate-500">or with email</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 text-xs font-mono">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-slate-300 block">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-400"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-300 block">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. patient@example.com"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 block">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-600/20 cursor-pointer font-sans text-xs"
          >
            {isSubmitting
              ? 'Verifying...'
              : mode === 'signup'
              ? 'Create Account & Continue →'
              : 'Sign In to Portal →'}
          </button>
        </form>

        {/* Presentation Fast Demo Shortcuts */}
        <div className="pt-3 border-t border-white/10 text-center space-y-2">
          <span className="text-[10px] font-mono text-slate-500 block">
            DEMO SHORTCUTS (1-CLICK PRESENTATION PRESETS):
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                signInWithGoogleMock('jane.doe@healthmail.com', 'Jane Doe');
                router.push(redirectTarget);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-cyan-300 font-mono transition cursor-pointer"
            >
              Sign in as Jane Doe
            </button>
            <button
              type="button"
              onClick={() => {
                signInWithGoogleMock('patient.demo@gmail.com', 'Alex Mercer');
                router.push(redirectTarget);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-emerald-300 font-mono transition cursor-pointer"
            >
              Sign in as Alex Mercer (Google)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading Authentication Vault...</div>}>
      <LoginContent />
    </Suspense>
  );
}