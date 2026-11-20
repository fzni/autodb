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
    <div className="group relative rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] hover:border-[#31bacc]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-[#0A0E17]">
        <Link href={`/vehicles/${vehicle.slug}`} className="block w-full h-full">
          <img
            src={imgError ? fallbackSvg : vehicle.hero_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border backdrop-blur-md ${getDomainBadge(
              vehicle.domain
            )}`}
          >
            {vehicle.domain}
          </span>

          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-900/85 text-white backdrop-blur-md shadow-xs">
            {vehicle.year}
          </span>
        </div>

        {/* Action Pills overlay bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
          {/* Voting Button for Users */}
          <button
            onClick={handleVote}
            title={
              !user
                ? 'Sign in with Secret Key ID to upvote'
                : hasVoted
                ? 'Remove upvote'
                : 'Upvote this vehicle'
            }
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold backdrop-blur-md transition-all ${
              hasVoted
                ? 'bg-[#31bacc] text-black shadow-xs font-black'
                : 'bg-slate-900/80 hover:bg-slate-900 text-white hover:text-[#31bacc]'
            }`}
          >
            <ArrowUp className={`w-3.5 h-3.5 ${hasVoted ? 'stroke-[3]' : ''}`} />
            <span>{votesCount}</span>
          </button>

          {/* Quick Compare Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(vehicle);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold backdrop-blur-md transition-all ${
              inCompare
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black border border-slate-700'
                : 'bg-white/90 hover:bg-white text-slate-800 dark:bg-black/80 dark:text-slate-200 dark:hover:text-[#31bacc] border border-slate-200/80 dark:border-[#1E293B]'
            }`}
          >
            {inCompare ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#31bacc]" />
                <span>COMPARE</span>
              </>
            ) : (
              <>
                <Columns className="w-3 h-3 text-slate-500" />
                <span>+ COMPARE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <span>{vehicle.sub_category}</span>
            <span className="text-[#31bacc] font-semibold">{vehicle.powertrain?.drivetrain}</span>
          </div>

          <Link href={`/vehicles/${vehicle.slug}`} className="block group/link mb-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover/link:text-[#31bacc] transition-colors line-clamp-1">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {vehicle.generation}
            </p>
          </Link>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {vehicle.summary}
          </p>
        </div>

        {/* Telemetry Metrics Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B]/70">
          <div className="grid grid-cols-3 gap-2 text-center items-center">
            {/* HP */}
            <div className="bg-slate-50 dark:bg-[#0A0E17] p-2 rounded-xl border border-slate-100 dark:border-[#1E293B]">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">POWER</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {hp > 0 ? `${hp} HP` : '—'}
              </span>
            </div>

            {/* Weight */}
            <div className="bg-slate-50 dark:bg-[#0A0E17] p-2 rounded-xl border border-slate-100 dark:border-[#1E293B]">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">WEIGHT</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {weightKg > 0 ? (weightKg >= 10000 ? `${(weightKg / 1000).toFixed(0)}t` : `${weightKg}kg`) : '—'}
              </span>
            </div>

            {/* Power-to-weight Ratio Badge */}
            <div className="bg-[#31bacc]/10 dark:bg-[#31bacc]/15 p-2 rounded-xl border border-[#31bacc]/30">
              <span className="block text-[9px] text-[#177f8d] dark:text-[#31bacc] font-black uppercase font-mono">HP/TON</span>
              <span className="font-mono text-xs font-black text-[#177f8d] dark:text-[#31bacc]">
                {hpPerTon}
              </span>
            </div>
          </div>

          {/* Bottom comments counter */}
          <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <Link
              href={`/vehicles/${vehicle.slug}#comments`}
              className="flex items-center space-x-1 hover:text-[#31bacc] transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{vehicle.comments_count || 0} comments</span>
            </Link>
            <Link
              href={`/vehicles/${vehicle.slug}`}
              className="text-[#31bacc] hover:underline font-semibold"
            >
              Specs &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
