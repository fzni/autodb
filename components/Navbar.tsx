'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useCompare } from './CompareContext';
import { useUnits } from './UnitContext';
import {
  Sun,
  Moon,
  Plus,
  Columns,
  LogOut,
  Crown,
  ChevronDown,
  Copy,
  Check,
  User as UserIcon,
  BadgeCheck,
  Bookmark,
  Layers,
  Menu,
  X,
  GitPullRequest,
  BookOpen,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { compareVehicles } = useCompare();
  const { unitSystem, toggleUnitSystem } = useUnits();
  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [pendingRevisionsCount, setPendingRevisionsCount] = useState(0);

  // Poll for pending spec proposals when user is admin
  React.useEffect(() => {
    if (!isAdmin) {
      setPendingRevisionsCount(0);
      return;
    }
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/revisions?countOnly=true');
        if (res.ok) {
          const data = await res.json();
          setPendingRevisionsCount(data.pendingCount || 0);
        }
      } catch (e) {}
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleCopyUserKey = () => {
    if (user?.secret_key && typeof window !== 'undefined') {
      navigator.clipboard.writeText(user.secret_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-[#1A2435] bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 sm:space-x-8">
          <Link href="/" onClick={closeMobileMenu} className="flex items-center space-x-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm group-hover:scale-105 transition-all shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <rect width="32" height="32" rx="7" fill="#0B1220"/>
                <path fill="#FFFFFF" d="M5 24 L5 17 Q5 15 7 14.5 L10 13.5 L11.5 9.5 Q12 8 14 8 L18 8 Q20 8 20.5 9.5 L22 13.5 L25 14.5 Q27 15 27 17 L27 24 Q27 25 26 25 L6 25 Q5 25 5 24 Z"/>
                <g fill="#0B1220">
                  <path d="M12 13.5 L20 13.5 L19 10 Q18.5 9 17.5 9 L14.5 9 Q13.5 9 13 10 Z"/>
                  <rect x="6.5" y="16.5" width="4.5" height="2" rx="1"/>
                  <rect x="21" y="16.5" width="4.5" height="2" rx="1"/>
                </g>
                <g fill="#0B1220">
                  <rect x="8" y="19.5" width="2" height="3.5" rx="0.5"/>
                  <rect x="11.5" y="18.5" width="2" height="4.5" rx="0.5"/>
                  <rect x="18.5" y="18.5" width="2" height="4.5" rx="0.5"/>
                  <rect x="22" y="19.5" width="2" height="3.5" rx="0.5"/>
                </g>
                <rect x="15" y="17.5" width="2" height="5.5" rx="0.5" fill="#E11D48"/>
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              AutoDB
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E11D48]/15 text-[#BE123C] dark:text-[#E11D48] border border-[#E11D48]/30 leading-none">
              beta
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#141B2A] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#0F1623]'
              }`}
            >
              Explore
            </Link>

            <Link
              href="/compare"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                pathname === '/compare'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#141B2A] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#0F1623]'
              }`}
            >
              <span>Compare</span>
              {compareVehicles.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#E11D48] text-black leading-none">
                  {compareVehicles.length}
                </span>
              )}
            </Link>

            <Link
              href="/brands"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/brands'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#141B2A] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#0F1623]'
              }`}
            >
              Brands
            </Link>

            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/about'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#141B2A] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#0F1623]'
              }`}
            >
              Guide
            </Link>

            {isAdmin && (
              <Link
                href="/studio"
                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#0F1623] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Studio</span>
                {pendingRevisionsCount > 0 && (
                  <span
                    title={`${pendingRevisionsCount} pending spec edit proposals`}
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black leading-none animate-pulse"
                  >
                    {pendingRevisionsCount}
                  </span>
                )}
              </Link>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* SI / Imperial Unit Toggle Button (Responsive: SI/IMP on mobile, Metric/Imperial on tablet+) */}
          <button
            onClick={toggleUnitSystem}
            type="button"
            title={`Unit System: ${unitSystem === 'metric' ? 'Metric (kW, Nm, kg, km/h)' : 'Imperial (HP, lb-ft, lbs, mph)'}`}
            className="px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1623] text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center space-x-1"
          >
            <span className={unitSystem === 'metric' ? 'text-[#BE123C] dark:text-[#E11D48] font-bold' : 'text-slate-400'}>
              <span className="hidden sm:inline">Metric</span>
              <span className="sm:hidden">SI</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className={unitSystem === 'imperial' ? 'text-[#BE123C] dark:text-[#E11D48] font-bold' : 'text-slate-400'}>
              <span className="hidden sm:inline">Imperial</span>
              <span className="sm:hidden">IMP</span>
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0F1623] transition-colors"
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
                className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1A2435] bg-slate-50 dark:bg-[#0F1623] text-slate-800 dark:text-slate-200 text-sm font-medium transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#E11D48]/20 flex items-center justify-center shrink-0">
                  {isAdmin ? (
                    <Crown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#E11D48]" />
                  ) : (
                    <UserIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#E11D48]" />
                  )}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-xs sm:text-sm">{user.handle}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] shadow-xl overflow-hidden z-50 animate-in fade-in">
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
                    {/* Contributor Profile Link */}
                    <Link
                      href={`/u/${user.handle.replace('@', '')}`}
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#E11D48]" />
                      <span>Profile & Garage</span>
                      {user.email_verified === 1 && (
                        <BadgeCheck className="w-4 h-4 text-emerald-500 ml-auto" />
                      )}
                    </Link>

                    {/* Secret Key Copy for regular user */}
                    {user.secret_key && !isAdmin && (
                      <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B1220] mx-1 mb-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your secret key</p>
                        <div className="flex items-center justify-between">
                          <code className="text-xs text-[#BE123C] dark:text-[#E11D48] truncate max-w-[130px]">
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
                      <>
                        <Link
                          href="/studio?tab=revisions"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="flex items-center space-x-2">
                            <GitPullRequest className="w-4 h-4 text-amber-500" />
                            <span>Review Edits</span>
                          </span>
                          {pendingRevisionsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                              {pendingRevisionsCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/studio"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Studio Fleet</span>
                        </Link>
                      </>
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
              className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-black dark:hover:bg-[#131A24] text-white text-xs sm:text-sm font-medium transition-all border border-slate-700 dark:border-[#E11D48]/40 shrink-0"
            >
              <span>Sign in</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-[#1A2435] bg-white dark:bg-[#0B1220] px-4 py-3 space-y-1 shadow-lg animate-in fade-in">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-[#E11D48]/15 text-[#BE123C] dark:text-[#E11D48] font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Explore</span>
            </span>
          </Link>

          <Link
            href="/compare"
            onClick={closeMobileMenu}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/compare'
                ? 'bg-[#E11D48]/15 text-[#BE123C] dark:text-[#E11D48] font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Columns className="w-4 h-4" />
              <span>Compare</span>
            </span>
            {compareVehicles.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E11D48] text-black">
                {compareVehicles.length}
              </span>
            )}
          </Link>

          <Link
            href="/brands"
            onClick={closeMobileMenu}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/brands'
                ? 'bg-[#E11D48]/15 text-[#BE123C] dark:text-[#E11D48] font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4" />
              <span>Brands Directory</span>
            </span>
          </Link>

          <Link
            href="/about"
            onClick={closeMobileMenu}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/about'
                ? 'bg-[#E11D48]/15 text-[#BE123C] dark:text-[#E11D48] font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>User Guide & About</span>
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/studio"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/studio'
                  ? 'bg-[#E11D48]/15 text-[#BE123C] dark:text-[#E11D48] font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623]'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Studio Fleet</span>
              </span>
              {pendingRevisionsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                  {pendingRevisionsCount} pending
                </span>
              )}
            </Link>
          )}

          {user && (
            <Link
              href={`/u/${user.handle.replace('@', '')}`}
              onClick={closeMobileMenu}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1623] transition-colors"
            >
              <UserIcon className="w-4 h-4 text-[#E11D48]" />
              <span>Profile & Garage</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
