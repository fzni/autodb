'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useCompare } from './CompareContext';
import {
  Gauge,
  Sun,
  Moon,
  Plus,
  Columns,
  Lock,
  LogOut,
  Crown,
  ChevronDown,
  KeyRound,
  Copy,
  Check,
  User as UserIcon,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { compareVehicles } = useCompare();
  const [userDropdown, setUserDropdown] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyUserKey = () => {
    if (user?.secret_key && typeof window !== 'undefined') {
      navigator.clipboard.writeText(user.secret_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-[#1E293B] bg-white/90 dark:bg-[#0A0E17]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-black border border-slate-800 dark:border-[#31bacc]/30 flex items-center justify-center text-[#31bacc] shadow-sm group-hover:scale-105 transition-all">
              <Gauge className="w-4 h-4 text-[#31bacc]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              AutoDB
            </span>
          </Link>

          {/* Primary Nav Links */}
          <nav className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#151D2E] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#101623]'
              }`}
            >
              Explore
            </Link>

            <Link
              href="/compare"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                pathname === '/compare'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#151D2E] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#101623]'
              }`}
            >
              <span>Compare</span>
              {compareVehicles.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#31bacc] text-black leading-none">
                  {compareVehicles.length}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                href="/studio"
                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#101623] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101623] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User Status Dropdown or Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#101623] text-slate-800 dark:text-slate-200 text-sm font-medium transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="w-6 h-6 rounded-full bg-[#31bacc]/20 flex items-center justify-center">
                  {isAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-[#31bacc]" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-[#31bacc]" />
                  )}
                </div>
                <span className="max-w-[100px] truncate">{user.handle}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#101623] border border-slate-200 dark:border-[#1E293B] shadow-xl overflow-hidden z-50 animate-in fade-in">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.handle}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {isAdmin ? 'Admin' : 'Member'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {/* Secret Key Copy for regular user */}
                    {user.secret_key && !isAdmin && (
                      <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0A0E17] mx-1 mb-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your secret key</p>
                        <div className="flex items-center justify-between">
                          <code className="text-xs text-[#177f8d] dark:text-[#31bacc] truncate max-w-[130px]">
                            {user.secret_key}
                          </code>
                          <button
                            onClick={handleCopyUserKey}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Copy key"
                          >
                            {copiedKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <Link
                        href="/studio"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Studio</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-black dark:hover:bg-[#131A24] text-white text-sm font-medium transition-all border border-slate-700 dark:border-[#31bacc]/40"
            >
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
