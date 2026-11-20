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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration success state
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

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
      setError('Please enter your Secret Key ID.');
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
      setError(res.error || 'Invalid Secret Key ID. Access denied.');
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

    const res = await registerWithHandle(handle.trim());
    setLoading(false);

    if (res.ok && res.secretKey) {
      setGeneratedKey(res.secretKey);
    } else {
      setError(res.error || 'Failed to create Key ID.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#101623] border border-slate-200 dark:border-[#1E293B] shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-900 dark:text-white"
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-black border border-slate-700 dark:border-[#31bacc]/40 flex items-center justify-center text-[#31bacc]">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Secret Key ID Access
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authentication required for voting & comments
            </p>
          </div>
        </div>

        {/* Context Alert Message (if user clicked vote/comment without login) */}
        {authModalMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#31bacc]/10 border border-[#31bacc]/30 text-xs text-[#177f8d] dark:text-[#31bacc] font-medium flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>{authModalMessage}</span>
          </div>
        )}

        {/* Generated Key Celebration View */}
        {generatedKey ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Account Created Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are now signed in. Save your unique Secret Key ID below to log back in on other devices:
              </p>
            </div>

            {/* Secret Key Copy Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Your Secret Key ID
              </label>
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B]">
                <code className="text-xs font-mono font-bold text-[#177f8d] dark:text-[#31bacc] flex-1 truncate">
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
                      <span>Copied!</span>
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

            <button
              type="button"
              onClick={closeAuthModal}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs"
            >
              Continue to Fleet
            </button>
          </div>
        ) : (
          <div>
            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-[#0A0E17] p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-[#151D2E] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In With Key ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-[#151D2E] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create New Key ID
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
                    <span>Secret Key ID</span>
                    <span className="text-slate-400 text-[10px]">User or Admin</span>
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter Secret Key ID (e.g. autodb-alex-...)"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !secretKey.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5 text-[#31bacc]" />
                  <span>{loading ? 'Verifying...' : 'Sign In With Key ID'}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError(null);
                    }}
                    className="text-xs text-[#177f8d] dark:text-[#31bacc] hover:underline font-medium"
                  >
                    Don&apos;t have a Key ID yet? Create one in 5 seconds &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Choose Your Community Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @TrackDayPro or @Alex"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                  />
                  <p className="text-[10px] text-slate-400">
                    We will generate a unique private Secret Key ID tied to this handle.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !handle.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#31bacc]" />
                  <span>{loading ? 'Generating Key ID...' : 'Generate Secret Key ID'}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    Already have a Secret Key ID? Sign In &rarr;
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
