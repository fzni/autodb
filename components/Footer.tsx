'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Gauge, Lock, Crown, LogOut, Heart, MessageSquare, KeyRound } from 'lucide-react';

export default function Footer() {
  const { user, isAdmin, openAuthModal, logout } = useAuth();

  return (
    <footer className="border-t border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#06090F] py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-2 md:max-w-xs">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-black border border-[#31bacc]/40 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-[#31bacc]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                AutoDB
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Automotive specs and community ratings for road cars, commercial vehicles, and motorsport machines.
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
                Explore
              </h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    All vehicles
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Compare
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
                Account
              </h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                {user ? (
                  <li>
                    <button
                      onClick={logout}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Sign out
                    </button>
                  </li>
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
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
          <span>© {new Date().getFullYear()} AutoDB</span>
        </div>
      </div>
    </footer>
  );
}
