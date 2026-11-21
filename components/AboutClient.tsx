'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Compass,
  Gauge,
  Scale,
  GitPullRequest,
  KeyRound,
  Sliders,
  Wind,
  HelpCircle,
  Car,
  MessageCircle,
  Sparkles,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const SECTIONS: GuideSection[] = [
  { id: 'overview', title: 'Why AutoDB Exists', shortTitle: 'Overview', icon: Car, tag: 'Philosophy' },
  { id: 'explorer', title: 'Finding & Filtering Machines', shortTitle: 'Explorer', icon: Compass, tag: 'Browse' },
  { id: 'telemetry', title: 'Specs & Power Simulator', shortTitle: 'Telemetry', icon: Gauge, tag: 'Simulator' },
  { id: 'compare', title: 'Side-by-Side Comparison Matrix', shortTitle: 'Compare', icon: Scale, tag: 'Tools' },
  { id: 'contribute', title: 'Proposing Spec Edits & Credits', shortTitle: 'Contribute', icon: GitPullRequest, tag: 'Community' },
  { id: 'keys', title: 'Keys & Garage Collections', shortTitle: 'Security', icon: KeyRound, tag: 'Identity' },
  { id: 'units', title: 'Metric & Imperial Conversion', shortTitle: 'Units', icon: Sliders, tag: 'Preferences' },
  { id: 'faq', title: 'Questions, Costs & Roadmap', shortTitle: 'Pricing & FAQ', icon: HelpCircle, tag: 'FAQ' },
];

