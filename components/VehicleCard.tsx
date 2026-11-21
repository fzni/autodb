'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import { useCompare } from './CompareContext';
import { useAuth } from './AuthContext';
import { useUnits } from './UnitContext';
import { convertPower, convertWeight } from '@/lib/units';
import { Columns, Check, MessageSquare, ArrowUp } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { toggleCompare, isInCompare } = useCompare();
  const { user, openAuthModal } = useAuth();
  const { unitSystem } = useUnits();
  const [imgError, setImgError] = useState(false);
  const [votesCount, setVotesCount] = useState(vehicle.votes_count || 0);
  const [hasVoted, setHasVoted] = useState(vehicle.has_voted || false);
  const [voting, setVoting] = useState(false);

  const inCompare = isInCompare(vehicle.slug);

  const hp = vehicle.powertrain?.hp || 0;
  const kw = vehicle.powertrain?.kw || 0;
  const weightKg = vehicle.chassis?.curb_weight_kg || 0;
  const hpPerTon = weightKg > 0 ? (hp / (weightKg / 1000)).toFixed(1) : null;
  const drivetrain = vehicle.powertrain?.drivetrain || null;
  const layout = vehicle.powertrain?.layout || null;

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal('login', `Sign in to upvote the ${vehicle.make} ${vehicle.model}.`);
      return;
    }
    if (voting) return;
    const prevVoted = hasVoted;
    const prevCount = votesCount;
    const nextVoted = !prevVoted;
    setHasVoted(nextVoted);
    setVotesCount(nextVoted ? prevCount + 1 : Math.max(0, prevCount - 1));
    setVoting(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.slug}/vote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setVotesCount(data.count);
        setHasVoted(data.voted);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.requiresAuth) openAuthModal('login', data.error);
        setHasVoted(prevVoted);
        setVotesCount(prevCount);
      }
    } catch {
      setHasVoted(prevVoted);
      setVotesCount(prevCount);
    } finally {
      setVoting(false);
    }
  };

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'Road':       return 'bg-[#E11D48]/10 border-[#E11D48]/30 text-[#BE123C] dark:text-[#E11D48]';
      case 'Commercial': return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400';
      case 'Motorsport': return 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400';
      case 'Concept':    return 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400';
      default:           return 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-400';
    }
  };

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="%230f172a">${vehicle.make} ${vehicle.model}</text><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="13" fill="%2364748B">${vehicle.generation} &middot; ${vehicle.year}</text></svg>`;

  return (
    <div className="card-lift group rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] hover:border-slate-300 dark:hover:border-slate-600 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-[#0B1220]">
        <Link href={`/vehicles/${vehicle.slug}`} className="block w-full h-full">
          <img
            src={imgError ? fallbackSvg : vehicle.hero_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border backdrop-blur-sm ${getDomainBadge(vehicle.domain)}`}>
            {vehicle.domain}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
            {vehicle.year}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/vehicles/${vehicle.slug}`} className="block flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white hover:text-[#E11D48] transition-colors line-clamp-1">
              {vehicle.make} {vehicle.model}
            </h3>
          </Link>
          {hpPerTon && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E11D48]/10 text-[#BE123C] dark:text-[#E11D48] border border-[#E11D48]/20">
              {hpPerTon} HP/t
            </span>
          )}
        </div>

        {/* Sub-category */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {vehicle.sub_category}
        </p>

        {/* Stats */}
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1.5 mb-2 font-mono">
          {hp > 0 && (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {convertPower(hp, kw, unitSystem).label}
            </span>
          )}
          {hp > 0 && weightKg > 0 && <span>&middot;</span>}
          {weightKg > 0 && <span>{convertWeight(weightKg, unitSystem).label}</span>}
          {drivetrain && (hp > 0 || weightKg > 0) && <span>&middot;</span>}
          {drivetrain && (
            <Link
              href={`/?query=${encodeURIComponent(drivetrain)}`}
              className="hover:text-[#E11D48] font-semibold transition-colors"
            >
              {drivetrain}
            </Link>
          )}
        </div>

        {/* Layout pill */}
        {layout && (
          <div className="mb-2.5">
            <Link
              href={`/?layout=${encodeURIComponent(layout)}`}
              className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-[#0B1220] text-slate-600 dark:text-slate-400 hover:text-[#E11D48] border border-slate-200/80 dark:border-[#1A2435] transition-all"
            >
              {layout}
            </Link>
          </div>
        )}

        {/* Summary */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-auto">
          {vehicle.summary}
        </p>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1A2435] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVote}
              title={!user ? 'Sign in to upvote' : hasVoted ? 'Remove upvote' : 'Upvote'}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                hasVoted
                  ? 'text-[#E11D48] font-semibold'
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

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(vehicle); }}
            className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              inCompare
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-[#1A2435] hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {inCompare ? (
              <><Check className="w-3 h-3 text-[#E11D48]" /><span>Added</span></>
            ) : (
              <><Columns className="w-3 h-3" /><span>Compare</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
