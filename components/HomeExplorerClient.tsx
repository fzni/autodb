'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Vehicle } from '@/lib/types';
import VehicleCard from './VehicleCard';
import { useAuth } from './AuthContext';
import { useCompare } from './CompareContext';
import { useUnits } from './UnitContext';
import { convertPower, convertWeight, convertSpeed } from '@/lib/units';
import {
  Search,
  Car,
  Truck,
  Trophy,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  LayoutGrid,
  Table as TableIcon,
  X,
  SlidersHorizontal,
  Compass,
  ArrowUp,
  Star,
} from 'lucide-react';

interface HomeExplorerClientProps {
  initialVehicles: Vehicle[];
}

const DOMAINS = [
  { label: 'All Machines', value: 'All', icon: Layers },
  { label: 'Road', value: 'Road', icon: Car },
  { label: 'Motorsport', value: 'Motorsport', icon: Trophy },
  { label: 'Commercial', value: 'Commercial', icon: Truck },
  { label: 'Concept', value: 'Concept', icon: Sparkles },
];

const DRIVETRAINS = ['All', 'RWD', 'AWD', 'FWD', '4WD', '6x4'];

const SORTS = [
  { label: 'Most Voted', value: 'most_voted' },
  { label: 'Newest Year', value: 'newest' },
  { label: 'Highest Output (HP)', value: 'highest_hp' },
  { label: 'Lightest Curb Weight', value: 'lightest' },
  { label: 'Power-to-Weight (HP/t)', value: 'best_hp_ton' },
];

const PRESETS = [
  { id: 'all', label: 'All Fleet' },
  { id: 'top_tier', label: '500+ HP' },
  { id: 'featherweight', label: 'Sub-1,300 kg' },
  { id: 'track_aero', label: 'Track Aero' },
  { id: 'nat_asp', label: 'Naturally Aspirated' },
  { id: 'turbo', label: 'Twin-Turbo' },
  { id: 'manual', label: 'Gated Manual' },
];

