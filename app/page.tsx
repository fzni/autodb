import React from 'react';
import { getAllVehicles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import HomeExplorerClient from '@/components/HomeExplorerClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const currentUser = getCurrentUser();
  const vehicles = getAllVehicles(undefined, currentUser?.id);

  return <HomeExplorerClient initialVehicles={vehicles} />;
}
