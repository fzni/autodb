'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import VehicleCard from './VehicleCard';
import { useAuth } from './AuthContext';
import {
  Search,
  ArrowUpDown,
  Car,
  Truck,
  Trophy,
  Sparkles,
  Layers,
  Flame,
  Plus,
  ArrowUp,
} from 'lucide-react';

interface HomeExplorerClientProps {
  initialVehicles: Vehicle[];
}

const DOMAINS = [
  { label: 'All', value: 'All', icon: Layers },
  { label: 'Road', value: 'Road', icon: Car },
  { label: 'Commercial', value: 'Commercial', icon: Truck },
  { label: 'Motorsport', value: 'Motorsport', icon: Trophy },
  { label: 'Concept', value: 'Concept', icon: Sparkles },
];

const DRIVETRAINS = ['All', 'RWD', 'AWD', 'FWD', '4WD', '6x4'];

const SORTS = [
  { label: 'Most Voted 🔥', value: 'most_voted' },
  { label: 'Newest Year', value: 'newest' },
  { label: 'Highest Output (HP)', value: 'highest_hp' },
  { label: 'Lightest Curb Weight', value: 'lightest' },
  { label: 'Power-to-Weight (HP/Ton)', value: 'best_hp_ton' },
];

export default function HomeExplorerClient({ initialVehicles }: HomeExplorerClientProps) {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedDrivetrain, setSelectedDrivetrain] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('most_voted');

  // Compute live domain counts
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: initialVehicles.length,
      Road: 0,
      Commercial: 0,
      Motorsport: 0,
      Concept: 0,
    };
    for (const v of initialVehicles) {
      if (counts[v.domain] !== undefined) {
        counts[v.domain]++;
      }
    }
    return counts;
  }, [initialVehicles]);

  // Aggregate stats
  const stats = useMemo(() => {
    let maxHp = 0;
    let totalVotes = 0;
    let bestRatio = 0;

    for (const v of initialVehicles) {
      const hp = v.powertrain?.hp || 0;
      const weight = v.chassis?.curb_weight_kg || 0;
      totalVotes += v.votes_count || 0;

      if (hp > maxHp) maxHp = hp;
      if (weight > 0) {
        const ratio = hp / (weight / 1000);
        if (ratio > bestRatio) bestRatio = ratio;
      }
    }

    return {
      totalVehicles: initialVehicles.length,
      maxHp,
      bestRatio: bestRatio.toFixed(1),
      totalVotes,
    };
  }, [initialVehicles]);

  // Filter & Sort
  const filteredVehicles = useMemo(() => {
    let result = [...initialVehicles];

    // Domain filter
    if (selectedDomain !== 'All') {
      result = result.filter((v) => v.domain === selectedDomain);
    }

    // Drivetrain filter
    if (selectedDrivetrain !== 'All') {
      result = result.filter(
        (v) => v.powertrain?.drivetrain?.toUpperCase() === selectedDrivetrain.toUpperCase()
      );
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.generation.toLowerCase().includes(q) ||
          v.summary.toLowerCase().includes(q) ||
          v.sub_category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (selectedSort) {
      case 'most_voted':
        result.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
        break;
      case 'highest_hp':
        result.sort((a, b) => (b.powertrain?.hp || 0) - (a.powertrain?.hp || 0));
        break;
      case 'lightest':
        result.sort((a, b) => {
          const wA = a.chassis?.curb_weight_kg || 999999;
          const wB = b.chassis?.curb_weight_kg || 999999;
          return wA - wB;
        });
        break;
      case 'best_hp_ton':
        result.sort((a, b) => {
          const rA = a.chassis?.curb_weight_kg ? (a.powertrain?.hp || 0) / (a.chassis.curb_weight_kg / 1000) : 0;
          const rB = b.chassis?.curb_weight_kg ? (b.powertrain?.hp || 0) / (b.chassis.curb_weight_kg / 1000) : 0;
          return rB - rA;
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.year - a.year);
        break;
    }

    return result;
  }, [initialVehicles, selectedDomain, selectedDrivetrain, selectedSort, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Every machine, every spec.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Road cars, commercial trucks, and motorsport prototypes — compared side by side.
        </p>

        {/* Stats strip — magazine masthead style */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.totalVehicles}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">vehicles</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.totalVotes}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">upvotes</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-2xl font-black text-[#177f8d] dark:text-[#31bacc] tabular-nums">
              {stats.maxHp}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">peak HP</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-2xl font-black text-[#177f8d] dark:text-[#31bacc] tabular-nums">
              {stats.bestRatio}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">HP/ton</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-[#101623] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#1E293B] shadow-xs mb-8 space-y-4">
        {/* Search + dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars, trucks, motorsport..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#31bacc] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Drivetrain Selector */}
          <div className="sm:w-44">
            <select
              value={selectedDrivetrain}
              onChange={(e) => setSelectedDrivetrain(e.target.value)}
              aria-label="Filter by drivetrain"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
            >
              <option value="All">Drivetrain: All</option>
              {DRIVETRAINS.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:w-56">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort vehicles"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain pill tabs — YouTube style */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {DOMAINS.map((domain) => {
            const count = domainCounts[domain.value] || 0;
            const isActive = selectedDomain === domain.value;

            return (
              <button
                key={domain.value}
                onClick={() => setSelectedDomain(domain.value)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#263148]'
                }`}
              >
                <span>{domain.label}</span>
                <span
                  className={`text-xs ${
                    isActive
                      ? 'text-white/70 dark:text-black/60'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      {(searchQuery || selectedDomain !== 'All' || selectedDrivetrain !== 'All') && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Showing {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
        </p>
      )}

      {/* Fleet Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#0A0E17] flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No vehicles match your criteria
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, changing the domain filter, or resetting your filter controls.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('All');
              setSelectedDrivetrain('All');
              setSelectedSort('most_voted');
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#0A0E17] hover:bg-slate-200 border border-slate-200 dark:border-[#1E293B] transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
