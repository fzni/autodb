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
  Share2,
  CheckCircle2,
  Lock,
  Gauge,
  Sliders,
  ShieldAlert,
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
      openAuthModal('login', `Sign in with your secret key to upvote the ${vehicle.make} ${vehicle.model}.`);
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
    } catch {
      setHasVoted(previousVoted);
      setVotesCount(previousCount);
    } finally {
      setVoting(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Sign in with your secret key to leave a comment.');
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
      alert('Only administrators can delete vehicles.');
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

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" fill="%23f1f5f9"><rect width="1200" height="600" fill="%23f1f5f9"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="32" fill="%230f172a">${vehicle.make} ${vehicle.model}</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748B">${vehicle.generation} · ${vehicle.year}</text></svg>`;

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Road':
        return <Car className="w-3.5 h-3.5 text-[#31bacc]" />;
      case 'Commercial':
        return <Truck className="w-3.5 h-3.5 text-amber-500" />;
      case 'Motorsport':
        return <Trophy className="w-3.5 h-3.5 text-rose-500" />;
      case 'Concept':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar Navigation */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#0A0E17]/70 backdrop-blur-md sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Vehicles</span>
          </Link>

          <div className="flex items-center space-x-2">
            {/* Share */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101623] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
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
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inCompare
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-[#101623] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
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
                  <span>Compare</span>
                </>
              )}
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href={`/studio?edit=${vehicle.slug}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#31bacc] text-black text-xs font-bold hover:bg-[#28a5b8] transition-colors"
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

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title, Badge & Primary Like Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
          <div className="space-y-2">
            {/* Breadcrumb line */}
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium">
                {getDomainIcon(vehicle.domain)}
                <span>{vehicle.domain}</span>
              </span>
              <span>•</span>
              <span>{vehicle.sub_category}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{vehicle.year}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-sm text-slate-500">
              Generation: <span className="font-medium text-slate-800 dark:text-slate-200">{vehicle.generation}</span>
            </p>
          </div>

          {/* Social Upvote CTA */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleVote}
              title={
                !user
                  ? 'Sign in to upvote'
                  : hasVoted
                  ? 'Remove upvote'
                  : 'Upvote this vehicle'
              }
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                hasVoted
                  ? 'bg-[#31bacc] text-black shadow-md font-bold'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'
              }`}
            >
              <ArrowUp className={`w-4 h-4 ${hasVoted ? 'stroke-[3]' : ''}`} />
              <span>{hasVoted ? 'Upvoted' : 'Upvote'}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/15 dark:bg-white/20 text-xs font-mono font-bold">
                {votesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Hero Image Showcase */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0A0E17] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <img
            src={imgError ? fallbackSvg : vehicle.hero_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Clean Telemetry Numbers Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-400 font-medium">Power</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {hp} <span className="text-xs text-slate-400 font-normal">HP</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-400 font-medium">Output</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {kw} <span className="text-xs text-slate-400 font-normal">kW</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-400 font-medium">Torque</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {torqueNm} <span className="text-xs text-slate-400 font-normal">Nm</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-400 font-medium">Curb weight</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {weightKg >= 10000 ? `${(weightKg / 1000).toFixed(0)}t` : `${weightKg.toLocaleString()} kg`}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-[#31bacc]/10 border border-[#31bacc]/25 text-center">
            <span className="block text-xs text-[#177f8d] dark:text-[#31bacc] font-semibold">Power-to-weight</span>
            <span className="text-2xl font-black font-mono text-[#177f8d] dark:text-[#31bacc]">
              {hpPerTon} <span className="text-xs font-normal">HP/t</span>
            </span>
          </div>
        </div>

        {/* Overview Description */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            About this vehicle
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {vehicle.summary}
          </p>
        </div>

        {/* Detailed Spec Tables (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Powertrain Specs */}
          <div className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Zap className="w-4 h-4 text-[#31bacc]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Powertrain & Architecture</h3>
            </div>

            <table className="w-full text-xs font-sans">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-2.5 text-slate-500 w-1/3">Engine / Motor</td>
                  <td className="py-2.5 text-slate-900 dark:text-white font-medium">{vehicle.powertrain?.engine_type || '—'}</td>
                </tr>
                {vehicle.powertrain?.displacement_l !== undefined && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Displacement</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-mono">
                      {vehicle.powertrain.displacement_l.toFixed(1)} L
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 text-slate-500">Layout</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.layout || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Aspiration</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.aspiration || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Output</td>
                  <td className="py-2.5 font-mono text-[#177f8d] dark:text-[#31bacc] font-bold">
                    {hp} HP ({kw} kW)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Torque</td>
                  <td className="py-2.5 font-mono text-slate-900 dark:text-white font-semibold">
                    {torqueNm} Nm
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Transmission</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.transmission || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Drivetrain</td>
                  <td className="py-2.5 font-mono text-[#177f8d] dark:text-[#31bacc] font-bold">
                    {vehicle.powertrain?.drivetrain || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Fuel type</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.fuel_type || '—'}</td>
                </tr>
                {vehicle.powertrain?.redline_rpm && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Redline</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {vehicle.powertrain.redline_rpm.toLocaleString()} RPM
                    </td>
                  </tr>
                )}
                {vehicle.powertrain?.battery_kwh && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Traction battery</td>
                    <td className="py-2.5 font-mono text-[#177f8d] dark:text-[#31bacc] font-bold">
                      {vehicle.powertrain.battery_kwh} kWh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 2. Chassis Specs */}
          <div className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Weight className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chassis & Dimensions</h3>
            </div>

            <table className="w-full text-xs font-sans">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-2.5 text-slate-500 w-1/3">Curb weight</td>
                  <td className="py-2.5 font-mono text-slate-900 dark:text-white font-semibold">
                    {weightKg.toLocaleString()} kg
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Construction</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis?.chassis_type || '—'}</td>
                </tr>
                {(vehicle.chassis?.length_mm || vehicle.chassis?.width_mm || vehicle.chassis?.height_mm) && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Dimensions (L×W×H)</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {vehicle.chassis?.length_mm || '—'} × {vehicle.chassis?.width_mm || '—'} × {vehicle.chassis?.height_mm || '—'} mm
                    </td>
                  </tr>
                )}
                {vehicle.chassis?.wheelbase_mm && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Wheelbase</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {vehicle.chassis.wheelbase_mm} mm
                    </td>
                  </tr>
                )}
                {vehicle.chassis?.suspension_front && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Suspension (front)</td>
                    <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis.suspension_front}</td>
                  </tr>
                )}
                {vehicle.chassis?.suspension_rear && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Suspension (rear)</td>
                    <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis.suspension_rear}</td>
                  </tr>
                )}
                {vehicle.chassis?.brakes_front && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Brakes</td>
                    <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.chassis.brakes_front}</td>
                  </tr>
                )}
                {vehicle.chassis?.wheels_tires && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Wheels & tires</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-mono text-[11px]">{vehicle.chassis.wheels_tires}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Category-Specific Specs (Road, Motorsport, Commercial) */}
        {vehicle.domain_specific && Object.keys(vehicle.domain_specific).length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {vehicle.domain} Domain Specifics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {vehicle.domain_specific.zero_to_hundred_sec !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">0–100 km/h</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {vehicle.domain_specific.zero_to_hundred_sec} s
                  </span>
                </div>
              )}

              {vehicle.domain_specific.top_speed_kmh !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Top speed</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {vehicle.domain_specific.top_speed_kmh} km/h
                  </span>
                </div>
              )}

              {vehicle.domain_specific.drag_coefficient !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Drag coefficient (Cd)</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {vehicle.domain_specific.drag_coefficient}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.payload_capacity_kg !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Payload capacity</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {vehicle.domain_specific.payload_capacity_kg.toLocaleString()} kg
                  </span>
                </div>
              )}

              {vehicle.domain_specific.towing_capacity_kg !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Towing capacity</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {vehicle.domain_specific.towing_capacity_kg.toLocaleString()} kg
                  </span>
                </div>
              )}

              {vehicle.domain_specific.aero_downforce_kg !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Aerodynamic downforce</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {vehicle.domain_specific.aero_downforce_kg.toLocaleString()} kg
                  </span>
                </div>
              )}

              {vehicle.domain_specific.regulation_category && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Regulation</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {vehicle.domain_specific.regulation_category}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.status && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Production status</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {vehicle.domain_specific.status}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.signature_feature && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 mb-0.5">Signature feature</span>
                  <span className="text-xs text-slate-800 dark:text-slate-200">
                    {vehicle.domain_specific.signature_feature}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Social Discussion & Comments Section */}
        <div id="comments" className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#31bacc]/15 flex items-center justify-center text-[#177f8d] dark:text-[#31bacc]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Discussion
                </h3>
                <p className="text-xs text-slate-500">
                  {comments.length} comment{comments.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>

          {/* Comment Form: Logged In vs Logged Out */}
          {user ? (
            <form onSubmit={handlePostComment} className="space-y-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-[11px]">
                  {user.handle.replace('@', '').charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {user.handle}
                </span>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your driving impressions, lap times, or thoughts on this machine..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#31bacc] resize-none"
                />
              </div>

              {commentError && (
                <p className="text-xs text-rose-500">{commentError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postingComment || !newComment.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition-all disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingComment ? 'Posting...' : 'Comment'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200/70 dark:border-slate-800/80 text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Sign in with your secret key to join the conversation and leave a review.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('login', 'Sign in with your secret key to leave a comment.')}
                className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition-all shadow-xs inline-flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in to comment</span>
              </button>
            </div>
          )}

          {/* Comments List (YouTube/IG/FB style) */}
          <div className="space-y-4 pt-2">
            {comments.length > 0 ? (
              comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="flex items-start space-x-3 text-xs"
                >
                  {/* User Avatar Initial */}
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {cmt.author_name.replace('@', '').charAt(0).toUpperCase()}
                  </div>

                  {/* Comment Bubble */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {cmt.author_name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(cmt.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {cmt.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
