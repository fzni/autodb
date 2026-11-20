'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Vehicle, Comment } from '@/lib/types';
import { useCompare } from './CompareContext';
import { useAuth } from './AuthContext';
import {
  ArrowLeft,
  Columns,
  Check,
  Edit3,
  Trash2,
  Gauge,
  Zap,
  Weight,
  Sparkles,
  Trophy,
  Truck,
  Car,
  Layers,
  ArrowUp,
  MessageSquare,
  Send,
  User,
  Share2,
  CheckCircle2,
  Lock,
  KeyRound,
} from 'lucide-react';

interface VehicleDossierClientProps {
  vehicle: Vehicle;
  initialComments?: Comment[];
}

export default function VehicleDossierClient({
  vehicle,
  initialComments = [],
}: VehicleDossierClientProps) {
  const router = useRouter();
  const { toggleCompare, isInCompare } = useCompare();
  const { user, isAdmin, openAuthModal } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Voting state
  const [votesCount, setVotesCount] = useState(vehicle.votes_count || 0);
  const [hasVoted, setHasVoted] = useState(vehicle.has_voted || false);
  const [voting, setVoting] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const inCompare = isInCompare(vehicle.slug);

  // Specs & math
  const hp = vehicle.powertrain?.hp || 0;
  const kw = vehicle.powertrain?.kw || (hp ? Math.round(hp * 0.7457) : 0);
  const torqueNm = vehicle.powertrain?.torque_nm || 0;
  const weightKg = vehicle.chassis?.curb_weight_kg || 0;
  const hpPerTon = weightKg > 0 ? (hp / (weightKg / 1000)).toFixed(1) : '—';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVote = async () => {
    if (!user) {
      openAuthModal('login', `Please sign in with your Secret Key ID to upvote the ${vehicle.make} ${vehicle.model}.`);
      return;
    }

    if (voting) return;

    const previousVoted = hasVoted;
    const previousCount = votesCount;
    const nextVoted = !previousVoted;
    const nextCount = nextVoted ? previousCount + 1 : Math.max(0, previousCount - 1);

    setHasVoted(nextVoted);
    setVotesCount(nextCount);
    setVoting(true);

    try {
      const res = await fetch(`/api/vehicles/${vehicle.slug}/vote`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setVotesCount(data.count);
        setHasVoted(data.voted);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.requiresAuth) {
          openAuthModal('login', data.error);
        }
        setHasVoted(previousVoted);
        setVotesCount(previousCount);
      }
    } catch (err) {
      setHasVoted(previousVoted);
      setVotesCount(previousCount);
    } finally {
      setVoting(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Please sign in with your Secret Key ID to leave a comment.');
      return;
    }

    if (!newComment.trim()) return;

    setPostingComment(true);
    setCommentError(null);

    try {
      const res = await fetch(`/api/vehicles/${vehicle.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        if (data.requiresAuth) {
          openAuthModal('login', data.error);
        }
        setCommentError(data.error || 'Failed to post comment');
      }
    } catch (err: any) {
      setCommentError(err.message || 'Error connecting to server');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      alert('Only verified administrators with the secret key can delete vehicles.');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.slug}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete vehicle');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting vehicle');
    } finally {
      setDeleting(false);
    }
  };

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" fill="%23f1f5f9"><rect width="1200" height="600" fill="%23f1f5f9"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="32" fill="%230f172a">${vehicle.make} ${vehicle.model}</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20" fill="%2364748B">${vehicle.generation} · ${vehicle.year}</text></svg>`;

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Road':
        return <Car className="w-4 h-4 text-[#177f8d] dark:text-[#31bacc]" />;
      case 'Commercial':
        return <Truck className="w-4 h-4 text-amber-500" />;
      case 'Motorsport':
        return <Trophy className="w-4 h-4 text-rose-500" />;
      case 'Concept':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Header Bar */}
      <div className="border-b border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0A0E17] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#31bacc] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </Link>

          <div className="flex items-center space-x-2.5">
            {/* Share Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#101623] text-slate-700 dark:text-slate-300 hover:text-slate-900 text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Compare Toggle */}
            <button
              onClick={() => toggleCompare(vehicle)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inCompare
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-white dark:bg-[#101623] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] hover:border-[#31bacc]'
              }`}
            >
              {inCompare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#31bacc]" />
                  <span>In Compare</span>
                </>
              ) : (
                <>
                  <Columns className="w-3.5 h-3.5 text-slate-400" />
                  <span>+ Compare</span>
                </>
              )}
            </button>

            {/* Admin-only Edit & Delete */}
            {isAdmin && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-[#1E293B]">
                <Link
                  href={`/studio?edit=${vehicle.slug}`}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#31bacc] text-black text-xs font-bold shadow-xs hover:bg-[#289bb0] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title, Identity & Big Upvote CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-[#1E293B]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold">
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#151D2E] text-slate-700 dark:text-slate-300">
                {getDomainIcon(vehicle.domain)}
                <span>{vehicle.domain}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-slate-500">{vehicle.sub_category}</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-[#31bacc] font-bold">{vehicle.year}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-sm font-mono text-slate-500">
              Platform Generation: <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.generation}</span>
            </p>
          </div>

          {/* Interactive Upvote Button for Users */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVote}
              title={
                !user
                  ? 'Sign in with Secret Key ID to upvote'
                  : hasVoted
                  ? 'Remove your upvote'
                  : 'Upvote this vehicle'
              }
              className={`flex items-center space-x-2.5 px-5 py-3 rounded-xl text-sm font-mono font-bold transition-all shadow-xs ${
                hasVoted
                  ? 'bg-[#31bacc] text-black shadow-md'
                  : 'bg-slate-900 dark:bg-black text-white hover:bg-slate-800 dark:hover:bg-[#151D2E] border border-slate-700 dark:border-[#31bacc]/30'
              }`}
            >
              <ArrowUp className={`w-5 h-5 ${hasVoted ? 'stroke-[3]' : 'text-[#31bacc]'}`} />
              <span>{hasVoted ? 'Upvoted' : 'Upvote'}</span>
              <span className="px-2 py-0.5 rounded-md bg-black/20 text-xs font-mono font-black">
                {votesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Hero Image Showcase */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06090F] border border-slate-200/80 dark:border-[#1E293B] shadow-sm">
          <img
            src={imgError ? fallbackSvg : vehicle.hero_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Telemetry Highlight Banner Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] text-center shadow-xs">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Total Output</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {hp} <span className="text-xs text-slate-400 font-normal">HP</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] text-center shadow-xs">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Kilowatts</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {kw} <span className="text-xs text-slate-400 font-normal">kW</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] text-center shadow-xs">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Peak Torque</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {torqueNm} <span className="text-xs text-slate-400 font-normal">Nm</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] text-center shadow-xs">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Curb Weight</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {weightKg.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg</span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-[#31bacc]/10 dark:bg-[#31bacc]/15 border border-[#31bacc]/40 text-center shadow-xs">
            <span className="block text-[10px] uppercase font-mono text-[#177f8d] dark:text-[#31bacc] font-black">Power-to-Weight</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#177f8d] dark:text-[#31bacc]">
              {hpPerTon} <span className="text-xs font-semibold">HP/t</span>
            </span>
          </div>
        </div>

        {/* Editorial Summary */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-2">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
            Dossier Summary
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {vehicle.summary}
          </p>
        </div>

        {/* Detailed Spec Tables (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Powertrain Specs */}
          <div className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <Zap className="w-4 h-4 text-[#31bacc]" />
              <h2 className="uppercase font-mono tracking-wider text-xs">Powertrain & Architecture</h2>
            </div>

            <table className="w-full text-xs font-sans">
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono w-1/3">Engine / Motor</td>
                  <td className="py-2.5 text-slate-900 dark:text-white font-medium">{vehicle.powertrain?.engine_type || '—'}</td>
                </tr>
                {vehicle.powertrain?.displacement_l !== undefined && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Displacement</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-mono font-bold">
                      {vehicle.powertrain.displacement_l.toFixed(1)} Litres
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Layout</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.layout || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Aspiration</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.aspiration || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Output Power</td>
                  <td className="py-2.5 font-mono text-[#177f8d] dark:text-[#31bacc] font-bold">
                    {hp} HP ({kw} kW)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Torque</td>
                  <td className="py-2.5 font-mono text-slate-900 dark:text-white font-bold">
                    {torqueNm} Nm
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Transmission</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.transmission || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Drivetrain</td>
                  <td className="py-2.5 font-mono text-[#177f8d] dark:text-[#31bacc] font-black">
                    {vehicle.powertrain?.drivetrain || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Fuel / Energy</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.fuel_type || '—'}</td>
                </tr>
                {vehicle.powertrain?.redline_rpm && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Max RPM</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {vehicle.powertrain.redline_rpm.toLocaleString()} RPM
                    </td>
                  </tr>
                )}
                {vehicle.powertrain?.battery_kwh && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Traction Battery</td>
                    <td className="py-2.5 font-mono text-[#177f8d] dark:text-[#31bacc] font-bold">
                      {vehicle.powertrain.battery_kwh} kWh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 2. Chassis Specs */}
          <div className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <Weight className="w-4 h-4 text-emerald-500" />
              <h2 className="uppercase font-mono tracking-wider text-xs">Chassis & Dimensions</h2>
            </div>

            <table className="w-full text-xs font-sans">
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono w-1/3">Curb Weight</td>
                  <td className="py-2.5 font-mono text-slate-900 dark:text-white font-bold">
                    {weightKg.toLocaleString()} kg
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400 font-mono">Construction</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis?.chassis_type || '—'}</td>
                </tr>
                {(vehicle.chassis?.length_mm || vehicle.chassis?.width_mm || vehicle.chassis?.height_mm) && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Dimensions</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {vehicle.chassis?.length_mm || '—'} × {vehicle.chassis?.width_mm || '—'} × {vehicle.chassis?.height_mm || '—'} mm
                    </td>
                  </tr>
                )}
                {vehicle.chassis?.wheelbase_mm && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Wheelbase</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {vehicle.chassis.wheelbase_mm} mm
                    </td>
                  </tr>
                )}
                {vehicle.chassis?.suspension_front && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Front Suspension</td>
                    <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis.suspension_front}</td>
                  </tr>
                )}
                {vehicle.chassis?.brakes_front && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Brakes</td>
                    <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis.brakes_front}</td>
                  </tr>
                )}
                {vehicle.chassis?.wheels_tires && (
                  <tr>
                    <td className="py-2.5 text-slate-400 font-mono">Wheels & Tires</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-mono text-[11px]">{vehicle.chassis.wheels_tires}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Community Reviews & Discussion Section */}
        <div id="comments" className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1E293B]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#31bacc]/15 flex items-center justify-center text-[#177f8d] dark:text-[#31bacc]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Community Discussions & Feedback
                </h3>
                <p className="text-xs text-slate-400">
                  {comments.length} verified review{comments.length === 1 ? '' : 's'} & thoughts
                </p>
              </div>
            </div>
          </div>

          {/* Comment Form Gate: Requires Secret Key Login */}
          {user ? (
            <form onSubmit={handlePostComment} className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#31bacc]/20 text-[#177f8d] dark:text-[#31bacc] flex items-center justify-center font-bold text-xs">
                    {user.handle.charAt(1)?.toUpperCase() || 'U'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Posting as {user.handle}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Authenticated</span>
                </span>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share driving impressions, lap times, or technical commentary..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#31bacc] resize-none"
                />
              </div>

              {commentError && (
                <p className="text-xs text-rose-500">{commentError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postingComment || !newComment.trim()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-black text-white hover:bg-slate-800 dark:hover:bg-[#151D2E] text-xs font-bold transition-all disabled:opacity-40 border border-slate-700 dark:border-[#31bacc]/30"
                >
                  <Send className="w-3.5 h-3.5 text-[#31bacc]" />
                  <span>{postingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#31bacc]/15 text-[#177f8d] dark:text-[#31bacc] flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Secret Key ID Required to Comment
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Please sign in with your Secret Key ID to join the discussions and post technical notes.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('login', 'Sign in with your Secret Key ID to leave a comment.')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs inline-flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#31bacc]" />
                <span>Sign In with Secret Key ID</span>
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {comments.length > 0 ? (
              comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-[#1E293B] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white font-mono flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#31bacc]/20 text-[#177f8d] dark:text-[#31bacc] flex items-center justify-center text-[10px] font-black">
                        {cmt.author_name.charAt(1)?.toUpperCase() || cmt.author_name.charAt(0).toUpperCase()}
                      </span>
                      <span>{cmt.author_name}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(cmt.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans pl-6">
                    {cmt.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No comments yet. Sign in with your Secret Key ID to leave the first review!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
