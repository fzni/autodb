'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Gauge, Lock, Crown, LogOut, Heart, MessageSquare, KeyRound } from 'lucide-react';

export default function Footer() {
  const { user, isAdmin, openAuthModal, logout } = useAuth();

  return (
    <footer className="border-t border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#06090F] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-black border border-[#31bacc]/40 flex items-center justify-center text-[#31bacc] shadow-sm">
                <Gauge className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                AutoDB
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#31bacc]/15 text-[#177f8d] dark:text-[#31bacc] font-bold">
                TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Universal automotive telemetry & specification database. Exploring road cars, heavy commercial machines, and motorsport prototypes.
            </p>
            <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
              URI: <span className="text-[#31bacc] font-semibold">autodb.tech</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-mono">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
              <li>
                <Link href="/" className="hover:text-[#31bacc] transition-colors">
                  All Vehicles & Specs
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#31bacc] transition-colors">
                  Side-by-Side Comparison
                </Link>
              </li>
              <li>
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#31bacc]" />
                  <span>Key ID Voting Enabled</span>
                </span>
              </li>
              <li>
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#31bacc]" />
                  <span>Key ID Reviews Live</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Telemetry Architecture */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-mono">
              Telemetry Engine
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <li>
                <span className="text-[#31bacc] mr-1.5">01</span> Power-to-Weight (HP/Ton)
              </li>
              <li>
                <span className="text-[#31bacc] mr-1.5">02</span> Dyno & Torque Curves
              </li>
              <li>
                <span className="text-[#31bacc] mr-1.5">03</span> Secret Key ID Auth
              </li>
              <li>
                <span className="text-[#31bacc] mr-1.5">04</span> Verified Community Feedback
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-mono">
              Authentication Status
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101623] border border-slate-200 dark:border-[#1E293B] space-y-2">
              {isAdmin ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#31bacc] font-mono">
                    <Crown className="w-3.5 h-3.5 text-[#31bacc]" />
                    <span>Admin Clearance Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    You have full clearance to author and edit vehicles.
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <Link
                      href="/studio"
                      className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#31bacc] underline"
                    >
                      Open Studio
                    </Link>
                    <button
                      onClick={logout}
                      className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center space-x-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Signed In: {user.handle}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your Secret Key ID is active. You can vote on vehicles and leave comments.
                  </p>
                  <button
                    onClick={logout}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center space-x-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Secret Key ID Login</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Users must sign in with a Secret Key ID to upvote cars and leave comments.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#31bacc] hover:underline"
                  >
                    <span>Sign In or Create Key ID &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div>
            AutoDB &copy; {new Date().getFullYear()} — Precision Automotive Telemetry
          </div>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0 text-[11px]">
            <span>THEME: #31bacc</span>
            <span>·</span>
            <span className="text-emerald-500 font-bold">STATUS: OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
