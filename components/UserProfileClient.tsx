'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Vehicle, Collection, SpecRevision } from '@/lib/types';
import { useAuth } from './AuthContext';
import VehicleCard from './VehicleCard';
import {
  KeyRound,
  CheckCircle2,
  Mail,
  ShieldAlert,
  Car,
  Bookmark,
  GitPullRequest,
  ArrowUp,
  ArrowLeft,
  Check,
  X,
  Plus,
  Send,
  Lock,
  ExternalLink,
  Trash2,
  FolderOpen,
  Compass,
} from 'lucide-react';

interface UserProfileClientProps {
  profileUser: User;
  submittedVehicles: Vehicle[];
  totalUpvotes: number;
  initialCollections: Collection[];
  pendingRevisions: SpecRevision[];
  isOwner: boolean;
}

export default function UserProfileClient({
  profileUser,
  submittedVehicles,
  totalUpvotes,
  initialCollections,
  pendingRevisions: initialRevisions,
  isOwner,
}: UserProfileClientProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const effectiveIsOwner = Boolean(
    isOwner ||
    (user && (
      user.id === profileUser.id ||
      user.handle.toLowerCase() === profileUser.handle.toLowerCase() ||
      user.role === 'admin'
    ))
  );

  const [activeTab, setActiveTab] = useState<'vehicles' | 'collections' | 'revisions'>('vehicles');
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [revisions, setRevisions] = useState<SpecRevision[]>(initialRevisions);

  // Active Collection View & Management
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [loadingActiveCollection, setLoadingActiveCollection] = useState(false);
  const [collectionFeedback, setCollectionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingColId, setDeletingColId] = useState<string | null>(null);
  const [removingVehicleSlug, setRemovingVehicleSlug] = useState<string | null>(null);

  // Email verification state
  const [emailInput, setEmailInput] = useState(profileUser.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(profileUser.email_verified === 1);

  // Collections form
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [creatingCol, setCreatingCol] = useState(false);

  // Revision review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Send verification code
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSendingVerification(true);
    setEmailFeedback(null);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodeSent(true);
        if (data.devMode && data.code) {
          setDevCode(data.code);
          setVerificationCode(data.code);
        }
        setEmailFeedback({
          type: 'success',
          message: data.devMode && data.code
            ? `Verification code ${data.code} generated in Dev Mode (Auto-filled below).`
            : data.message || 'Verification code dispatched to your inbox!',
        });
      } else {
        setEmailFeedback({ type: 'error', message: data.error || 'Failed to dispatch code' });
      }
    } catch (err: any) {
      setEmailFeedback({ type: 'error', message: err.message || 'Error connecting to server' });
    } finally {
      setSendingVerification(false);
    }
  };

  // Verify 6-digit code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setVerifyingCode(true);
    setEmailFeedback(null);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsVerified(true);
        setCodeSent(false);
        setEmailFeedback({
          type: 'success',
          message: 'Email successfully verified! Verified Contributor badge awarded.',
        });
        if (refreshUser) refreshUser();
      } else {
        setEmailFeedback({ type: 'error', message: data.error || 'Invalid or expired code' });
      }
    } catch (err: any) {
      setEmailFeedback({ type: 'error', message: err.message || 'Error verifying code' });
    } finally {
      setVerifyingCode(false);
    }
  };

  // Refresh collections when authenticated user is owner
  React.useEffect(() => {
    if (effectiveIsOwner && profileUser.id) {
      fetch(`/api/collections?user_id=${profileUser.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.collections) setCollections(data.collections);
        })
        .catch(() => {});
    }
  }, [effectiveIsOwner, profileUser.id]);

  // Create Collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setCreatingCol(true);
    setCollectionFeedback(null);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newColName.trim(),
          description: newColDesc.trim(),
          is_public: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.collection) {
        setCollections((prev) => [{ ...data.collection, items_count: 0 }, ...prev]);
        setNewColName('');
        setNewColDesc('');
        setCollectionFeedback({ type: 'success', message: `Collection "${data.collection.name}" created!` });
      } else {
        setCollectionFeedback({ type: 'error', message: data.error || 'Failed to create collection' });
      }
    } catch (err: any) {
      setCollectionFeedback({ type: 'error', message: err.message || 'Error connecting to server' });
    } finally {
      setCreatingCol(false);
    }
  };

  // Open and load vehicles for a specific collection
  const handleOpenCollection = async (col: Collection) => {
    setActiveCollectionId(col.id);
    setActiveCollection(col);
    setLoadingActiveCollection(true);
    setCollectionFeedback(null);
    try {
      const res = await fetch(`/api/collections/${col.id}`);
      const data = await res.json();
      if (res.ok && data.collection) {
        setActiveCollection(data.collection);
      } else {
        setCollectionFeedback({ type: 'error', message: data.error || 'Failed to load collection vehicles' });
      }
    } catch (err: any) {
      setCollectionFeedback({ type: 'error', message: err.message || 'Error loading collection' });
    } finally {
      setLoadingActiveCollection(false);
    }
  };

  // Delete an entire collection
  const handleDeleteCollection = async (colId: string, colName: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${colName}"?`)) return;
    setDeletingColId(colId);
    setCollectionFeedback(null);
    try {
      const res = await fetch(`/api/collections/${colId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== colId));
        if (activeCollectionId === colId) {
          setActiveCollectionId(null);
          setActiveCollection(null);
        }
        setCollectionFeedback({ type: 'success', message: `Collection "${colName}" deleted.` });
      } else {
        setCollectionFeedback({ type: 'error', message: data.error || 'Could not delete collection' });
      }
    } catch (err: any) {
      setCollectionFeedback({ type: 'error', message: err.message || 'Error deleting collection' });
    } finally {
      setDeletingColId(null);
    }
  };

  // Remove an individual vehicle from the opened collection
  const handleRemoveVehicleFromCollection = async (vehicleSlug: string) => {
    if (!activeCollectionId) return;
    setRemovingVehicleSlug(vehicleSlug);
    setCollectionFeedback(null);
    try {
      const res = await fetch(`/api/collections/${activeCollectionId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_slug: vehicleSlug }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveCollection((prev) => {
          if (!prev) return null;
          const updated = (prev.vehicles || []).filter((v) => v.slug !== vehicleSlug);
          return {
            ...prev,
            vehicles: updated,
            items_count: updated.length,
          };
        });
        setCollections((prev) =>
          prev.map((c) =>
            c.id === activeCollectionId
              ? { ...c, items_count: Math.max(0, (c.items_count || 1) - 1) }
              : c
          )
        );
        setCollectionFeedback({ type: 'success', message: 'Vehicle removed from collection.' });
      } else {
        setCollectionFeedback({ type: 'error', message: data.error || 'Failed to remove vehicle' });
      }
    } catch (err: any) {
      setCollectionFeedback({ type: 'error', message: err.message || 'Error removing vehicle' });
    } finally {
      setRemovingVehicleSlug(null);
    }
  };

  // Review Spec Revision
  const handleReviewRevision = async (id: string, action: 'approved' | 'rejected') => {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/revisions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setRevisions(revisions.filter((r) => r.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to review proposal');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing review');
    } finally {
      setReviewingId(null);
    }
  };

  const fingerprint =
    profileUser.key_fingerprint || 'KEY:HOLDER';

  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* Top Banner */}
      <section className="bg-white dark:bg-[#080D18] border-b border-slate-200/80 dark:border-[#1A2435] py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#E11D48] mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-black text-[#E11D48] border border-slate-800 dark:border-[#E11D48]/40 flex items-center justify-center text-2xl font-black font-mono shadow-xs">
                {profileUser.handle.replace('@', '').charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {profileUser.handle}
                  </h1>

                  {/* Verified Badge */}
                  {isVerified && (
                    <span
                      title="Verified Contributor"
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}

                  {profileUser.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
                      Admin
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-1 text-xs font-mono text-slate-500">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-all">{fingerprint}</span>
                </div>
              </div>
            </div>

            {/* Aggregated Stats */}
            <div className="flex items-center gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] text-center min-w-[90px] sm:min-w-[100px] shadow-xs">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Machines</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {submittedVehicles.length}
                </span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-center min-w-[90px] sm:min-w-[100px] shadow-xs">
                <span className="text-[10px] uppercase font-mono text-[#BE123C] dark:text-[#E11D48] block font-bold">Total Upvotes</span>
                <span className="text-xl font-black text-[#BE123C] dark:text-[#E11D48] font-mono">
                  {totalUpvotes}
                </span>
              </div>
            </div>
          </div>

          {/* Email Verification Banner / Form (Only for owner) */}
          {effectiveIsOwner && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <Mail className="w-4 h-4 text-[#E11D48]" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Email Verification (Layered onto Key Auth)
                  </span>
                </div>
                {isVerified ? (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified ({profileUser.email})</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-amber-500 font-bold">
                    Unverified
                  </span>
                )}
              </div>

              {emailFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono border ${
                    emailFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <p>{emailFeedback.message}</p>
                  {devCode && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <span>Dev Mode Code: <strong className="font-mono text-sm tracking-widest">{devCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setVerificationCode(devCode)}
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isVerified && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Step 1: Request Code / Magic Link */}
                    <form onSubmit={handleSendVerification} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Attach your email..."
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="submit"
                        disabled={sendingVerification || !emailInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-mono font-bold border border-slate-700 dark:border-[#E11D48]/40 shadow-xs disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3 text-[#E11D48]" />
                        <span>{sendingVerification ? 'Sending...' : 'Send Code'}</span>
                      </button>
                    </form>

                    {/* Step 2: Verify 6-digit code */}
                    <form onSubmit={handleVerifyCode} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code..."
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white font-mono tracking-widest text-center font-bold text-sm"
                      />
                      <button
                        type="submit"
                        disabled={verifyingCode || verificationCode.length !== 6}
                        className="px-4 py-2 rounded-xl bg-[#E11D48] text-black text-xs font-mono font-bold hover:bg-[#BE123C] shadow-xs disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{verifyingCode ? 'Verifying...' : 'Verify'}</span>
                      </button>
                    </form>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    💡 <strong>How Verification Works:</strong> AutoDB uses zero passwords. Attaching an email lets you prove identity and earn the green <strong>Verified Contributor</strong> badge. In development without SMTP, verification codes appear directly in your server terminal or auto-populate above. In production, configure SMTP in <code className="text-[#E11D48]">.env</code> to send real emails.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          {/* Profile Navigation Tabs (Responsive Horizontal Scroll) */}
          <div className="flex space-x-2 mt-8 pt-4 border-t border-slate-100 dark:border-[#1A2435] font-mono text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('vehicles')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'vehicles'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Curated Vehicles ({submittedVehicles.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'collections'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Garage Collections ({collections.length})
            </button>

            {effectiveIsOwner && (
              <button
                type="button"
                onClick={() => setActiveTab('revisions')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'revisions'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Review Spec Revisions ({revisions.length})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Tab Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: Vehicles */}
        {activeTab === 'vehicles' && (
          <div>
            {submittedVehicles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs">
                <Car className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                  No vehicles submitted yet
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Vehicles published by this contributor will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {submittedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Garage Collections */}
        {activeTab === 'collections' && (
          <div className="space-y-6">
            {collectionFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-mono border flex items-center justify-between ${
                  collectionFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                }`}
              >
                <span>{collectionFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setCollectionFeedback(null)}
                  className="p-1 hover:opacity-70 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* VIEW A: SPECIFIC OPENED COLLECTION */}
            {activeCollectionId ? (
              <div className="space-y-6">
                {/* Collection View Header */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1A2435]">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCollectionId(null);
                          setActiveCollection(null);
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-[#E11D48] mb-2 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to All Collections</span>
                      </button>
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                              {activeCollection?.name}
                            </h2>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#E11D48]/10 text-[#BE123C] dark:text-[#E11D48] border border-[#E11D48]/20">
                              {activeCollection?.vehicles?.length || 0} {Number(activeCollection?.vehicles?.length) === 1 ? 'machine' : 'machines'}
                            </span>
                          </div>
                          {activeCollection?.description && (
                            <p className="text-xs text-slate-500 mt-1 font-sans">
                              {activeCollection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 self-start sm:self-auto">
                      <Link
                        href="/"
                        className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-[#141B2A] hover:bg-slate-200 dark:hover:bg-[#1A2435] text-slate-800 dark:text-slate-200 transition-colors flex items-center space-x-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span>Add Machines</span>
                      </Link>

                      {effectiveIsOwner && (
                        <button
                          type="button"
                          disabled={deletingColId === activeCollectionId}
                          onClick={() => activeCollection && handleDeleteCollection(activeCollection.id, activeCollection.name)}
                          className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingColId === activeCollectionId ? 'Deleting...' : 'Delete Collection'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicles inside this collection */}
                {loadingActiveCollection ? (
                  <div className="py-16 text-center text-xs font-mono text-slate-400">
                    <div className="w-3 h-3 mx-auto rounded-full bg-[#E11D48] animate-ping mb-3" />
                    <span>Loading vehicles in this garage collection...</span>
                  </div>
                ) : !activeCollection?.vehicles || activeCollection.vehicles.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-3">
                    <Car className="w-10 h-10 mx-auto text-slate-400 mb-1" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                      This collection is empty
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                      Open any vehicle dossier in the Explorer and click &ldquo;Save to Garage&rdquo; to add vehicles to this list.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold font-mono transition-all border border-slate-700 dark:border-[#E11D48]/40 shadow-xs"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span>Explore Fleet</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCollection.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="relative group">
                        <VehicleCard vehicle={vehicle} />
                        {effectiveIsOwner && (
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              disabled={removingVehicleSlug === vehicle.slug}
                              onClick={() => handleRemoveVehicleFromCollection(vehicle.slug)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{removingVehicleSlug === vehicle.slug ? 'Removing...' : 'Remove from list'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* VIEW B: ALL COLLECTIONS CARDS */
              <div className="space-y-6">
                {effectiveIsOwner && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
                      <Plus className="w-4 h-4 text-[#E11D48]" />
                      <span>Create New Garage Collection</span>
                    </div>
                    <form onSubmit={handleCreateCollection} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder="Collection title (e.g. Dream 90s Fleet)..."
                        className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={newColDesc}
                        onChange={(e) => setNewColDesc(e.target.value)}
                        placeholder="Optional description / theme..."
                        className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={creatingCol || !newColName.trim()}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-mono font-bold border border-slate-700 dark:border-[#E11D48]/40 shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span>{creatingCol ? 'Creating...' : 'Create Collection'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {collections.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs">
                    <Bookmark className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                      No Garage Collections Yet
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-sans">
                      Save vehicles to custom bookmarks and shareable fleet lists from any vehicle dossier.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => handleOpenCollection(col)}
                        className="p-5 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] hover:border-[#E11D48]/60 shadow-xs flex flex-col justify-between space-y-4 group transition-all cursor-pointer card-lift"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 truncate">
                              <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0B1220] text-[#E11D48] group-hover:bg-[#E11D48] group-hover:text-white transition-colors shrink-0">
                                <Bookmark className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {col.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#E11D48]/10 text-[#BE123C] dark:text-[#E11D48] border border-[#E11D48]/20 shrink-0">
                              {col.items_count ?? 0} {Number(col.items_count) === 1 ? 'car' : 'cars'}
                            </span>
                          </div>

                          {col.description ? (
                            <p className="text-xs text-slate-500 mt-2 font-sans line-clamp-2">
                              {col.description}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic mt-2 font-sans">
                              Curated fleet list
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-[#1A2435] flex items-center justify-between text-xs font-mono">
                          <span className="text-[11px] text-slate-400">
                            {new Date(col.created_at).toLocaleDateString()}
                          </span>

                          <div className="flex items-center space-x-2">
                            {effectiveIsOwner && (
                              <button
                                type="button"
                                title="Delete collection"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCollection(col.id, col.name);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className="text-[#BE123C] dark:text-[#E11D48] font-semibold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Open Fleet</span>
                              <span>&rarr;</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Spec Revisions Review Panel (Owner/Admin) */}
        {activeTab === 'revisions' && effectiveIsOwner && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  Pending Spec Edit Proposals
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Community telemetry corrections proposed by key-holders for your published vehicles.
                </p>
              </div>
              <GitPullRequest className="w-5 h-5 text-[#E11D48]" />
            </div>

            {revisions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                  All Proposals Reviewed
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  There are no pending telemetry revisions awaiting moderation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/vehicles/${rev.vehicle_slug}`}
                          className="font-bold text-sm text-[#BE123C] dark:text-[#E11D48] hover:underline font-mono"
                        >
                          /{rev.vehicle_slug}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">
                          by <strong className="text-slate-700 dark:text-slate-300">{rev.proposer_handle}</strong>
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200/60 dark:border-[#1A2435] text-xs font-mono">
                      <span className="text-slate-400 block text-[10px] uppercase">Proposed Changes:</span>
                      <pre className="mt-1 text-slate-900 dark:text-white overflow-x-auto">
                        {rev.changes_json}
                      </pre>
                    </div>

                    {rev.change_summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                        <strong>Rationale:</strong> {rev.change_summary}
                      </p>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-[#1A2435]">
                      <button
                        type="button"
                        disabled={reviewingId === rev.id}
                        onClick={() => handleReviewRevision(rev.id, 'rejected')}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={reviewingId === rev.id}
                        onClick={() => handleReviewRevision(rev.id, 'approved')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Apply</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
