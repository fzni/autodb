import React from 'react';
import { getAllVehicles } from '@/lib/db';
import CompareClient from '@/components/CompareClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Side-by-Side Vehicle Telemetry Comparison — AutoDB',
  description:
    'Compare technical specifications, power-to-weight ratios, powertrains, and aerodynamics side by side with real-time telemetry benchmark highlights.',
};

export default async function ComparePage() {
  const allVehicles = getAllVehicles();
  return <CompareClient allVehicles={allVehicles} />;
}
