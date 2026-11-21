'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BrandSummary, Domain } from '@/lib/types';
import { Search, Compass, ChevronRight, Layers, ArrowLeft } from 'lucide-react';

interface BrandsClientProps {
  brands: BrandSummary[];
}

const DOMAINS: (Domain | 'All')[] = ['All', 'Road', 'Motorsport', 'Commercial', 'Concept'];

export default function BrandsClient({ brands }: BrandsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesSearch = b.make.toLowerCase().includes(search.toLowerCase().trim());
      const matchesDomain =
        selectedDomain === 'All' || (b.domains && b.domains.includes(selectedDomain));
      return matchesSearch && matchesDomain;
    });
  }, [brands, search, selectedDomain]);

  const totalVehiclesCount = useMemo(() => {
    return brands.reduce((acc, b) => acc + b.count, 0);
  }, [brands]);

  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* Top Banner */}
      <section className="bg-white dark:bg-[#080D18] border-b border-slate-200/80 dark:border-[#1A2435] py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#E11D48] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Manufacturer Directory
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {brands.length} marques · {totalVehiclesCount} catalogued machines
              </p>
            </div>

            {/* Live Filter Controls */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search marque..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-sans"
              />
            </div>
          </div>

          {/* Domain Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-[#1A2435]">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedDomain === domain
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-[#0F1623] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1A2435]'
                }`}
              >
                {domain} {domain !== 'All' ? 'Domain' : 'Marques'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Grid Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs">
            <Compass className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
              No matching marques found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or domain category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.make}
                href={`/?make=${encodeURIComponent(brand.make)}`}
                className="group rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] overflow-hidden shadow-xs hover:border-[#E11D48]/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {brand.hero_image && (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-[#080D18]">
                    <img
                      src={brand.hero_image}
                      alt={brand.make}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 font-black text-white text-base tracking-tight">
                      {brand.make}
                    </span>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {!brand.hero_image && (
                    <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">
                      {brand.make}
                    </span>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {brand.domains.map((dom) => (
                      <span
                        key={dom}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-[#0B1220] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-[#1A2435]"
                      >
                        {dom}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1A2435] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#BE123C] dark:text-[#E11D48] font-bold">
                      {brand.count} {brand.count === 1 ? 'vehicle' : 'vehicles'}
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white flex items-center space-x-0.5 transition-colors">
                      <span>View fleet</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
