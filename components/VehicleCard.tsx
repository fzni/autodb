'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import { useCompare } from './CompareContext';
import { useAuth } from './AuthContext';
import { Columns, Check, MessageSquare, ArrowUp, Lock } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { toggleCompare, isInCompare } = useCompare();
  const { user, openAuthModal } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [votesCount, setVotesCount] = useState(vehicle.votes_count || 0);
  const [hasVoted, setHasVoted] = useState(vehicle.has_voted || false);
  const [voting, setVoting] = useState(false);

  const inCompare = isInCompare(vehicle.slug);

  // Guard against zero / null
  const hp = vehicle.powertrain?.hp || 0;
  const weightKg = vehicle.chassis?.curb_weight_kg || 0;
  const hpPerTon = weightKg > 0 ? (hp / (weightKg / 1000)).toFixed(1) : '—';
  const drivetrain = vehicle.powertrain?.drivetrain || null;

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      openAuthModal('login', `Please sign in with your Secret Key ID to upvote the ${vehicle.make} ${vehicle.model}.`);
      return;
    }

    if (voting) return;

    // Optimistic UI update
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

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'Road':
        return 'bg-[#31bacc]/10 border-[#31bacc]/30 text-[#177f8d] dark:text-[#31bacc]';
      case 'Commercial':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400';
      case 'Motorsport':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400';
      case 'Concept':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-400';
    }
  };

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f1f5f9"><rect width="600" height="400" fill="%23f1f5f9"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="%230f172a">${vehicle.make} ${vehicle.model}</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%2364748B">${vehicle.generation} · ${vehicle.year}</text></svg>`;

  return (
    <div className="group rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image — 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-[#0A0E17]">
        <Link href={`/vehicles/${vehicle.slug}`} className="block w-full h-full">
          <img
            src={imgError ? fallbackSvg : vehicle.hero_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top badges — subtle */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border backdrop-blur-sm ${getDomainBadge(vehicle.domain)}`}
          >
            {vehicle.domain}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
            {vehicle.year}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/vehicles/${vehicle.slug}`} className="block flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white hover:text-[#31bacc] transition-colors line-clamp-1">
              {vehicle.make} {vehicle.model}
            </h3>
          </Link>
          {/* HP/Ton accent pill */}
          {hpPerTon !== '—' && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#31bacc]/10 text-[#177f8d] dark:text-[#31bacc] border border-[#31bacc]/20">
              {hpPerTon} HP/t
            </span>
          )}
        </div>

        {/* Sub-category */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {vehicle.sub_category}
        </p>

        {/* Stat row — YouTube style bullet separators */}
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1 mb-3">
          {hp > 0 && <span className="font-medium text-slate-700 dark:text-slate-300">{hp} HP</span>}
          {hp > 0 && weightKg > 0 && <span>·</span>}
          {weightKg > 0 && (
            <span>
              {weightKg >= 10000 ? `${(weightKg / 1000).toFixed(0)}t` : `${weightKg} kg`}
            </span>
          )}
          {drivetrain && (hp > 0 || weightKg > 0) && <span>·</span>}
          {drivetrain && <span>{drivetrain}</span>}
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-auto">
          {vehicle.summary}
        </p>

        {/* Card footer row */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
          {/* Vote + comments */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVote}
              title={
                !user
                  ? 'Sign in to upvote'
                  : hasVoted
                  ? 'Remove upvote'
                  : 'Upvote this vehicle'
              }
              className={`flex items-center space-x-1 text-sm transition-colors ${
                hasVoted
                  ? 'text-[#31bacc] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <ArrowUp className={`w-4 h-4 ${hasVoted ? 'stroke-[2.5]' : ''}`} />
              <span>{votesCount}</span>
            </button>

            <Link
              href={`/vehicles/${vehicle.slug}#comments`}
              className="flex items-center space-x-1 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{vehicle.comments_count || 0}</span>
            </Link>
          </div>

          {/* Compare button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(vehicle);
            }}
            className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              inCompare
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {inCompare ? (
              <>
                <Check className="w-3 h-3 text-[#31bacc]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Columns className="w-3 h-3" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