export default function HomeExplorerClient({ initialVehicles }: HomeExplorerClientProps) {
  const searchParams = useSearchParams();
  const { toggleCompare, isInCompare } = useCompare();
  const { unitSystem } = useUnits();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedDrivetrain, setSelectedDrivetrain] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('most_voted');
  const [selectedPreset, setSelectedPreset] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Hero Slideshow State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Top 5 Most Rated Vehicles for Slideshow
  const slideshowVehicles = useMemo(() => {
    if (!initialVehicles || initialVehicles.length === 0) return [];
    return [...initialVehicles]
      .sort((a, b) => {
        const diff = (b.votes_count || 0) - (a.votes_count || 0);
        if (diff !== 0) return diff;
        const yearDiff = (b.year || 0) - (a.year || 0);
        if (yearDiff !== 0) return yearDiff;
        return (b.powertrain?.hp || 0) - (a.powertrain?.hp || 0);
      })
      .slice(0, 5);
  }, [initialVehicles]);

  // Slideshow Auto-Advance (Every 6s, pauses on hover / touch)
  useEffect(() => {
    if (slideshowVehicles.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideshowVehicles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideshowVehicles.length, isPaused]);

  // Mobile Touch Swipe Handlers for Slideshow
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;
    if (isLeftSwipe) {
      setActiveSlide((prev) => (prev + 1) % slideshowVehicles.length);
    } else if (isRightSwipe) {
      setActiveSlide((prev) => (prev - 1 + slideshowVehicles.length) % slideshowVehicles.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    const q =
      searchParams.get('query') ||
      searchParams.get('q') ||
      searchParams.get('make') ||
      searchParams.get('layout');
    if (q) {
      setSearchQuery(q);
    }
    const dom = searchParams.get('domain');
    if (dom) {
      setSelectedDomain(dom);
    }
  }, [searchParams]);

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

    // Preset filter
    if (selectedPreset !== 'all') {
      if (selectedPreset === 'top_tier') {
        result = result.filter((v) => (v.powertrain?.hp || 0) >= 500);
      } else if (selectedPreset === 'featherweight') {
        result = result.filter(
          (v) => (v.chassis?.curb_weight_kg || 0) > 0 && (v.chassis?.curb_weight_kg || 0) <= 1300
        );
      } else if (selectedPreset === 'track_aero') {
        result = result.filter(
          (v) => (v.downforce_kg || v.domain_specific?.aero_downforce_kg || 0) > 0
        );
      } else if (selectedPreset === 'nat_asp') {
        result = result.filter(
          (v) =>
            v.powertrain?.aspiration?.toLowerCase().includes('naturally') ||
            v.powertrain?.aspiration?.toLowerCase().includes('na')
        );
      } else if (selectedPreset === 'turbo') {
        result = result.filter((v) =>
          v.powertrain?.aspiration?.toLowerCase().includes('turbo')
        );
      } else if (selectedPreset === 'manual') {
        result = result.filter((v) =>
          v.powertrain?.transmission?.toLowerCase().includes('manual')
        );
      }
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
          v.sub_category.toLowerCase().includes(q) ||
          (v.powertrain?.layout && v.powertrain.layout.toLowerCase().includes(q)) ||
          (v.powertrain?.engine_type && v.powertrain.engine_type.toLowerCase().includes(q)) ||
          (v.powertrain?.drivetrain && v.powertrain.drivetrain.toLowerCase().includes(q))
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
          const rA = a.chassis?.curb_weight_kg
            ? (a.powertrain?.hp || 0) / (a.chassis.curb_weight_kg / 1000)
            : 0;
          const rB = b.chassis?.curb_weight_kg
            ? (b.powertrain?.hp || 0) / (b.chassis.curb_weight_kg / 1000)
            : 0;
          return rB - rA;
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.year - a.year);
        break;
    }

    return result;
  }, [
    initialVehicles,
    selectedDomain,
    selectedDrivetrain,
    selectedPreset,
    selectedSort,
    searchQuery,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
    setSelectedDrivetrain('All');
    setSelectedPreset('all');
    setSelectedSort('most_voted');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedDomain !== 'All' ||
    selectedDrivetrain !== 'All' ||
    selectedPreset !== 'all' ||
    selectedSort !== 'most_voted';

  const currentVehicle = slideshowVehicles[activeSlide];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* 1. Top 5 Most Rated Vehicles Slideshow (Mobile Touch Enabled) */}
      {!searchQuery && selectedDomain === 'All' && slideshowVehicles.length > 0 && currentVehicle && (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-2xl overflow-hidden bg-[#0B1220] border border-slate-200/80 dark:border-[#1A2435] shadow-lg select-none"
        >
          {/* Slide Container: 4:3 on mobile for ample vertical space, 16:9 on tablet, 2.3:1 on desktop */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.4/1] min-h-[400px] sm:min-h-[380px] md:min-h-[420px] w-full overflow-hidden">
            <img
              key={currentVehicle.slug}
              src={currentVehicle.hero_image}
              alt={`${currentVehicle.make} ${currentVehicle.model}`}
              className="w-full h-full object-cover transition-opacity duration-700 ease-out"
            />
            {/* Multi-stage gradient overlay for high contrast on all screen sizes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/95 via-[#0B1220]/65 to-transparent sm:max-w-3xl" />

            {/* Slide Content Overlay */}
            <div className="absolute inset-0 p-4 sm:p-7 lg:p-9 flex flex-col justify-between z-10">
              {/* Header row: Top Rated Tag + Domain + Counter */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs font-mono flex-wrap">
                  {/* Top Rated Badge */}
                  <span className="px-2.5 py-0.5 rounded-md bg-[#E11D48]/25 border border-[#E11D48]/40 text-[#E11D48] font-bold backdrop-blur-md flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Top Rated #{activeSlide + 1}</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 dark:bg-black/60 border border-white/20 text-slate-200 font-medium backdrop-blur-md">
                    {currentVehicle.domain}
                  </span>

                  <span className="hidden xs:inline text-slate-400 font-medium">
                    {currentVehicle.year} · {currentVehicle.generation}
                  </span>
                </div>

                {/* Slide Counter */}
                <div className="text-xs font-mono text-slate-400 shrink-0 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                  <span className="text-white font-bold">{String(activeSlide + 1).padStart(2, '0')}</span>
                  <span className="mx-1">/</span>
                  <span>{String(slideshowVehicles.length).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Bottom row: Machine Details + Actions + Slide Nav */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                <div className="max-w-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-[#E11D48] uppercase tracking-wider font-bold">
                      {currentVehicle.make}
                    </span>
                    {(currentVehicle.votes_count || 0) > 0 && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                        <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                        <span>{currentVehicle.votes_count} upvotes</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {currentVehicle.model}
                  </h2>

                  {/* Clean Specs Line with Auto Unit Conversion */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 text-xs font-mono text-slate-300">
                    <span className="font-semibold text-white">
                      {convertPower(
                        currentVehicle.powertrain?.hp || 0,
                        currentVehicle.powertrain?.kw || 0,
                        unitSystem
                      ).label}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span>
                      {convertWeight(currentVehicle.chassis?.curb_weight_kg || 0, unitSystem).label}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[#E11D48] font-bold">
                      {currentVehicle.chassis?.curb_weight_kg
                        ? (
                            currentVehicle.powertrain?.hp /
                            (currentVehicle.chassis.curb_weight_kg / 1000)
                          ).toFixed(1)
                        : '—'}{' '}
                      HP/t
                    </span>
                    {currentVehicle.powertrain?.drivetrain && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span>{currentVehicle.powertrain.drivetrain}</span>
                      </>
                    )}
                  </div>

                  {/* Action buttons (Mobile-friendly tap targets) */}
                  <div className="flex items-center space-x-2.5 pt-2">
                    <Link
                      href={`/vehicles/${currentVehicle.slug}`}
                      className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#E11D48] text-black text-xs font-mono font-bold hover:bg-[#BE123C] active:scale-95 transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <span>View Specs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleCompare(currentVehicle)}
                      className={`px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono transition-all border cursor-pointer active:scale-95 ${
                        isInCompare(currentVehicle.slug)
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black/50 text-white border-white/20 hover:border-white/50 backdrop-blur-md'
                      }`}
                    >
                      {isInCompare(currentVehicle.slug) ? 'In Compare' : '+ Compare'}
                    </button>
                  </div>
                </div>

                {/* Slideshow Progress Dots & Arrow Nav */}
                <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto pt-1 sm:pt-0 border-t border-white/10 sm:border-0">
                  {/* Slide Indicators with Touch Areas */}
                  <div className="flex space-x-1.5 items-center py-1">
                    {slideshowVehicles.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        aria-label={`Go to top rated vehicle ${idx + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeSlide === idx ? 'w-6 bg-[#E11D48]' : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Left / Right Arrows (Mobile friendly 36-40px touch buttons) */}
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlide(
                          (prev) => (prev - 1 + slideshowVehicles.length) % slideshowVehicles.length
                        )
                      }
                      aria-label="Previous rated vehicle"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm active:scale-90"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev + 1) % slideshowVehicles.length)}
                      aria-label="Next rated vehicle"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Stats Overview Strip (Responsive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={resetAllFilters}
          className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] hover:border-slate-400 dark:hover:border-slate-600 shadow-xs text-left transition-all cursor-pointer"
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">
            Catalogued Fleet
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono mt-0.5">
            {stats.totalVehicles} <span className="text-xs font-normal text-slate-400">cars</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSort('most_voted')}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-xs text-left transition-all cursor-pointer ${
            selectedSort === 'most_voted'
              ? 'bg-[#E11D48]/10 border-[#E11D48]/40'
              : 'bg-white dark:bg-[#0F1623] border-slate-200/80 dark:border-[#1A2435] hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">
            Community Upvotes
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono mt-0.5">
            {stats.totalVotes}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSort('highest_hp')}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-xs text-left transition-all cursor-pointer ${
            selectedSort === 'highest_hp'
              ? 'bg-[#E11D48]/10 border-[#E11D48]/40'
              : 'bg-white dark:bg-[#0F1623] border-slate-200/80 dark:border-[#1A2435] hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">
            Peak Output
          </span>
          <div className="text-lg sm:text-xl font-bold text-[#BE123C] dark:text-[#E11D48] tabular-nums font-mono mt-0.5">
            {stats.maxHp} <span className="text-xs font-normal text-slate-400">HP</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSort('best_hp_ton')}
          className={`p-3 sm:p-3.5 rounded-xl border shadow-xs text-left transition-all cursor-pointer ${
            selectedSort === 'best_hp_ton'
              ? 'bg-[#E11D48]/10 border-[#E11D48]/40'
              : 'bg-white dark:bg-[#0F1623] border-slate-200/80 dark:border-[#1A2435] hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">
            Power / Weight
          </span>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono mt-0.5">
            {stats.bestRatio} <span className="text-xs font-normal text-slate-400">HP/t</span>
          </div>
        </button>
      </div>

      {/* 3. Filter Bar (Responsive on Mobile) */}
      <div className="bg-white dark:bg-[#0F1623] rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, chassis, V8, AWD, rear-engine..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Drivetrain and Sort Selectors (Side-by-side on Mobile) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:w-auto">
            <select
              value={selectedDrivetrain}
              onChange={(e) => setSelectedDrivetrain(e.target.value)}
              aria-label="Filter by drivetrain"
              className="w-full sm:w-36 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
            >
              <option value="All">Drivetrain: All</option>
              {DRIVETRAINS.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort vehicles"
              className="w-full sm:w-48 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#0F1623] text-[#BE123C] dark:text-[#E11D48] shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#0F1623] text-[#BE123C] dark:text-[#E11D48] shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Domain Tabs & Presets (Touch-friendly horizontal scroll) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1A2435]">
          {/* Domain Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {DOMAINS.map((domain) => {
              const count = domainCounts[domain.value] || 0;
              const isActive = selectedDomain === domain.value;

              return (
                <button
                  key={domain.value}
                  type="button"
                  onClick={() => setSelectedDomain(domain.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2435]'
                  }`}
                >
                  <span>{domain.label}</span>
                  <span className="ml-1 text-[10px] text-slate-400">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Preset Filter Chips */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar text-xs font-mono">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  selectedPreset === preset.id
                    ? 'bg-[#E11D48]/20 text-[#BE123C] dark:text-[#E11D48] font-bold border border-[#E11D48]/40'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Reset */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Filters:</span>
            {selectedDomain !== 'All' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] text-slate-800 dark:text-slate-200 inline-flex items-center space-x-1">
                <span>{selectedDomain}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDomain('All')} />
              </span>
            )}
            {selectedDrivetrain !== 'All' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] text-slate-800 dark:text-slate-200 inline-flex items-center space-x-1">
                <span>{selectedDrivetrain}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDrivetrain('All')} />
              </span>
            )}
            {selectedPreset !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] text-slate-800 dark:text-slate-200 inline-flex items-center space-x-1">
                <span>{PRESETS.find((p) => p.id === selectedPreset)?.label}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPreset('all')} />
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">{filteredVehicles.length}</strong> matching
            </span>
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[#BE123C] dark:text-[#E11D48] hover:underline cursor-pointer font-bold"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* 4. Fleet Display */}
      {filteredVehicles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-[#0B1220] border-b border-slate-200/80 dark:border-[#1A2435] text-slate-500 font-mono uppercase">
                  <tr>
                    <th className="p-3.5">Machine</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5">Drivetrain</th>
                    <th className="p-3.5">Power</th>
                    <th className="p-3.5">Curb Weight</th>
                    <th className="p-3.5">HP/Ton</th>
                    <th className="p-3.5">0–100</th>
                    <th className="p-3.5">Top Speed</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {filteredVehicles.map((v) => {
                    const hp = v.powertrain?.hp || 0;
                    const weight = v.chassis?.curb_weight_kg || 0;
                    const ratio = weight > 0 ? (hp / (weight / 1000)).toFixed(1) : '—';
                    const inComp = isInCompare(v.slug);

                    return (
                      <tr key={v.slug} className="hover:bg-slate-50/50 dark:hover:bg-[#080D18]/50 transition-colors">
                        <td className="p-3.5">
                          <Link href={`/vehicles/${v.slug}`} className="font-bold text-slate-900 dark:text-white hover:text-[#E11D48] transition-colors">
                            {v.make} {v.model}
                          </Link>
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {v.year} · {v.generation}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {v.domain}
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {v.powertrain?.drivetrain}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {convertPower(hp, v.powertrain?.kw || 0, unitSystem).label}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {convertWeight(weight, unitSystem).label}
                        </td>
                        <td className="p-3.5 font-mono font-black text-[#BE123C] dark:text-[#E11D48]">
                          {ratio} HP/t
                        </td>
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {v.domain_specific?.zero_to_hundred_sec ? `${v.domain_specific.zero_to_hundred_sec} s` : '—'}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {v.domain_specific?.top_speed_kmh ? convertSpeed(v.domain_specific.top_speed_kmh, unitSystem).label : '—'}
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => toggleCompare(v)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                inComp
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                                  : 'bg-slate-100 dark:bg-[#0B1220] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1A2435]'
                              }`}
                            >
                              {inComp ? 'Added' : '+ Compare'}
                            </button>
                            <Link
                              href={`/vehicles/${v.slug}`}
                              className="px-2.5 py-1 rounded-lg bg-[#E11D48]/10 text-[#BE123C] dark:text-[#E11D48] hover:bg-[#E11D48]/20 text-[11px] font-bold"
                            >
                              Specs
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="py-16 sm:py-20 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 sm:p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-6 h-6 text-[#E11D48]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No vehicles match your filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
            Try a different search, change the category, or clear your filters.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono text-white bg-slate-900 dark:bg-black hover:bg-slate-800 border border-slate-700 dark:border-[#E11D48]/40 shadow-xs transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
