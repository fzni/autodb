'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { MessageCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { user, openAuthModal, logout } = useAuth();
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/autodb';

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#080D18] py-10 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm shrink-0">
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
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md font-sans">
              A clean, no-fluff archive of real vehicle specs—from street cars and heavy haulers to track builds. Added and fact-checked by people who actually care about the numbers.
            </p>

            {/* Discord Button */}
            <div className="pt-2">
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold transition-all shadow-sm group"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join our Discord</span>
                <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Browse
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  All Vehicles
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  User Guide & About
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              {user ? (
                <>
                  <li>
                    <Link
                      href={`/u/${user.handle.replace('@', '')}`}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="hover:text-rose-500 transition-colors"
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Sign in
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Create account
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span>&copy; {new Date().getFullYear()} AutoDB &middot; autodb.tech</span>
            <span>&middot;</span>
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              User Guide
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <span>ECDSA P-256 Auth</span>
            <span>&middot;</span>
            <span>SQLite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
