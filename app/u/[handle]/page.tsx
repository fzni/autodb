import React from 'react';
import { notFound } from 'next/navigation';
import {
  getUserByHandle,
  getOrCreateAdminUser,
  getAllVehicles,
  getPublicCollectionsByUserId,
  getUserCollections,
  getSpecRevisions,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import UserProfileClient from '@/components/UserProfileClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    handle: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cleanHandle = decodeURIComponent(params.handle).replace(/^@/, '');
  const user = getUserByHandle(cleanHandle) || (cleanHandle.toLowerCase() === 'admin' ? getOrCreateAdminUser() : null);

  if (!user) {
    return {
      title: 'Contributor Not Found — AutoDB',
    };
  }

  const title = `${user.handle} Telemetry Contributor — AutoDB`;
  const description = `Key-authenticated contributor profile for ${user.handle} on AutoDB Precision Telemetry.`;
  const url = `https://autodb.tech/u/${cleanHandle}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'AutoDB Precision Telemetry',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const cleanHandle = decodeURIComponent(params.handle).replace(/^@/, '');
  let targetUser = getUserByHandle(cleanHandle);

  if (!targetUser && cleanHandle.toLowerCase() === 'admin') {
    targetUser = getOrCreateAdminUser();
  }

  if (!targetUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser && (currentUser.id === targetUser.id || currentUser.handle.toLowerCase() === targetUser.handle.toLowerCase());

  // Vehicles submitted by this contributor
  const allVehicles = getAllVehicles();
  const submittedVehicles = allVehicles.filter(
    (v) =>
      (v.contributor_handle && v.contributor_handle.toLowerCase() === targetUser.handle.toLowerCase()) ||
      (v.contributor_fingerprint && v.contributor_fingerprint === targetUser.key_fingerprint)
  );

  const totalUpvotes = submittedVehicles.reduce((acc, v) => acc + (v.votes_count || 0), 0);

  // Collections (owner sees private too, public visitors see public only)
  const collections = isOwner
    ? getUserCollections(targetUser.id)
    : getPublicCollectionsByUserId(targetUser.id);

  // Pending spec revisions to review
  const ownedVehicleSlugs = new Set(submittedVehicles.map((v) => v.slug));
  const allRevisions = getSpecRevisions();
  const pendingRevisions = allRevisions.filter(
    (r) => r.status === 'pending' && (ownedVehicleSlugs.has(r.vehicle_slug) || targetUser.role === 'admin')
  );

  return (
    <UserProfileClient
      profileUser={targetUser}
      submittedVehicles={submittedVehicles}
      totalUpvotes={totalUpvotes}
      initialCollections={collections}
      pendingRevisions={pendingRevisions}
      isOwner={Boolean(isOwner)}
    />
  );
}
