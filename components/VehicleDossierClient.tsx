'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Vehicle, Comment, Collection, SpecRevision } from '@/lib/types';
import { useCompare } from './CompareContext';
import { useAuth } from './AuthContext';
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
  Wind,
  ExternalLink,
  GitPullRequest,
  Bookmark,
  Plus,
  X,
  Compass,
} from 'lucide-react';

interface VehicleDossierClientProps {
  vehicle: Vehicle;
  initialComments?: Comment[];
  relatedRivals?: Vehicle[];
  approvedRevisions?: SpecRevision[];
}

export default function VehicleDossierClient({
  vehicle,
  initialComments = [],
  relatedRivals = [],
  approvedRevisions = [],
}: VehicleDossierClientProps) {
  const router = useRouter();
  const { toggleCompare, isInCompare } = useCompare();
  const { user, isAdmin, openAuthModal } = useAuth();
  const { unitSystem } = useUnits();

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

  // Telemetry Simulator State
  const [powerLossMode, setPowerLossMode] = useState<'crank' | 'wheel'>('crank');
  const [ballastKg, setBallastKg] = useState<number>(0);

  // Propose Spec Edit Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionField, setRevisionField] = useState('hp');
  const [revisionValue, setRevisionValue] = useState('');
  const [revisionRationale, setRevisionRationale] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Garage Collection Bookmark State
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [collectionFeedback, setCollectionFeedback] = useState<string | null>(null);

  const inCompare = isInCompare(vehicle.slug);

  // Base Specs
  const hp = vehicle.powertrain?.hp || 0;
  const kw = vehicle.powertrain?.kw || (hp ? Math.round(hp * 0.7457) : 0);
  const torqueNm = vehicle.powertrain?.torque_nm || 0;
  const weightKg = vehicle.chassis?.curb_weight_kg || 0;
  const drivetrain = vehicle.powertrain?.drivetrain?.toUpperCase() || 'RWD';

  // Base Power-to-weight
  const baseHpPerTon = weightKg > 0 ? (hp / (weightKg / 1000)).toFixed(1) : '—';

  // Drivetrain loss ratio for Wheel HP calculation
  // FWD 12%, RWD 15%, AWD/4WD/etc 20%
  const drivetrainLossPct = useMemo(() => {
    if (drivetrain.includes('FWD')) return 12;
    if (drivetrain.includes('AWD') || drivetrain.includes('4WD') || drivetrain.includes('6X')) return 20;
    return 15; // default RWD
  }, [drivetrain]);

  // Live Simulated Telemetry
  const sim = useMemo(() => {
    const effectiveHp = powerLossMode === 'wheel' ? Math.round(hp * (1 - drivetrainLossPct / 100)) : hp;
    const effectiveWeightKg = weightKg + ballastKg;
    const effectiveHpPerTon = effectiveWeightKg > 0 ? (effectiveHp / (effectiveWeightKg / 1000)).toFixed(1) : '0';
    return {
      effectiveHp,
      effectiveKw: Math.round(effectiveHp * 0.7457),
      effectiveWeightKg,
      effectiveHpPerTon,
    };
  }, [hp, weightKg, powerLossMode, drivetrainLossPct, ballastKg]);

  // Aerodynamics & Efficiency Metrics
  const aeroMetrics = useMemo(() => {
    const cd = vehicle.drag_coefficient || vehicle.domain_specific?.drag_coefficient;
    const frontalArea = vehicle.frontal_area_m2;
    const downforceKg = vehicle.downforce_kg || vehicle.domain_specific?.aero_downforce_kg;
    const speedKmh = vehicle.downforce_speed_kmh || 200;

    if (!cd && !downforceKg && !frontalArea) return null;

    const rho = 1.225; // kg/m^3 air density
    const vMs = speedKmh / 3.6;

    // Drag Force = 0.5 * rho * v^2 * Cd * A
    let dragForceN: number | null = null;
    if (cd && frontalArea) {
      dragForceN = Math.round(0.5 * rho * Math.pow(vMs, 2) * cd * frontalArea);
    }

    // Downforce = downforce_kg * 9.80665 N
    let downforceN: number | null = null;
    if (downforceKg) {
      downforceN = Math.round(downforceKg * 9.80665);
    }

    // Lift-to-Drag Ratio (L/D)
    let liftToDragRatio: string | null = null;
    if (dragForceN && downforceN && dragForceN > 0) {
      liftToDragRatio = (downforceN / dragForceN).toFixed(2);
    }

    return {
      cd,
      frontalArea,
      downforceKg,
      speedKmh,
      dragForceN,
      downforceN,
      liftToDragRatio,
    };
  }, [vehicle]);

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

  // Open Collections Modal
  const openCollectionsModal = async () => {
    if (!user) {
      openAuthModal('login', 'Sign in with your secret key to bookmark vehicles in your Garage.');
      return;
    }
    setShowCollectionModal(true);
    setLoadingCollections(true);
    setCollectionFeedback(null);
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (res.ok) {
        setUserCollections(data.collections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Create Collection and Add Vehicle
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.trim(), is_public: true }),
      });
      const data = await res.json();
      if (res.ok && data.collection) {
        // Automatically add current vehicle to newly created collection
        await fetch(`/api/collections/${data.collection.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicle_slug: vehicle.slug }),
        });
        setNewCollectionName('');
        setUserCollections([{ ...data.collection, items_count: 1 }, ...userCollections]);
        setCollectionFeedback(`Saved to "${data.collection.name}"!`);
        setTimeout(() => setShowCollectionModal(false), 1400);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCollection(false);
    }
  };

  // Add Vehicle to Existing Collection
  const handleAddToCollection = async (collectionId: string, collectionName: string) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_slug: vehicle.slug }),
      });
      if (res.ok) {
        setUserCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? { ...c, items_count: (c.items_count || 0) + 1 }
              : c
          )
        );
        setCollectionFeedback(`Added to "${collectionName}"!`);
        setTimeout(() => setShowCollectionModal(false), 1400);
      } else {
        const data = await res.json();
        setCollectionFeedback(data.error || 'Could not add to collection.');
      }
    } catch (err: any) {
      setCollectionFeedback(err.message || 'Error adding vehicle.');
    }
  };

  // Submit Proposed Spec Revision
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Sign in with your secret key to propose spec revisions.');
      return;
    }

    if (!revisionValue.trim() || !revisionRationale.trim()) {
      setRevisionMessage({ type: 'error', text: 'Please fill in both the proposed value and your rationale citation.' });
      return;
    }

    setSubmittingRevision(true);
    setRevisionMessage(null);

    // Build payload changes object
    const changes: Record<string, any> = {};
    if (revisionField === 'hp') {
      changes.powertrain = { ...(vehicle.powertrain || {}), hp: parseFloat(revisionValue) || 0 };
    } else if (revisionField === 'curb_weight_kg') {
      changes.chassis = { ...(vehicle.chassis || {}), curb_weight_kg: parseFloat(revisionValue) || 0 };
    } else if (revisionField === 'source_url') {
      changes.source_url = revisionValue.trim();
    } else if (revisionField === 'drag_coefficient') {
      changes.drag_coefficient = parseFloat(revisionValue) || 0;
    } else if (revisionField === 'downforce_kg') {
      changes.downforce_kg = parseFloat(revisionValue) || 0;
    } else {
      changes[revisionField] = revisionValue.trim();
    }

    try {
      const res = await fetch(`/api/vehicles/${vehicle.slug}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes,
          summary: `${revisionField}: ${revisionValue} — ${revisionRationale.trim()}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRevisionMessage({
          type: 'success',
          text: 'Edit proposed successfully! The creator and admins have been notified for review.',
        });
        setTimeout(() => {
          setShowRevisionModal(false);
          setRevisionValue('');
          setRevisionRationale('');
          setRevisionMessage(null);
        }, 2200);
      } else {
        setRevisionMessage({ type: 'error', text: data.error || 'Failed to submit proposal' });
      }
    } catch (err: any) {
      setRevisionMessage({ type: 'error', text: err.message || 'Error submitting proposal' });
    } finally {
      setSubmittingRevision(false);
    }
  };

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" fill="%23f1f5f9"><rect width="1200" height="600" fill="%23f1f5f9"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="32" fill="%230f172a">${vehicle.make} ${vehicle.model}</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748B">${vehicle.generation} · ${vehicle.year}</text></svg>`;

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Road':
        return <Car className="w-3.5 h-3.5 text-[#E11D48]" />;
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
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* Top Bar Navigation */}
      <div className="border-b border-slate-200/80 dark:border-[#1A2435] bg-white/80 dark:bg-[#080D18]/80 backdrop-blur-md sticky top-16 z-20 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Vehicles</span>
          </Link>

          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar">
            {/* Share Link */}
            <button
              onClick={handleCopyLink}
              title="Copy share link"
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1A2435] bg-white dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors shadow-xs cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Garage Bookmark */}
            <button
              onClick={openCollectionsModal}
              title="Save to garage"
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1A2435] bg-white dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Save</span>
            </button>

            {/* Propose Spec Edit */}
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login', 'Sign in with your secret key to propose spec revisions.');
                  return;
                }
                setShowRevisionModal(true);
              }}
              title="Propose spec correction"
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1A2435] bg-white dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-[#E11D48]" />
              <span className="hidden sm:inline">Propose Edit</span>
              <span className="sm:hidden">Edit</span>
            </button>

            {/* Compare Toggle */}
            <button
              onClick={() => toggleCompare(vehicle)}
              className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                inCompare
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-white dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A2435] hover:border-slate-400'
              }`}
            >
              {inCompare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Added</span>
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
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-[#1A2435]">
                <Link
                  href={`/studio?edit=${vehicle.slug}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#E11D48] text-black text-xs font-bold hover:bg-[#BE123C] transition-colors"
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
        {/* Title, Badge & Primary Upvote Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            {/* Breadcrumb line & Verified Source Citation Badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1A2435] text-slate-700 dark:text-slate-300 font-medium">
                {getDomainIcon(vehicle.domain)}
                <span>{vehicle.domain}</span>
              </span>
              <span>•</span>
              <Link
                href={`/brands?q=${encodeURIComponent(vehicle.make)}`}
                className="hover:text-[#E11D48] transition-colors"
              >
                {vehicle.make}
              </Link>
              <span>•</span>
              <span>{vehicle.sub_category}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{vehicle.year}</span>

              {vehicle.source_url && (
                <a
                  href={vehicle.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-all ml-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Source</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h1>
            <div className="text-xs sm:text-sm text-slate-500 font-mono flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span>
                Generation: <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.generation}</span>
              </span>
              {vehicle.contributor_handle && (
                <span className="text-slate-400">
                  · Curated by <Link href={`/u/${vehicle.contributor_handle.replace('@', '')}`} className="text-[#BE123C] dark:text-[#E11D48] hover:underline font-semibold">{vehicle.contributor_handle}</Link>
                </span>
              )}
              {vehicle.last_edited_by && vehicle.last_edited_by !== vehicle.contributor_handle && (
                <span className="text-slate-400">
                  · Latest edit by <Link href={`/u/${vehicle.last_edited_by.replace('@', '')}`} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">{vehicle.last_edited_by}</Link>
                </span>
              )}
            </div>
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
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                hasVoted
                  ? 'bg-[#E11D48] text-black shadow-md font-bold'
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
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] shadow-sm">
          <img
            src={imgError ? fallbackSvg : vehicle.hero_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Live Converted Numbers Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] text-center shadow-xs">
            <span className="block text-[11px] text-slate-400 uppercase font-sans font-medium">Power</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {convertPower(hp, kw, unitSystem).label}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] text-center shadow-xs">
            <span className="block text-[11px] text-slate-400 uppercase font-sans font-medium">Torque</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {convertTorque(torqueNm, unitSystem).label}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] text-center shadow-xs">
            <span className="block text-[11px] text-slate-400 uppercase font-sans font-medium">Curb weight</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {convertWeight(weightKg, unitSystem).label}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] text-center shadow-xs">
            <span className="block text-[11px] text-slate-400 uppercase font-sans font-medium">Drivetrain</span>
            <span className="text-xl sm:text-2xl font-bold text-[#BE123C] dark:text-[#E11D48]">
              {drivetrain}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-center shadow-xs">
            <span className="block text-[11px] text-[#BE123C] dark:text-[#E11D48] uppercase font-sans font-bold">Power-to-weight</span>
            <span className="text-xl sm:text-2xl font-black text-[#BE123C] dark:text-[#E11D48]">
              {baseHpPerTon} <span className="text-xs font-normal">HP/t</span>
            </span>
          </div>
        </div>

        {/* Feature 4: Interactive Power & Weight Simulator */}
        <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435] gap-2">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-[#E11D48]" />
              <div>
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                  Power & Weight Simulator
                </h3>
                <p className="text-[11px] text-slate-500 font-sans">
                  Calculate drivetrain parasitic drag loss and real-world payload ballast dynamics.
                </p>
              </div>
            </div>

            {/* Mode Toggle: Crank HP vs Wheel HP */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs font-mono font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPowerLossMode('crank')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  powerLossMode === 'crank'
                    ? 'bg-white dark:bg-[#0F1623] text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Crank HP
              </button>
              <button
                type="button"
                onClick={() => setPowerLossMode('wheel')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  powerLossMode === 'wheel'
                    ? 'bg-[#E11D48] text-black shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Estimated Wheel HP (-{drivetrainLossPct}%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Controls: Ballast Slider & Presets */}
            <div className="md:col-span-2 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">
                  Driver, Passenger & Fuel Ballast:
                </span>
                <span className="font-bold text-[#BE123C] dark:text-[#E11D48]">
                  +{ballastKg} kg ({Math.round(ballastKg * 2.20462)} lbs)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={ballastKg}
                onChange={(e) => setBallastKg(parseInt(e.target.value) || 0)}
                className="w-full accent-[#E11D48] cursor-pointer"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                {[
                  { label: 'Dry Curb (0 kg)', val: 0 },
                  { label: 'Solo Driver (+80 kg)', val: 80 },
                  { label: 'Driver + Fuel (+120 kg)', val: 120 },
                  { label: 'Full Cabin (+220 kg)', val: 220 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setBallastKg(preset.val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      ballastKg === preset.val
                        ? 'bg-[#E11D48]/20 text-[#BE123C] dark:text-[#E11D48] border border-[#E11D48]/40 font-bold'
                        : 'bg-slate-100 dark:bg-[#0B1220] text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1A2435]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Recalculated Output Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] space-y-3 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Effective Power</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {sim.effectiveHp} HP <span className="text-xs text-slate-400 font-normal">({sim.effectiveKw} kW)</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Simulated Weight</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {convertWeight(sim.effectiveWeightKg, unitSystem).label}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1A2435]">
                <span className="text-[10px] text-[#BE123C] dark:text-[#E11D48] uppercase font-bold block">Live Power-to-Weight</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-[#BE123C] dark:text-[#E11D48]">
                    {sim.effectiveHpPerTon}
                  </span>
                  <span className="text-xs text-slate-400">HP/t</span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    (Base: {baseHpPerTon})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Aerodynamics Card (shown when aero data is present) */}
        {aeroMetrics && (
          <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-[#E11D48]" />
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                  Aerodynamics
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">CFD & Homologation Wind-Tunnel Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              {aeroMetrics.downforceKg !== undefined && aeroMetrics.downforceKg > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Peak Downforce</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {aeroMetrics.downforceKg} kg
                  </span>
                  <span className="text-[10px] text-slate-500 block">@ {aeroMetrics.speedKmh} km/h</span>
                </div>
              )}

              {aeroMetrics.cd !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Drag Coefficient</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {aeroMetrics.cd} Cd
                  </span>
                </div>
              )}

              {aeroMetrics.frontalArea !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Frontal Area (A)</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {aeroMetrics.frontalArea} m²
                  </span>
                </div>
              )}

              {aeroMetrics.liftToDragRatio && (
                <div className="p-3.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30">
                  <span className="text-[10px] text-[#BE123C] dark:text-[#E11D48] uppercase font-bold block font-sans">Lift-to-Drag (L/D)</span>
                  <span className="text-lg font-black text-[#BE123C] dark:text-[#E11D48]">
                    {aeroMetrics.liftToDragRatio}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Aero Efficiency</span>
                </div>
              )}
            </div>

            {aeroMetrics.dragForceN && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/60 dark:border-[#1A2435] flex flex-wrap items-center justify-between text-xs font-mono text-slate-500">
                <span>Calculated Drag Resistance: <strong className="text-slate-900 dark:text-white">{aeroMetrics.dragForceN} N</strong> @ {aeroMetrics.speedKmh} km/h</span>
                {aeroMetrics.downforceN && <span>Aerodynamic Downforce: <strong className="text-slate-900 dark:text-white">{aeroMetrics.downforceN} N</strong></span>}
              </div>
            )}
          </div>
        )}

        {/* Overview Description */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] space-y-2 shadow-xs">
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
          <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <Zap className="w-4 h-4 text-[#E11D48]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                Powertrain & Architecture
              </h3>
            </div>

            <table className="w-full text-xs font-sans">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-2.5 text-slate-500 w-1/3">Engine / Motor</td>
                  <td className="py-2.5 text-slate-900 dark:text-white font-medium">
                    {vehicle.powertrain?.engine_type || '—'}
                  </td>
                </tr>
                {vehicle.powertrain?.displacement_l !== undefined && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Displacement</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-mono">
                      {convertDisplacement(vehicle.powertrain.displacement_l, unitSystem).label}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 text-slate-500">Layout</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">
                    {vehicle.powertrain?.layout ? (
                      <Link
                        href={`/?query=${encodeURIComponent(vehicle.powertrain.layout)}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B1220] text-slate-700 dark:text-slate-300 hover:text-[#E11D48] font-mono text-[11px] transition-colors"
                      >
                        {vehicle.powertrain.layout}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Aspiration</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.aspiration || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Output</td>
                  <td className="py-2.5 font-mono text-[#BE123C] dark:text-[#E11D48] font-bold">
                    {convertPower(hp, kw, unitSystem).label} ({kw} kW)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Torque</td>
                  <td className="py-2.5 font-mono text-slate-900 dark:text-white font-semibold">
                    {convertTorque(torqueNm, unitSystem).label}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Transmission</td>
                  <td className="py-2.5 text-slate-900 dark:text-white">{vehicle.powertrain?.transmission || '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500">Drivetrain</td>
                  <td className="py-2.5 font-mono text-[#BE123C] dark:text-[#E11D48] font-bold">
                    <Link
                      href={`/?query=${encodeURIComponent(vehicle.powertrain?.drivetrain || '')}`}
                      className="hover:underline"
                    >
                      {vehicle.powertrain?.drivetrain || '—'}
                    </Link>
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
                    <td className="py-2.5 font-mono text-[#BE123C] dark:text-[#E11D48] font-bold">
                      {vehicle.powertrain.battery_kwh} kWh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 2. Chassis Specs */}
          <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <Weight className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                Chassis & Dimensions
              </h3>
            </div>

            <table className="w-full text-xs font-sans">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-2.5 text-slate-500 w-1/3">Curb weight</td>
                  <td className="py-2.5 font-mono text-slate-900 dark:text-white font-semibold">
                    {convertWeight(weightKg, unitSystem).label}
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
                      {vehicle.chassis?.length_mm ? convertLength(vehicle.chassis.length_mm, unitSystem).label : '—'} ×{' '}
                      {vehicle.chassis?.width_mm ? convertLength(vehicle.chassis.width_mm, unitSystem).label : '—'} ×{' '}
                      {vehicle.chassis?.height_mm ? convertLength(vehicle.chassis.height_mm, unitSystem).label : '—'}
                    </td>
                  </tr>
                )}
                {vehicle.chassis?.wheelbase_mm && (
                  <tr>
                    <td className="py-2.5 text-slate-500">Wheelbase</td>
                    <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                      {convertLength(vehicle.chassis.wheelbase_mm, unitSystem).label}
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

        {/* 3. Category-Specific Specs */}
        {vehicle.domain_specific && Object.keys(vehicle.domain_specific).length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <Sliders className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                {vehicle.domain} Domain Specifics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              {vehicle.domain_specific.zero_to_hundred_sec !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">0–100 km/h (0–62 mph)</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {vehicle.domain_specific.zero_to_hundred_sec} s
                  </span>
                </div>
              )}

              {vehicle.domain_specific.top_speed_kmh !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">Top speed</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {convertSpeed(vehicle.domain_specific.top_speed_kmh, unitSystem).label}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.drag_coefficient !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">Drag coefficient (Cd)</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {vehicle.domain_specific.drag_coefficient}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.payload_capacity_kg !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">Payload capacity</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {convertWeight(vehicle.domain_specific.payload_capacity_kg, unitSystem).label}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.towing_capacity_kg !== undefined && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">Towing capacity</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {convertWeight(vehicle.domain_specific.towing_capacity_kg, unitSystem).label}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.status && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">Production status</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                    {vehicle.domain_specific.status}
                  </span>
                </div>
              )}

              {vehicle.domain_specific.signature_feature && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-100 dark:border-[#1A2435]">
                  <span className="block text-slate-500 mb-0.5 font-sans">Signature feature</span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-sans">
                    {vehicle.domain_specific.signature_feature}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature 4: Related Rivals Section */}
        {relatedRivals && relatedRivals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                  Related Rivals
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Machines in the {vehicle.domain} domain with comparable power-to-weight (±20%)
                </p>
              </div>
              <Compass className="w-5 h-5 text-[#E11D48]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedRivals.map((rival) => {
                const rivalHp = rival.powertrain?.hp || 0;
                const rivalWeight = rival.chassis?.curb_weight_kg || 0;
                const rivalRatio = rivalWeight > 0 ? (rivalHp / (rivalWeight / 1000)).toFixed(1) : '—';
                const rivalInCompare = isInCompare(rival.slug);

                return (
                  <div
                    key={rival.slug}
                    className="group rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] overflow-hidden shadow-xs hover:border-[#E11D48]/50 transition-all flex flex-col"
                  >
                    <Link href={`/vehicles/${rival.slug}`} className="relative aspect-video block overflow-hidden bg-slate-100 dark:bg-[#0B1220]">
                      <img
                        src={rival.hero_image}
                        alt={`${rival.make} ${rival.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-[#E11D48] font-bold">
                        {rivalRatio} HP/t
                      </span>
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {rival.year} · {rival.powertrain?.drivetrain}
                        </span>
                        <Link
                          href={`/vehicles/${rival.slug}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#E11D48] transition-colors line-clamp-1"
                        >
                          {rival.make} {rival.model}
                        </Link>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1A2435] text-xs font-mono">
                        <span className="text-slate-500">
                          {rivalHp} HP · {rivalWeight} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCompare(rival)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            rivalInCompare
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                              : 'bg-slate-100 dark:bg-[#0B1220] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {rivalInCompare ? 'Added' : '+ Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contributors & Verified Revision History Section */}
        <div className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1A2435] gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Contributors & Spec History
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Community-curated & verified engineering telemetry
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login', 'Sign in with your secret key to propose spec revisions.');
                  return;
                }
                setShowRevisionModal(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A2435] bg-slate-50 dark:bg-[#0B1220] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>+ Propose Correction</span>
            </button>
          </div>

          {/* Contributors List */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-mono text-slate-400 block font-semibold">
              Credited Contributors
            </span>
            <div className="flex flex-wrap gap-2">
              {/* Creator */}
              {vehicle.contributor_handle && (
                <Link
                  href={`/u/${vehicle.contributor_handle.replace('@', '')}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] hover:border-[#E11D48]/40 text-xs font-mono transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                  <span className="font-bold text-slate-900 dark:text-white">{vehicle.contributor_handle}</span>
                  <span className="text-[10px] text-slate-400">(Creator)</span>
                </Link>
              )}

              {/* Additional Contributors */}
              {vehicle.contributors &&
                vehicle.contributors
                  .filter((c) => c !== vehicle.contributor_handle)
                  .map((c) => (
                    <Link
                      key={c}
                      href={`/u/${c.replace('@', '')}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] hover:border-emerald-500/40 text-xs font-mono transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{c}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(Contributor)</span>
                    </Link>
                  ))}
            </div>
          </div>

          {/* Approved Spec Edits Timeline */}
          {approvedRevisions && approvedRevisions.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-[#1A2435] space-y-2.5">
              <span className="text-[11px] uppercase font-mono text-slate-400 block font-semibold">
                Approved Spec Revisions ({approvedRevisions.length})
              </span>
              <div className="space-y-2">
                {approvedRevisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200/80 dark:border-[#1A2435] text-xs space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{rev.change_summary}</span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(rev.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center space-x-1 pt-0.5">
                      <span>Proposed by</span>
                      <Link
                        href={`/u/${rev.proposer_handle.replace('@', '')}`}
                        className="text-[#BE123C] dark:text-[#E11D48] font-semibold hover:underline"
                      >
                        {rev.proposer_handle}
                      </Link>
                      {rev.reviewer_handle && (
                        <>
                          <span>· Approved by</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {rev.reviewer_handle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Social Discussion & Comments Section */}
        <div id="comments" className="rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1A2435]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E11D48]/15 flex items-center justify-center text-[#BE123C] dark:text-[#E11D48]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Discussion
                </h3>
                <p className="text-xs text-slate-500 font-mono">
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
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {user.handle}
                </span>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your driving impressions, lap times, dyno sheets, or thoughts..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48] resize-none leading-relaxed font-sans"
                />
              </div>

              {commentError && (
                <p className="text-xs text-rose-500 font-mono">{commentError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postingComment || !newComment.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingComment ? 'Posting...' : 'Comment'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200/70 dark:border-[#1A2435] text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-sans">
                Sign in with your secret key to join the discussion.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('login', 'Sign in with your secret key to leave a comment.')}
                className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition-all shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in to comment</span>
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.length > 0 ? (
              comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="flex items-start space-x-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#1A2435] text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {cmt.author_name.replace('@', '').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {cmt.author_name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
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
              <p className="text-xs text-slate-400 italic text-center py-4 font-sans">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Propose Spec Revision */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1A2435] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4 text-[#E11D48]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  Propose Spec Correction
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="p-6 space-y-4 text-xs">
              {revisionMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono ${
                    revisionMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {revisionMessage.text}
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-mono uppercase mb-1">
                  Parameter to Correct
                </label>
                <select
                  value={revisionField}
                  onChange={(e) => setRevisionField(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white font-mono"
                >
                  <option value="hp">Horsepower (HP)</option>
                  <option value="curb_weight_kg">Curb Weight (kg)</option>
                  <option value="downforce_kg">Downforce (kg)</option>
                  <option value="drag_coefficient">Drag Coefficient (Cd)</option>
                  <option value="source_url">Verified Source Citation URL</option>
                  <option value="summary">Summary / Background</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-mono uppercase mb-1">
                  Proposed Value *
                </label>
                <input
                  type="text"
                  required
                  value={revisionValue}
                  onChange={(e) => setRevisionValue(e.target.value)}
                  placeholder="e.g. 525, 1430, 0.35, or URL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-mono uppercase mb-1">
                  Citation / Rationale *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisionRationale}
                  onChange={(e) => setRevisionRationale(e.target.value)}
                  placeholder="Provide reference URL or explain why this figure is more accurate..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1A2435]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRevision}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white font-bold border border-slate-700 dark:border-[#E11D48]/40 shadow-xs disabled:opacity-50"
                >
                  {submittingRevision ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Garage Bookmark / Add to Collection */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1A2435] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  Save to Garage Collections
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCollectionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              {collectionFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs">
                  {collectionFeedback}
                </div>
              )}

              {loadingCollections ? (
                <p className="text-slate-400 font-mono py-4 text-center">Loading collections...</p>
              ) : userCollections.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Your Collections</span>
                  {userCollections.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleAddToCollection(col.id, col.name)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] hover:bg-slate-100 dark:hover:bg-[#1A2435] border border-slate-200 dark:border-[#1A2435] text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{col.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{col.items_count ?? 0} cars</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No collections yet. Create your first list below!</p>
              )}

              {/* Create new collection inline */}
              <form onSubmit={handleCreateCollection} className="pt-3 border-t border-slate-100 dark:border-[#1A2435] space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Create New List</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g. Dream Track Garage, V10 Icons..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white text-xs font-sans"
                  />
                  <button
                    type="submit"
                    disabled={creatingCollection || !newCollectionName.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white font-bold border border-slate-700 dark:border-[#E11D48]/40 shadow-xs flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>Create & Add</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
