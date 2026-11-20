'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import { useCompare } from './CompareContext';
import {
  Columns,
  Trash2,
  Plus,
  ArrowLeft,
  Scale,
  Zap,
  Weight,
  Gauge,
  Check,
  ChevronRight,
  X,
  Search,
} from 'lucide-react';

interface CompareClientProps {
  allVehicles: Vehicle[];
}

export default function CompareClient({ allVehicles }: CompareClientProps) {
  const { compareVehicles, removeFromCompare, clearCompare, toggleCompare } = useCompare();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchPicker, setSearchPicker] = useState('');

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

  return (
    <div className="min-h-screen pb-20">
      {/* Top Header */}
      <section className="bg-white dark:bg-[#0A0E17] border-b border-slate-200/80 dark:border-[#1E293B] py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#31bacc] mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Explorer</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#31bacc]/10 border border-[#31bacc]/30 text-[#177f8d] dark:text-[#31bacc]">
                  <Columns className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Side-by-Side Telemetry Comparison
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Benchmarking up to 3 machines · Benchmark leaders highlighted in Emerald
                  </p>
                </div>
              </div>
            </div>

            {compareVehicles.length > 0 && (
              <div className="flex items-center space-x-2.5">
                {compareVehicles.length < 3 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-black dark:hover:bg-[#151D2E] text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-[#31bacc]" />
                    <span>Add Machine ({compareVehicles.length}/3)</span>
                  </button>
                )}
                <button
                  onClick={clearCompare}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison View Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {compareVehicles.length === 0 ? (
          /* Empty Compare State */
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#31bacc]/10 border border-[#31bacc]/30 flex items-center justify-center text-[#177f8d] dark:text-[#31bacc]">
              <Scale className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No vehicles selected for comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-sans">
              Click &quot;+ Compare&quot; on any card in the Explorer or choose from suggested matchups below.
            </p>

            <div className="max-w-2xl mx-auto">
              <span className="text-xs font-mono uppercase text-[#31bacc] block mb-4 font-bold">
                Suggested Matchups:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {allVehicles.slice(0, 4).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleCompare(v)}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200/80 dark:border-[#1E293B] hover:border-[#31bacc]/60 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#177f8d] dark:text-[#31bacc] block font-bold">
                        {v.domain} · {v.year}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#31bacc]">
                        {v.make} {v.model}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        {v.powertrain.hp} HP · {v.chassis.curb_weight_kg} kg
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#31bacc]/15 text-[#177f8d] dark:text-[#31bacc] group-hover:bg-[#31bacc] group-hover:text-black transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-black text-white hover:bg-slate-800 text-xs font-bold uppercase inline-flex items-center space-x-2 transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-xs"
                >
                  <span>Browse Vehicle Fleet</span>
                  <ChevronRight className="w-4 h-4 text-[#31bacc]" />
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
                  className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-[#0A0E17]">
                    <img
                      src={vehicle.hero_image}
                      alt={vehicle.model}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromCompare(vehicle.slug)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-white">
                      {vehicle.year} · {vehicle.domain}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/vehicles/${vehicle.slug}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-[#31bacc] transition-colors line-clamp-1"
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
            <div className="rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#0A0E17] border-b border-slate-200/80 dark:border-[#1E293B] text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5 w-1/4">Telemetry Metric</th>
                    {compareVehicles.map((v) => (
                      <th key={v.id} className="p-3.5 text-slate-900 dark:text-white font-bold">
                        {v.make} {v.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/70 font-mono">
                  {/* Power Output HP */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Power Output (HP)</td>
                    {compareVehicles.map((v, idx) => {
                      const isWinner = hpWinner === idx;
                      return (
                        <td key={v.id} className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isWinner
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {v.powertrain.hp} HP
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Kilowatts */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Kilowatts (kW)</td>
                    {compareVehicles.map((v, idx) => {
                      const isWinner = kwWinner === idx;
                      return (
                        <td key={v.id} className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isWinner
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {v.powertrain.kw} kW
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Torque */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Peak Torque (Nm)</td>
                    {compareVehicles.map((v, idx) => {
                      const isWinner = torqueWinner === idx;
                      return (
                        <td key={v.id} className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isWinner
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {v.powertrain.torque_nm} Nm
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Curb Weight */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Curb Weight</td>
                    {compareVehicles.map((v, idx) => {
                      const isWinner = weightWinner === idx;
                      return (
                        <td key={v.id} className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isWinner
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {v.chassis.curb_weight_kg.toLocaleString()} kg
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Power-to-Weight HP/Ton */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Power-to-Weight (HP/Ton)</td>
                    {compareVehicles.map((v, idx) => {
                      const isWinner = ratioWinner === idx;
                      const ratio = v.chassis.curb_weight_kg
                        ? (v.powertrain.hp / (v.chassis.curb_weight_kg / 1000)).toFixed(1)
                        : '—';
                      return (
                        <td key={v.id} className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-black ${
                              isWinner
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-[#177f8d] dark:text-[#31bacc]'
                            }`}
                          >
                            {ratio} HP/t
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Drivetrain */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Drivetrain</td>
                    {compareVehicles.map((v) => (
                      <td key={v.id} className="p-3.5 text-slate-900 dark:text-white font-bold">
                        {v.powertrain.drivetrain}
                      </td>
                    ))}
                  </tr>

                  {/* Aspiration */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Aspiration</td>
                    {compareVehicles.map((v) => (
                      <td key={v.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                        {v.powertrain.aspiration}
                      </td>
                    ))}
                  </tr>

                  {/* Transmission */}
                  <tr>
                    <td className="p-3.5 text-slate-500 font-sans font-medium">Transmission</td>
                    {compareVehicles.map((v) => (
                      <td key={v.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                        {v.powertrain.transmission}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-2xl p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1E293B]">
              <h3 className="font-bold text-base">Select Vehicle to Compare</h3>
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
                placeholder="Search fleet..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
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
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] hover:bg-slate-100 dark:hover:bg-[#151D2E] border border-slate-200/70 dark:border-[#1E293B] flex items-center justify-between transition-colors text-left"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#31bacc] font-bold">
                      {v.domain} · {v.year}
                    </span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {v.make} {v.model}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-[#31bacc]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
