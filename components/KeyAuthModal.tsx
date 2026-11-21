'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import {
  Lock,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function KeyAuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    authModalMessage,
    closeAuthModal,
    openAuthModal,
    loginWithSecretKey,
    registerWithHandle,
    user,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab || 'login');
  const [secretKey, setSecretKey] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration success state
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  // Sync tab from props when opened
  React.useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
    setError(null);
    setGeneratedKey(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      setError('Please enter your secret key.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await loginWithSecretKey(secretKey.trim());
    setLoading(false);

    if (res.ok) {
      setSecretKey('');
      closeAuthModal();
    } else {
      setError(res.error || 'Invalid key. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError('Please choose a handle.');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailNotice(null);

    const res = await registerWithHandle(handle.trim(), email.trim() || undefined);
    setLoading(false);

    if (res.ok && res.secretKey) {
      setGeneratedKey(res.secretKey);
      if (email.trim()) {
        setEmailNotice(`A 6-digit verification code & link has been sent to ${email.trim()}.`);
      }
    } else {
      setError(res.error || 'Could not create account. Try a different handle.');
    }
  };

  const handleCopy = () => {
    if (generatedKey && typeof window !== 'undefined') {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] shadow-2xl p-5 sm:p-7 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'login' ? 'Sign in to AutoDB' : 'Create account'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {activeTab === 'login'
              ? 'Enter your secret key to continue'
              : 'Choose a handle to get started'}
          </p>
        </div>

        {/* Context Alert Message */}
        {authModalMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-xs text-[#BE123C] dark:text-[#E11D48] font-medium flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>{authModalMessage}</span>
          </div>
        )}

        {/* Registration success view */}
        {generatedKey ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Your key has been created
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep this safe — it&apos;s how you log in.
              </p>
            </div>

            {/* Key display */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your secret key
              </label>
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435]">
                <code className="text-xs font-mono font-bold text-[#BE123C] dark:text-[#E11D48] flex-1 truncate">
                  {generatedKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center space-x-1 shrink-0"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {emailNotice && (
              <div className="p-3 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-xs text-[#BE123C] dark:text-[#E11D48] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{emailNotice}</span>
              </div>
            )}

            <button
              type="button"
              onClick={closeAuthModal}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-sm font-semibold transition-all border border-slate-700 dark:border-[#E11D48]/40"
            >
              Continue
            </button>
          </div>
        ) : (
          <div>
            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-[#0B1220] p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-[#141B2A] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-[#141B2A] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign up
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign in form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Your secret key</span>
                    <span className="text-xs text-slate-400 font-normal">User or admin</span>
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="autodb-…"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !secretKey.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-sm font-semibold transition-all border border-slate-700 dark:border-[#E11D48]/40 shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError(null);
                    }}
                    className="text-sm text-[#BE123C] dark:text-[#E11D48] hover:underline"
                  >
                    Don&apos;t have an account? Sign up →
                  </button>
                </div>
              </form>
            )}

            {/* Sign up form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Choose a handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @Alex or @TrackDayPro"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                  />
                  <p className="text-xs text-slate-400">
                    We&apos;ll generate a unique secret key tied to your handle.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Email address</span>
                    <span className="text-xs text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com (for verification badge & recovery)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                  />
                  <p className="text-xs text-slate-400">
                    Receive a 6-digit code to get a Verified Contributor badge.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !handle.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-sm font-semibold transition-all border border-slate-700 dark:border-[#E11D48]/40 shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Creating account…' : 'Create account'}</span>
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError(null);
                    }}
                    className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Already have an account? Sign in →
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