export default function AboutClient() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scrollProgress, setScrollProgress] = useState(0);
  const mobilePillsRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);

  // Smooth scroll handler with offset for sticky navbar + subnav
  const scrollTo = (id: string) => {
    setActiveTab(id);
    isClickScrolling.current = true;
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 700);
    }
  };

  // Scroll spy: tracks active section and overall page reading progress
  useEffect(() => {
    const handleScroll = () => {
      // 1. Calculate reading progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setScrollProgress(progress);
      }

      // If user recently clicked a TOC item, avoid scroll jitter
      if (isClickScrolling.current) return;

      // 2. Identify the active section in view
      const scrollPosition = window.scrollY + 140;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = SECTIONS[i];
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveTab(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep active mobile pill centered in view
  useEffect(() => {
    if (mobilePillsRef.current) {
      const activeBtn = mobilePillsRef.current.querySelector<HTMLButtonElement>(`[data-tab="${activeTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeTab);
  const currentSectionNumber = activeIndex >= 0 ? activeIndex + 1 : 1;

  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0B1220] transition-colors">
      {/* Header Banner */}
      <section className="bg-white dark:bg-[#080D18] border-b border-slate-200/80 dark:border-[#1A2435] py-10 sm:py-16 transition-colors relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E11D48]/10 text-[#BE123C] dark:text-[#E11D48] text-xs font-mono font-bold mb-4 border border-[#E11D48]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beta Telemetry · Zero Paywalls For Now</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            About AutoDB & How It Works
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-sans">
            We built AutoDB because we got fed up with automotive sites drowning in pop-up ads, paywalled spec sheets, 
            and conflicting dyno figures. Here is how the database is structured, how our mechanical power simulator works, 
            and how anyone can contribute verified numbers.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-6 border-t border-slate-100 dark:border-[#1A2435] text-xs font-mono text-slate-500">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A2435]">
              Road · Motorsport · Commercial · Concept
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A2435]">
              ECDSA P-256 Auth
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A2435]">
              No Monetization For Now
            </span>
          </div>
        </div>
      </section>

      {/* MOBILE INTERACTIVE TOC STRIP (Sticky under top header) */}
      <div className="sticky top-16 z-30 lg:hidden bg-white/95 dark:bg-[#080D18]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1A2435] py-2 px-3 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 mb-1">
          <span>Table of Contents</span>
          <span className="text-[#E11D48] font-bold">
            {currentSectionNumber} / {SECTIONS.length} ({scrollProgress}%)
          </span>
        </div>
        <div
          ref={mobilePillsRef}
          className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5"
        >
          {SECTIONS.map((sec, idx) => {
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                data-tab={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#E11D48] text-white font-bold shadow-xs scale-100'
                    : 'bg-slate-100 dark:bg-[#0F1623] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-[#1A2435]'
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{sec.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Sticky Sidebar Navigation (Desktop) + Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Jump Sidebar (Sticky Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-3 p-4 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1A2435]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Table of Contents
                </span>
                <span className="text-[11px] font-mono text-[#E11D48] font-bold">
                  {scrollProgress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-[#141B2A] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#E11D48] h-full transition-all duration-150 rounded-full"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              <div className="space-y-1 pt-1">
                {SECTIONS.map((sec, idx) => {
                  const Icon = sec.icon;
                  const isActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollTo(sec.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer group ${
                        isActive
                          ? 'bg-[#E11D48] text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#141B2A] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span
                          className={`text-[10px] font-mono ${
                            isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#E11D48]'}`} />
                        <span className="truncate">{sec.title}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1.5 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1A2435] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Reading: {currentSectionNumber} of 8</span>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Top</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Detailed Content Stream */}
          <main className="lg:col-span-3 space-y-12">
            {/* Section 1: Overview */}
            <section
              id="overview"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Why AutoDB Exists</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Philosophy & Domains</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  01 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  If you have ever tried looking up the actual curb weight or aerodynamic drag of a performance car, 
                  you have probably hit four different forum threads with four contradictory numbers—and five full-screen pop-up ads in between.
                </p>
                <p>
                  AutoDB was started to put an end to that noise. We wanted a fast, ad-free vehicle archive built by car people, 
                  where specs are tied to real manufacturer engineering papers, homologation sheets, or dyno runs.
                </p>
                <p>
                  We organize machines across four distinct operational domains:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase mb-1 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                      <span>Road Vehicles</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Production sports cars, hot hatches, and daily drivers. From the Porsche 911 GT3 to the Civic Type R and Rimac Nevera.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase mb-1 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                      <span>Motorsport Prototypes</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Formula 1, Le Mans WEC Hypercars, and WRC rally machines. Real downforce at speed and race-trim curb weights.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase mb-1 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                      <span>Commercial Machines</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Heavy prime movers, mining dump haulers, and high-torque logistics titans like the Scania R770 V8 and Caterpillar 797F.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase mb-1 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                      <span>Concept & Vision</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Groundbreaking design studies, experimental aerodynamics, and rotary or hybrid demonstrators like the Mazda Furai.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Explorer & Filtering */}
            <section
              id="explorer"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Finding & Filtering Machines</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Search, Presets & Touch Slideshow</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  02 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  The Fleet Explorer on the home page gives you live search controls designed for fast lookups:
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-sans list-disc pl-5">
                  <li>
                    <strong>Smart Search:</strong> Type anything from a make (<em>Porsche</em>), model (<em>911</em>), chassis generation (<em>FL5</em>, <em>992</em>), to engine configuration (<em>V10</em>, <em>Twin-Turbo</em>, <em>Rotary</em>).
                  </li>
                  <li>
                    <strong>Drivetrain Filtering:</strong> Narrow down to Rear-Wheel Drive (RWD), All-Wheel Drive (AWD), Front-Wheel Drive (FWD), or heavy 6x4 and 8x4 layouts.
                  </li>
                  <li>
                    <strong>Preset Filters:</strong> One-tap chips for <em>Sub-1000kg Lightweight</em>, <em>500+ HP High Output</em>, or <em>High Downforce Track Builds</em>.
                  </li>
                  <li>
                    <strong>Top 5 Rated Hero Slideshow:</strong> The homepage highlights the community&apos;s top-voted cars. On phones, swipe left or right with touch gestures to flip between slides; on desktop, hover to pause the slideshow.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Telemetry & Power Simulator */}
            <section
              id="telemetry"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Specs & Power Simulator</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Mechanical Drivetrain Losses & Aero</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  03 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  Factory horsepower numbers are always measured at the engine crankshaft. But tires do not touch the crank—power passes through 
                  the gearbox, transfer case, driveshaft, and differential before reaching the tarmac.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                    <Sliders className="w-4 h-4 text-[#E11D48]" />
                    <span>Crank HP vs. Wheel HP Simulation</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    On every vehicle dossier, you can toggle between <strong>Crank HP</strong> and <strong>Estimated Wheel HP (WHP)</strong>. 
                    Our simulator applies proven mechanical resistance models:
                    <strong> FWD ~12% loss</strong>, <strong> RWD ~15% loss</strong>, and <strong> AWD / 6x4 ~20% loss</strong>.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    You can also slide in <strong>Driver & Fuel Ballast (+kg)</strong> to see the realistic impact on live Power-to-Weight (HP/ton).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                    <Wind className="w-4 h-4 text-[#E11D48]" />
                    <span>Aerodynamic Telemetry & Lift-to-Drag Ratio</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vehicles equipped with wind-tunnel or race data report drag coefficient (C<sub>d</sub>), frontal area (m<sup>2</sup>), 
                    and total downforce generated at designated benchmark speeds (e.g. 200 km/h or 250 km/h).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Compare Matrix */}
            <section
              id="compare"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Side-by-Side Comparison Matrix</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Head-to-Head Benchmarks</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  04 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  At <Link href="/compare" className="text-[#BE123C] dark:text-[#E11D48] font-bold hover:underline">/compare</Link>, 
                  you can stack up to <strong>3 vehicles</strong> side by side:
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-sans list-disc pl-5">
                  <li>
                    <strong>Stat Winner Badges:</strong> The table automatically computes which machine produces the most power, has the lightest curb weight, and achieves the strongest HP/ton, highlighting the winner in green.
                  </li>
                  <li>
                    <strong>Differences Only:</strong> Click <em>&quot;Differences Only&quot;</em> to strip out identical attributes and zero in on what actually separates the cars.
                  </li>
                  <li>
                    <strong>Shareable Comparison URLs:</strong> Selected cars sync into the browser URL (e.g. <code>?v=porsche-911-gt3-992,rimac-nevera</code>) so you can send your comparison link to anyone.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: Proposing Edits & Credits */}
            <section
              id="contribute"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <GitPullRequest className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Proposing Spec Edits & Credits</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Community Corrections & Attribution</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  05 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  No spec sheet is cast in stone. If our recorded curb weight is missing driver fluids, or you have an official manufacturer 
                  datasheet with a more accurate drag coefficient, you can propose a fix right on the page:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-1">
                    <span className="font-mono text-[10px] text-[#E11D48] font-bold">STEP 1</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">Propose from the Dossier</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Click <em>&quot;Propose Spec Revision&quot;</em> on any car, choose the field, enter the corrected figure, and paste your source URL.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-1">
                    <span className="font-mono text-[10px] text-[#E11D48] font-bold">STEP 2</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">Admin Queue & Verification</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Admins are notified via a live notification badge in the Studio dashboard. The admin can verify and adjust the value before approving.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-1">
                    <span className="font-mono text-[10px] text-[#E11D48] font-bold">STEP 3</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">Permanent Contributor Credit</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Once approved, your handle is credited under the vehicle title, permanently stamped into the audit log, and featured on your profile.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Security & Keys */}
            <section
              id="keys"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Keys & Garage Collections</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Cryptographic Keypairs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  06 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  Tired of creating yet another password that gets leaked in a breach? AutoDB uses browser-native 
                  <strong> ECDSA P-256 asymmetric cryptographic keypairs</strong> via the Web Crypto API.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-sans list-disc pl-5">
                  <li>
                    <strong>No Stored Passwords:</strong> Your private key remains securely in your control. You authenticate through cryptographic challenge signatures.
                  </li>
                  <li>
                    <strong>Public Key Fingerprints:</strong> Every member profile at <code>/u/[handle]</code> displays their cryptographic fingerprint, verified badges, and approved contributions.
                  </li>
                  <li>
                    <strong>Garage Collections:</strong> Save your favorite machines into custom lists (e.g. <em>&quot;Track Day Dreams&quot;</em> or <em>&quot;V10 Holy Grail&quot;</em>) to access anytime.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7: Units */}
            <section
              id="units"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Metric & Imperial Conversion</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Global Preferences</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  07 / 08
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <p>
                  Automotive data is notoriously fragmented across units—Europe quotes kW and Nm, North America quotes HP and lb-ft, 
                  and weight bounces between kilograms and pounds.
                </p>
                <p>
                  Click the <strong>SI / IMP</strong> toggle in the navigation header to convert all numbers instantaneously across the entire app. 
                  Your choice persists automatically in local storage.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <span className="text-[10px] text-slate-400 block uppercase">Power</span>
                    <span className="font-bold text-slate-900 dark:text-white">HP ↔ kW</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <span className="text-[10px] text-slate-400 block uppercase">Torque</span>
                    <span className="font-bold text-slate-900 dark:text-white">Nm ↔ lb-ft</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <span className="text-[10px] text-slate-400 block uppercase">Weight</span>
                    <span className="font-bold text-slate-900 dark:text-white">kg ↔ lbs</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435]">
                    <span className="text-[10px] text-slate-400 block uppercase">Speed</span>
                    <span className="font-bold text-slate-900 dark:text-white">km/h ↔ mph</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: FAQ & Monetization Status */}
            <section
              id="faq"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Questions, Costs & Roadmap</h2>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Honest Answers On Monetization</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-[#080D18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2435]">
                  08 / 08
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Specific Monetization Explanation */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Is AutoDB free, or will it cost money?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    AutoDB is not a charity, and building real-time telemetry infrastructure, hosting images, and verifying data costs real money. 
                    However, <strong>we have no monetization options turned on for now</strong>.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    During this active beta phase, everything is open for browsing, comparing, and contributing without paywalls, subscriptions, 
                    paid API keys, or spammy banner ads. If we eventually introduce sustainability features or premium options down the road 
                    (such as verified builder showcases or fleet export tools), the core vehicle specs and community lookups will remain accessible. 
                    For now, there is zero monetization—enjoy full access without entering a card.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    How do you verify the specs listed here?
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Every specification requires a verifiable reference: manufacturer press packs, technical homologation certificates, 
                    or reputable dynamometer runs. When someone submits a correction, administrators verify the source URL before stamping 
                    it into the database.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Can I submit a vehicle that isn&apos;t in the database yet?
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Yes! You can suggest new machines or import full vehicle spec JSON directly through our Discord community or via the Studio portal 
                    if you hold contributor clearance.
                  </p>
                </div>
              </div>

              {/* Call to action card */}
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#080D18] text-white border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold">Have questions or found a discrepancy?</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Join our Discord community or jump straight into exploring the live fleet.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <Link
                      href="/"
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
                    >
                      Explore Fleet
                    </Link>
                    <a
                      href="https://discord.gg/autodb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Discord</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
