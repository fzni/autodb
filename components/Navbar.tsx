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
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                AutoDB
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#31bacc]/15 border border-[#31bacc]/30 text-[#177f8d] dark:text-[#31bacc] font-mono font-bold">
                TELEMETRY
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <nav className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                pathname === '/'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#151D2E] font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#101623]'
              }`}
            >
              Explore
            </Link>

            <Link
              href="/compare"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition-all ${
                pathname === '/compare'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#151D2E] font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#101623]'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-[#31bacc]" />
              <span>Compare</span>
              {compareVehicles.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#31bacc] text-black font-extrabold">
                  {compareVehicles.length}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Add Vehicle Button: ONLY if admin */}
          {isAdmin && (
            <Link
              href="/studio"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-black dark:hover:bg-[#131A24] text-white text-xs font-bold tracking-wide transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#31bacc]" />
              <span>Add Vehicle</span>
              <span className="text-[9px] px-1 py-0.2 bg-[#31bacc] text-black rounded font-mono font-black ml-1">
                ADMIN
              </span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101623] text-slate-600 dark:text-slate-300 hover:text-[#31bacc] hover:border-[#31bacc]/40 transition-colors shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Status Dropdown or Secret Key Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                  isAdmin
                    ? 'border-[#31bacc]/50 bg-[#31bacc]/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#101623] text-slate-800 dark:text-slate-200'
                }`}
              >
                {isAdmin ? (
                  <Crown className="w-3.5 h-3.5 text-[#31bacc]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span>{user.handle}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#101623] border border-slate-200 dark:border-[#1E293B] shadow-xl p-3 z-50 animate-in fade-in space-y-2">
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-mono uppercase text-slate-400">
                      Signed in as
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {user.handle}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono ml-1.5">
                      {isAdmin ? 'Administrator' : 'Member'}
                    </span>
                  </div>

                  {/* Secret Key Copy for regular user */}
                  {user.secret_key && !isAdmin && (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-[#1E293B] space-y-1">
                      <span className="block text-[9px] uppercase font-mono text-slate-400">
                        Your Secret Key ID:
                      </span>
                      <div className="flex items-center justify-between">
                        <code className="text-[10px] font-mono text-[#177f8d] dark:text-[#31bacc] truncate max-w-[120px]">
                          {user.secret_key}
                        </code>
                        <button
                          onClick={handleCopyUserKey}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title="Copy Secret Key"
                        >
                          {copiedKey ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <Link
                      href="/studio"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Studio Manager</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-black dark:hover:bg-[#131A24] text-white text-xs font-bold tracking-wide transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#31bacc]" />
              <span>Key ID Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
