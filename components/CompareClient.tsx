'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Vehicle } from '@/lib/types';
import { useCompare } from './CompareContext';
import { useUnits } from './UnitContext';
import {
  convertPower,
  convertTorque,
  convertWeight,
  convertSpeed,
  convertLength,
  convertDisplacement,
} from '@/lib/units';
import {
  Columns,
  Trash2,
  Plus,
  ArrowLeft,
  Scale,
  Zap,
  Weight,
  Check,
  ChevronRight,
  X,
  Search,
  Filter,
  Trophy,
} from 'lucide-react';

interface CompareClientProps {
  allVehicles: Vehicle[];
}

export default function CompareClient({ allVehicles }: CompareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { compareVehicles, removeFromCompare, clearCompare, toggleCompare } = useCompare();
  const { unitSystem } = useUnits();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchPicker, setSearchPicker] = useState('');
  const [highlightDifferencesOnly, setHighlightDifferencesOnly] = useState(false);

  // Sync initial vehicles from URL ?v=slug1,slug2
  const initializedFromUrl = useRef(false);
  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;

    const vParam = searchParams.get('v');
    if (vParam) {
      const slugs = vParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      slugs.forEach((slug) => {
        const matchingVehicle = allVehicles.find((v) => v.slug.toLowerCase() === slug);
        if (matchingVehicle && !compareVehicles.some((cv) => cv.slug === matchingVehicle.slug)) {
          toggleCompare(matchingVehicle);
        }
      });
    }
  }, [searchParams, allVehicles]);

  // Sync selected vehicles to URL ?v=slug1,slug2 without page refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const slugs = compareVehicles.map((v) => v.slug).join(',');
    const newUrl = slugs ? `/compare?v=${slugs}` : '/compare';
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [compareVehicles]);

  const getWinnerIndex = (
    values: (number | null | undefined)[],
    direction: 'higher' | 'lower'
  ): number => {
    let winnerIdx = -1;
    let bestVal = direction === 'higher' ? -Infinity : Infinity;

    values.forEach((v, idx) => {
      if (v === null || v === undefined || isNaN(v) || v <= 0) return;
      if (direction === 'higher') {
        if (v > bestVal) {
          bestVal = v;
          winnerIdx = idx;
        }
      } else {
        if (v < bestVal) {
          bestVal = v;
          winnerIdx = idx;
        }
      }
    });

    return winnerIdx;
  };

  const hpValues = compareVehicles.map((v) => v.powertrain?.hp);
  const hpWinner = getWinnerIndex(hpValues, 'higher');

  const kwValues = compareVehicles.map((v) => v.powertrain?.kw);
  const kwWinner = getWinnerIndex(kwValues, 'higher');

  const torqueValues = compareVehicles.map((v) => v.powertrain?.torque_nm);
  const torqueWinner = getWinnerIndex(torqueValues, 'higher');

  const weightValues = compareVehicles.map((v) => v.chassis?.curb_weight_kg);
  const weightWinner = getWinnerIndex(weightValues, 'lower');

  const zeroToHundredValues = compareVehicles.map((v) => v.domain_specific?.zero_to_hundred_sec);
  const zeroToHundredWinner = getWinnerIndex(zeroToHundredValues, 'lower');

  const topSpeedValues = compareVehicles.map((v) => v.domain_specific?.top_speed_kmh);
  const topSpeedWinner = getWinnerIndex(topSpeedValues, 'higher');

  const redlineValues = compareVehicles.map((v) => v.powertrain?.redline_rpm);
  const redlineWinner = getWinnerIndex(redlineValues, 'higher');

  const ratioValues = compareVehicles.map((v) => {
    const hp = v.powertrain?.hp || 0;
    const w = v.chassis?.curb_weight_kg || 0;
    return w > 0 ? hp / (w / 1000) : 0;
  });
  const ratioWinner = getWinnerIndex(ratioValues, 'higher');

  const availableToAdd = allVehicles.filter(
    (v) => !compareVehicles.some((cv) => cv.slug === v.slug)
  );

  const filteredAvailable = availableToAdd.filter((v) => {
    if (!searchPicker.trim()) return true;
    const q = searchPicker.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.domain.toLowerCase().includes(q)
    );
  });

  // Helper to determine if row has differences across compared vehicles
  const isRowDifferent = (values: any[]) => {
    if (values.length <= 1) return true;
    const first = JSON.stringify(values[0]);
    return values.some((val) => JSON.stringify(val) !== first);
  };

  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* Top Header */}
      <section className="bg-white dark:bg-[#080D18] border-b border-slate-200/80 dark:border-[#1A2435] py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#E11D48] mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to vehicles</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Compare Vehicles
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Side-by-side spec comparison for up to 3 machines. Best numbers highlighted in green.
              </p>
            </div>

            {compareVehicles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Highlight Differences Only Toggle */}
                <button
                  type="button"
                  onClick={() => setHighlightDifferencesOnly(!highlightDifferencesOnly)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                    highlightDifferencesOnly
                      ? 'bg-[#E11D48]/15 border-[#E11D48] text-[#BE123C] dark:text-[#E11D48] font-bold'
                      : 'bg-slate-50 dark:bg-[#0F1623] border-slate-200 dark:border-[#1A2435] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Differences only</span>
                </button>

                {compareVehicles.length < 3 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-black text-white text-xs font-mono font-bold hover:bg-slate-800 transition-all shadow-xs border border-slate-700 dark:border-[#E11D48]/30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>Add ({compareVehicles.length}/3)</span>
                  </button>
                )}

                <button
                  onClick={clearCompare}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A2435] bg-white dark:bg-[#0F1623] text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison View Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {compareVehicles.length === 0 ? (
          /* Empty Compare State */
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] flex items-center justify-center text-slate-500">
              <Scale className="w-6 h-6 text-[#E11D48]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No vehicles selected
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 font-sans">
              Pick vehicles from the fleet or select a matchup below to view side-by-side specs
            </p>

            <div className="max-w-xl mx-auto">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block mb-3 font-semibold">
                Suggested Matchups:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {allVehicles.slice(0, 4).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleCompare(v)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200/80 dark:border-[#1A2435] hover:border-[#E11D48]/60 flex items-center justify-between group transition-all cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] text-[#BE123C] dark:text-[#E11D48] font-semibold font-mono block">
                        {v.domain} · {v.year}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {v.make} {v.model}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        {v.powertrain.hp} HP · {v.chassis.curb_weight_kg} kg
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-[#1A2435] text-slate-700 dark:text-slate-200 group-hover:bg-[#E11D48] group-hover:text-black transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold font-mono inline-flex items-center space-x-1.5 transition-all shadow-xs border border-slate-700 dark:border-[#E11D48]/30"
                >
                  <span>Explore full fleet</span>
                  <ChevronRight className="w-4 h-4 text-[#E11D48]" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Side-by-Side Matrix Table */
          <div className="space-y-6">
            {/* Top Vehicles Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {compareVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] overflow-hidden shadow-xs flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-[#0B1220]">
                    <img
                      src={vehicle.hero_image}
                      alt={vehicle.model}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromCompare(vehicle.slug)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/80 text-white backdrop-blur-xs">
                      {vehicle.year} · {vehicle.domain}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/vehicles/${vehicle.slug}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-[#E11D48] transition-colors line-clamp-1"
                      >
                        {vehicle.make} {vehicle.model}
                      </Link>
                      <span className="text-xs text-slate-500 font-mono">
                        {vehicle.generation}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Spec Matrix */}
            <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[580px]">
                  <thead className="bg-slate-50 dark:bg-[#080D18] border-b border-slate-200/80 dark:border-[#1A2435] text-slate-500 text-xs font-mono uppercase font-semibold">
                    <tr>
                      <th className="p-3.5 w-1/4">Spec</th>
                      {compareVehicles.map((v) => (
                        <th key={v.id} className="p-3.5 text-slate-900 dark:text-white font-bold">
                          {v.make} {v.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {/* Power Output */}
                  {(!highlightDifferencesOnly || isRowDifferent(hpValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Power Output</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = hpWinner === idx;
                        return (
                          <td key={v.id} className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono ${
                                isWinner
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                  : 'text-slate-900 dark:text-white font-semibold'
                              }`}
                            >
                              {convertPower(v.powertrain.hp, v.powertrain.kw, unitSystem).label}
                              {isWinner && <span className="ml-1 text-[10px]">★</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Torque */}
                  {(!highlightDifferencesOnly || isRowDifferent(torqueValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Peak Torque</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = torqueWinner === idx;
                        return (
                          <td key={v.id} className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono ${
                                isWinner
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {convertTorque(v.powertrain.torque_nm, unitSystem).label}
                              {isWinner && <span className="ml-1 text-[10px]">★</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Curb Weight */}
                  {(!highlightDifferencesOnly || isRowDifferent(weightValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Curb Weight</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = weightWinner === idx;
                        return (
                          <td key={v.id} className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono ${
                                isWinner
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {convertWeight(v.chassis.curb_weight_kg, unitSystem).label}
                              {isWinner && <span className="ml-1 text-[10px]">★</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Power-to-Weight */}
                  {(!highlightDifferencesOnly || isRowDifferent(ratioValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Power-to-Weight</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = ratioWinner === idx;
                        const ratio = v.chassis.curb_weight_kg
                          ? (v.powertrain.hp / (v.chassis.curb_weight_kg / 1000)).toFixed(1)
                          : '—';
                        return (
                          <td key={v.id} className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono ${
                                isWinner
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                  : 'text-[#BE123C] dark:text-[#E11D48] font-bold'
                              }`}
                            >
                              {ratio} HP/t
                              {isWinner && <span className="ml-1 text-[10px]">★</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* 0–100 km/h */}
                  {(!highlightDifferencesOnly || isRowDifferent(zeroToHundredValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">0–100 km/h</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = zeroToHundredWinner === idx;
                        const val = v.domain_specific?.zero_to_hundred_sec;
                        return (
                          <td key={v.id} className="p-3.5">
                            {val ? (
                              <span
                                className={`px-2 py-0.5 rounded font-mono ${
                                  isWinner
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {val} s
                                {isWinner && <span className="ml-1 text-[10px]">★</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Top Speed */}
                  {(!highlightDifferencesOnly || isRowDifferent(topSpeedValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Top Speed</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = topSpeedWinner === idx;
                        const val = v.domain_specific?.top_speed_kmh;
                        return (
                          <td key={v.id} className="p-3.5">
                            {val ? (
                              <span
                                className={`px-2 py-0.5 rounded font-mono ${
                                  isWinner
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {convertSpeed(val, unitSystem).label}
                                {isWinner && <span className="ml-1 text-[10px]">★</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Redline RPM */}
                  {(!highlightDifferencesOnly || isRowDifferent(redlineValues)) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Redline</td>
                      {compareVehicles.map((v, idx) => {
                        const isWinner = redlineWinner === idx;
                        const val = v.powertrain?.redline_rpm;
                        return (
                          <td key={v.id} className="p-3.5">
                            {val ? (
                              <span
                                className={`px-2 py-0.5 rounded font-mono ${
                                  isWinner
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {val.toLocaleString()} RPM
                                {isWinner && <span className="ml-1 text-[10px]">★</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Drivetrain */}
                  {(!highlightDifferencesOnly || isRowDifferent(compareVehicles.map((v) => v.powertrain.drivetrain))) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Drivetrain</td>
                      {compareVehicles.map((v) => (
                        <td key={v.id} className="p-3.5 text-slate-900 dark:text-white font-mono font-semibold">
                          {v.powertrain.drivetrain}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Layout */}
                  {(!highlightDifferencesOnly || isRowDifferent(compareVehicles.map((v) => v.powertrain.layout))) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Engine Layout</td>
                      {compareVehicles.map((v) => (
                        <td key={v.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                          {v.powertrain.layout || '—'}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Aspiration */}
                  {(!highlightDifferencesOnly || isRowDifferent(compareVehicles.map((v) => v.powertrain.aspiration))) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Aspiration</td>
                      {compareVehicles.map((v) => (
                        <td key={v.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                          {v.powertrain.aspiration}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Transmission */}
                  {(!highlightDifferencesOnly || isRowDifferent(compareVehicles.map((v) => v.powertrain.transmission))) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Transmission</td>
                      {compareVehicles.map((v) => (
                        <td key={v.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                          {v.powertrain.transmission}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Aerodynamics Drag Coefficient */}
                  {(!highlightDifferencesOnly || isRowDifferent(compareVehicles.map((v) => v.drag_coefficient || v.domain_specific?.drag_coefficient))) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Drag Coefficient (Cd)</td>
                      {compareVehicles.map((v) => {
                        const cd = v.drag_coefficient || v.domain_specific?.drag_coefficient;
                        return (
                          <td key={v.id} className="p-3.5 font-mono text-slate-900 dark:text-white">
                            {cd !== undefined ? `${cd} Cd` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Aerodynamic Downforce */}
                  {(!highlightDifferencesOnly || isRowDifferent(compareVehicles.map((v) => v.downforce_kg || v.domain_specific?.aero_downforce_kg))) && (
                    <tr>
                      <td className="p-3.5 text-slate-500 font-medium">Downforce</td>
                      {compareVehicles.map((v) => {
                        const df = v.downforce_kg || v.domain_specific?.aero_downforce_kg;
                        return (
                          <td key={v.id} className="p-3.5 font-mono text-slate-900 dark:text-white">
                            {df ? `${df} kg` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-2xl p-5 sm:p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <h3 className="font-bold text-base font-mono">Select a vehicle to compare</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchPicker}
                onChange={(e) => setSearchPicker(e.target.value)}
                placeholder="Search by make, model, or category..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-sans"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredAvailable.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    toggleCompare(v);
                    setShowAddModal(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] hover:bg-slate-100 dark:hover:bg-[#1A2435] border border-slate-200/70 dark:border-[#1A2435] flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-[#BE123C] dark:text-[#E11D48] font-semibold font-mono">
                      {v.domain} · {v.year}
                    </span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {v.make} {v.model}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-[#E11D48]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
